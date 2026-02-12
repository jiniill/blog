#!/usr/bin/env bash
#
# auto-push.sh - Watch content/posts/ for changes and auto-commit+push.
#
# Usage:
#   ./scripts/auto-push.sh          # Start watching (foreground)
#   ./scripts/auto-push.sh &        # Start watching (background)
#   ./scripts/auto-push.sh stop     # Stop a running background instance
#
# Uses inotifywait if available, otherwise falls back to git-status polling.

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
BLOG_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WATCH_DIR="content/posts"
WATCH_PATH="${BLOG_ROOT}/${WATCH_DIR}"
PIDFILE="${BLOG_ROOT}/.auto-push.pid"
DEBOUNCE_SECONDS=5
POLL_INTERVAL=3
BRANCH="main"
REMOTE="origin"

# ── Colors / helpers ───────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()   { printf "${CYAN}[auto-push %s]${RESET} %s\n" "$(date '+%H:%M:%S')" "$*"; }
warn()  { printf "${YELLOW}[auto-push %s]${RESET} %s\n" "$(date '+%H:%M:%S')" "$*"; }
err()   { printf "${RED}[auto-push %s]${RESET} %s\n" "$(date '+%H:%M:%S')" "$*" >&2; }
ok()    { printf "${GREEN}[auto-push %s]${RESET} %s\n" "$(date '+%H:%M:%S')" "$*"; }

# ── Stop subcommand ───────────────────────────────────────────────────────────
if [[ "${1:-}" == "stop" ]]; then
    if [[ -f "$PIDFILE" ]]; then
        PID=$(cat "$PIDFILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "Stopping auto-push (PID $PID)..."
            kill "$PID"
            rm -f "$PIDFILE"
            ok "Stopped."
        else
            warn "PID $PID is not running. Cleaning up stale pidfile."
            rm -f "$PIDFILE"
        fi
    else
        warn "No pidfile found at $PIDFILE. Nothing to stop."
    fi
    exit 0
fi

# ── Preflight checks ─────────────────────────────────────────────────────────
if [[ ! -d "${WATCH_PATH}" ]]; then
    err "Watch directory does not exist: ${WATCH_PATH}"
    exit 1
fi

if ! git -C "$BLOG_ROOT" rev-parse --is-inside-work-tree &>/dev/null; then
    err "Not a git repository: ${BLOG_ROOT}"
    exit 1
fi

# ── Write PID file ────────────────────────────────────────────────────────────
echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"; log "Exiting."; exit 0' INT TERM EXIT

# ── Core: stage, commit, push ─────────────────────────────────────────────────
do_commit_and_push() {
    cd "$BLOG_ROOT"

    local changed_files
    changed_files=$(git status --porcelain -- "$WATCH_DIR" 2>/dev/null | awk '{print $NF}')

    if [[ -z "$changed_files" ]]; then
        return 0
    fi

    log "Detected changes in:"
    echo "$changed_files" | while read -r f; do
        log "  -> $f"
    done

    git add -- "$WATCH_DIR"

    local added modified deleted msg_parts=()

    added=$(git diff --cached --name-only --diff-filter=A -- "$WATCH_DIR" 2>/dev/null || true)
    modified=$(git diff --cached --name-only --diff-filter=M -- "$WATCH_DIR" 2>/dev/null || true)
    deleted=$(git diff --cached --name-only --diff-filter=D -- "$WATCH_DIR" 2>/dev/null || true)

    if [[ -n "$added" ]]; then
        while IFS= read -r f; do
            msg_parts+=("add $(basename "$f")")
        done <<< "$added"
    fi
    if [[ -n "$modified" ]]; then
        while IFS= read -r f; do
            msg_parts+=("update $(basename "$f")")
        done <<< "$modified"
    fi
    if [[ -n "$deleted" ]]; then
        while IFS= read -r f; do
            msg_parts+=("remove $(basename "$f")")
        done <<< "$deleted"
    fi

    if [[ ${#msg_parts[@]} -eq 0 ]]; then
        msg_parts+=("update posts")
    fi

    local commit_msg
    commit_msg="post: $(IFS=', '; echo "${msg_parts[*]}")"

    log "Committing: $commit_msg"
    if ! git commit -m "$commit_msg"; then
        err "git commit failed."
        return 1
    fi

    log "Pushing to ${REMOTE} ${BRANCH}..."
    if git push "$REMOTE" "$BRANCH" 2>&1; then
        ok "Push successful."
    else
        err "git push failed. Changes are committed locally; push manually later."
    fi
}

# ── Watch mode selection ──────────────────────────────────────────────────────
if command -v inotifywait &>/dev/null; then
    log "Starting in inotifywait mode."
    log "Watching: ${WATCH_PATH}"
    log "Debounce: ${DEBOUNCE_SECONDS}s | Remote: ${REMOTE}/${BRANCH}"
    log "PID: $$ | Stop with: $0 stop  (or Ctrl-C)"
    echo ""

    while true; do
        inotifywait -r -q \
            -e modify -e create -e delete -e moved_to \
            --format '%w%f' \
            "$WATCH_PATH" >/dev/null 2>&1

        log "Change detected. Waiting ${DEBOUNCE_SECONDS}s to batch changes..."
        sleep "$DEBOUNCE_SECONDS"

        do_commit_and_push
        echo ""
    done
else
    log "inotifywait not found. Starting in polling mode."
    log "Watching: ${WATCH_PATH}"
    log "Poll interval: ${POLL_INTERVAL}s | Debounce: ${DEBOUNCE_SECONDS}s"
    log "Remote: ${REMOTE}/${BRANCH}"
    log "PID: $$ | Stop with: $0 stop  (or Ctrl-C)"
    echo ""

    last_snapshot=""

    while true; do
        cd "$BLOG_ROOT"

        current_snapshot=$(git status --porcelain -- "$WATCH_DIR" 2>/dev/null || true)

        if [[ -n "$current_snapshot" && "$current_snapshot" != "$last_snapshot" ]]; then
            log "Change detected. Waiting ${DEBOUNCE_SECONDS}s to batch changes..."
            sleep "$DEBOUNCE_SECONDS"

            do_commit_and_push
            echo ""

            last_snapshot=$(git status --porcelain -- "$WATCH_DIR" 2>/dev/null || true)
        else
            last_snapshot="$current_snapshot"
        fi

        sleep "$POLL_INTERVAL"
    done
fi
