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
    <div className="prose max-w-none prose-headings:scroll-mt-20">
      {content}
    </div>
  );
}
