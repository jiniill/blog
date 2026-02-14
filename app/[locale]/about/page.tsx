import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/container";
import { isValidLocale, type Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  if (isValidLocale(rawLocale)) {
    return rawLocale;
  }

  notFound();
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const t = getDictionary(rawLocale);

  return {
    title: t.about.title,
    description: t.about.description,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  if (locale === "en") {
    return (
      <Container className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <div className="prose mt-8">
          <p>
            Hi, I&apos;m <strong>jiniill</strong>.
          </p>
          <p>
            I&apos;m a full-stack engineer focused on AI-first development.
            This blog curates and shares useful essays and documents.
          </p>
          <h2>Interests</h2>
          <ul>
            <li>AI-first Development</li>
            <li>Full-stack Web (React, Next.js, Node.js)</li>
            <li>Product Design &amp; DX Improvement</li>
          </ul>
          <h2>Contact</h2>
          <div className="not-prose">
            <a
              href="mailto:jiniill@naver.com"
              className="inline-flex items-center gap-1.5 text-sm text-body transition-colors hover:text-heading"
            >
              <Mail className="h-4 w-4" />
              jiniill@naver.com
            </a>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <div className="prose mt-8">
        <p>
          안녕하세요, <strong>진리(jiniill)</strong>입니다.
        </p>
        <p>
          AI-first 개발을 지향하는 풀스택 엔지니어입니다.
          이 블로그에는 유용한 에세이와 문서를 큐레이션하고 공유합니다.
        </p>
        <h2>관심 분야</h2>
        <ul>
          <li>AI-first Development</li>
          <li>웹 풀스택 (React, Next.js, Node.js)</li>
          <li>제품 설계와 DX 개선</li>
        </ul>
        <h2>연락처</h2>
        <div className="not-prose">
          <a
            href="mailto:jiniill@naver.com"
            className="inline-flex items-center gap-1.5 text-sm text-body transition-colors hover:text-heading"
          >
            <Mail className="h-4 w-4" />
            jiniill@naver.com
          </a>
        </div>
      </div>
    </Container>
  );
}
