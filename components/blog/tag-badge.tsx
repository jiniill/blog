import Link from "next/link";

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="inline-block rounded-[var(--theme-radius-sm)] border-[length:var(--theme-border-width)] border-border bg-muted px-2.5 py-0.5 text-xs text-body hover:bg-muted-hover shadow-[var(--theme-shadow)] transition-colors"
    >
      {tag}
    </Link>
  );
}
