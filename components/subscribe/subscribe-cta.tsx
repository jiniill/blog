"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { SubscribeModal } from "./subscribe-modal";

export function SubscribeCta() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="subscribe-cta mt-12 rounded-[var(--theme-radius-lg)] border border-border bg-surface p-6 text-center sm:p-8">
      <Mail className="mx-auto h-8 w-8 text-subtle" />
      <h3 className="mt-3 text-lg font-semibold text-heading">
        새 글 알림 받기
      </h3>
      <p className="mt-1 text-sm text-body">
        새로운 글이 발행되면 이메일로 알려드립니다.
      </p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 inline-flex rounded-[var(--theme-radius-md)] bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
      >
        뉴스레터 구독하기
      </button>
      <SubscribeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
}
