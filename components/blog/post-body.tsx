"use client";

import * as runtime from "react/jsx-runtime";
import { useMemo } from "react";

const mdxComponents = {
  // 커스텀 컴포넌트를 여기에 추가 가능
};

export function PostBody({ code }: { code: string }) {
  const content = useMemo(() => {
    const fn = new Function(code);
    const MDXContent = fn({ ...runtime }).default;
    return <MDXContent components={mdxComponents} />;
  }, [code]);

  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-900">
      {content}
    </div>
  );
}
