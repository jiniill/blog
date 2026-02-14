"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { CheckCircle, Mail, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/* -- 타입 -- */

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
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

export function SubscribeModal({ isOpen, onClose, locale }: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phase, dispatchPhase] = useReducer(phaseReducer, "closed");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = getDictionary(locale);

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
      setErrorMessage(data.error || t.subscribe.defaultError);
      setStatus("error");
    } catch {
      setErrorMessage(t.subscribe.networkError);
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
            <span className="text-sm font-medium text-heading">{t.subscribe.title}</span>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-[var(--theme-radius-sm)] p-1 text-subtle transition-colors hover:text-foreground"
            aria-label={t.subscribe.close}
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
                {t.subscribe.success}
              </p>
              <p className="text-xs text-subtle">
                {t.subscribe.successDetail}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-body">
                {t.subscribe.description}
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.subscribe.emailPlaceholder}
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
                  {status === "submitting" ? t.subscribe.submitting : t.subscribe.submit}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
