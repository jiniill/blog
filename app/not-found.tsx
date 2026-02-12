import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium hover:underline"
      >
        홈으로 돌아가기
      </Link>
    </Container>
  );
}
