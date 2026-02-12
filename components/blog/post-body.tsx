"use client";

import { useMDXComponent } from "@/lib/mdx";

const mdxComponents = {
  // Custom components can be added here
};

export function PostBody({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-900">
      <Component components={mdxComponents} />
    </div>
  );
}
