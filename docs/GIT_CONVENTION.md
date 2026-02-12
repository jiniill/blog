# Git Convention

## Command restrictions

* Do **NOT** run any git command that can modify files or repository state.
  * Explicitly forbidden: `git restore`, `git checkout` (switch/restore), `git reset`, `git clean`, `git stash` (push/apply/pop/drop), `git add`, `git commit`, `git merge`, `git rebase`, `git cherry-pick`, `git apply`, `git am`, `git revert`.
* Only run read-only inspection commands when truly needed (e.g., `git diff`, `git status`, `git log`, `git show`, `git blame`, `git rev-parse`).

## Commit message format

Write the message body in **Korean**.

### Format

```
<type>: <한 줄 요약> (#이슈/PR번호)
1. <작업 단위 A> (완료)
 - 세부 변경사항
 - 세부 변경사항
2. <작업 단위 B> (완료)
 - 세부 변경사항
3. ...

기타 메모 (예외 처리, 디버깅, 리팩토링 등)
```

### Type prefixes

| Type | When to use |
|------|-------------|
| `feat` | New feature or significant behavior change |
| `fix` | Bug fix |
| `refactor` | Code restructure with no behavior change |
| `chore` | Config, deps, CI, tooling, cleanup |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |

### Rules

* **Subject line**: `<type>: <요약>` — keep under ~72 characters. Include `(#번호)` when an issue or PR exists.
* **Numbered work units**: Group related changes into logical units (`1.`, `2.`, …). Each unit gets a status tag: `(완료)`, `(진행중)`, `(부분 완료)`.
* **Sub-items** (`-`): List concrete changes under each unit. Be specific — describe *what* changed and *why* if non-obvious, not just file names.
* **Footer**: Optional free-text for cross-cutting notes (e.g., `기타 예외 처리 추가 및 디버깅 완료`).
* **No empty units**: If a numbered unit has only one trivial change, fold it into another unit or skip the number.
* **Language**: Subject line type prefix is English; everything else is Korean.

### Example

```
feat: 파트너 장르 신청 로직 수정 및 UX 개선 (#156)
1. 대분류 고정, 중/소분류 신청 가능 (완료)
2. UX 개선 (완료)
 - 신청 폼 modal -> inline으로 변경 (장르 확인 가능)
 - 새로고침 후에도 신청 정보가 유지되도록 개선
 - 장르 신청 후 추가 신청 불가하도록 수정
3. 관리자 기능 개선 (완료)
 - 장르 신청/관리 페이지 통합
 - 장르별 프로그램 수 카운트 추가
 - 동일 장르 신청 프로그램 엮어서 처리 가능하도록 개선
4. 프로그램 장르 자동 반영 기능 추가 (완료)

기타 예외 처리 추가 및 디버깅 완료
```