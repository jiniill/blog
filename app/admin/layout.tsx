import Link from "next/link";
import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-lg font-semibold text-heading hover:text-link-hover"
            >
              Blog Admin
            </Link>
            <span className="hidden text-border sm:inline" aria-hidden>
              |
            </span>
            <Link
              href="/admin"
              className="hidden text-sm text-body hover:text-link-hover sm:inline"
            >
              글 목록
            </Link>
          </div>
          <Link href="/" className="text-sm text-body hover:text-link-hover">
            블로그 홈
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
