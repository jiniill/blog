"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { SubscribeModal } from "./subscribe-modal";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function SubscribeCta({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = getDictionary(locale);

  return (
    <section className="subscribe-cta mt-12 rounded-[var(--theme-radius-lg)] border border-border bg-surface p-6 text-center sm:p-8">
      <Mail className="mx-auto h-8 w-8 text-subtle" />
      <h3 className="mt-3 text-lg font-semibold text-heading">
        {t.subscribe.ctaTitle}
      </h3>
      <p className="mt-1 text-sm text-body">{t.subscribe.ctaDescription}</p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 inline-flex rounded-[var(--theme-radius-md)] bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
      >
        {t.subscribe.ctaButton}
      </button>
      <SubscribeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={locale}
      />
    </section>
  );
}
