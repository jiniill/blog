"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { CheckCircle, Mail, X } from "lucide-react";

/* -- 타입 -- */

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "closed" | "opening" | "open" | "closing";
type PhaseAction =
  | { type: "OPEN_REQUESTED" }
  | { type: "ANIMATION_ENDED" }
  | { type: "CLOSE_REQUESTED" };

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/* -- 유틸 -- */

function phaseReducer(phase: Phase, action: PhaseAction): Phase {
  if (action.type === "OPEN_REQUESTED") {
    if (phase === "closed" || phase === "closing") return "opening";
    return phase;
  }
  if (action.type === "CLOSE_REQUESTED") {
    if (phase === "opening" || phase === "open") return "closing";
    return phase;
  }
  if (action.type === "ANIMATION_ENDED") {
    if (phase === "opening") return "open";
    if (phase === "closing") return "closed";
  }
  return phase;
}

/* -- 컴포넌트 -- */

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phase, dispatchPhase] = useReducer(phaseReducer, "closed");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* isOpen 변경에 따라 phase 상태 머신 액션을 디스패치합니다. */
  useEffect(() => {
    if (isOpen) {
      dispatchPhase({ type: "OPEN_REQUESTED" });
    } else {
      dispatchPhase({ type: "CLOSE_REQUESTED" });
    }
  }, [isOpen]);

  /* opening 페이즈에 진입하면 dialog를 열고 입력창에 포커스를 맞춥니다. */
  useEffect(() => {
    if (phase === "opening") {
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
      inputRef.current?.focus();
    }
  }, [phase]);

  const requestClose = useCallback(() => {
    if (phase === "closing" || phase === "closed") return;
    onClose();
  }, [phase, onClose]);

  const handlePanelAnimationEnd = useCallback(() => {
    if (phase === "closing") {
      dialogRef.current?.close();
      setEmail("");
      setStatus("idle");
      setErrorMessage("");
    }
    dispatchPhase({ type: "ANIMATION_ENDED" });
  }, [phase]);

  /* 성공 시 3초 후 자동 닫기 */
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => requestClose(), 3000);
    return () => clearTimeout(timer);
  }, [status, requestClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setStatus("success");
        return;
      }

      const data = await response.json();
      setErrorMessage(data.error || "구독 처리 중 오류가 발생했습니다.");
      setStatus("error");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setStatus("error");
    }
  }

  if (phase === "closed") return null;

  return (
    <dialog
      ref={dialogRef}
      className="subscribe-dialog"
      data-state={phase}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className="subscribe-panel w-full max-w-md overflow-hidden rounded-[var(--theme-radius-lg)] border-[length:var(--theme-border-width)] border-border bg-background shadow-[var(--theme-shadow-hover)]"
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-subtle" />
            <span className="text-sm font-medium text-heading">뉴스레터 구독</span>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-[var(--theme-radius-sm)] p-1 text-subtle transition-colors hover:text-foreground"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-5 py-5">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-10 w-10 text-accent" />
              <p className="text-sm font-medium text-heading">
                구독이 완료되었습니다!
              </p>
              <p className="text-xs text-subtle">
                환영 이메일을 확인해주세요.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-body">
                새로운 글이 발행되면 이메일로 알려드립니다.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  required
                  className="w-full rounded-[var(--theme-radius-md)] border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent"
                />
                {status === "error" && errorMessage && (
                  <p className="text-xs text-red-500">{errorMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="rounded-[var(--theme-radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === "submitting" ? "처리 중..." : "구독하기"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
