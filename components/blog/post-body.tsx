"use client";

import * as runtime from "react/jsx-runtime";
import { useMemo } from "react";

export function PostBody({ code }: { code: string }) {
  const content = useMemo(() => {
    const fn = new Function(code);
    const MDXContent = fn({ ...runtime }).default;
    return <MDXContent />;
  }, [code]);

  return (
    <div className="prose max-w-none prose-headings:scroll-mt-20">
      {content}
    </div>
  );
}
