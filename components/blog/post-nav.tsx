import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Post } from "#velite";

interface PostNavProps {
  prev: Post | undefined;
  next: Post | undefined;
}

export function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 flex items-stretch gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      {prev ? (
        <Link
          href={prev.permalink}
          className="group flex flex-1 flex-col items-start gap-1 rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
        >
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <ChevronLeft className="h-3 w-3" />
            이전 글
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.permalink}
          className="group flex flex-1 flex-col items-end gap-1 rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
        >
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            다음 글
            <ChevronRight className="h-3 w-3" />
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
