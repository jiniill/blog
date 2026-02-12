import type { Metadata } from "next";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "About",
  description: "블로그 소개",
};

export default function AboutPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <div className="prose mt-8">
        <p>
          이 블로그는 개발과 기술에 대한 이야기를 기록하는 공간입니다.
        </p>
        <p>
          궁금한 점이 있으면 GitHub나 이메일로 연락해주세요.
        </p>
      </div>
    </Container>
  );
}
