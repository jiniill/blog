import Link from "next/link";
import type { Post } from "@/lib/velite";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/utils";

export function RelatedPosts({
  posts,
  locale,
}: {
  posts: Post[];
  locale: Locale;
}) {
  if (posts.length === 0) return null;

  const t = getDictionary(locale);

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 text-lg font-semibold tracking-tight">
        {t.post.relatedPosts}
      </h2>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={post.permalink}
              prefetch={false}
              className="group block"
            >
              <p className="font-medium group-hover:underline">{post.title}</p>
              <span className="text-xs text-subtle">
                {formatDate(post.date, locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
