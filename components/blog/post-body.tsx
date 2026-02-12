import * as runtime from "react/jsx-runtime";

function renderMdx(code: string) {
  const fn = new Function(code);
  const MDXContent = fn({ ...runtime }).default;
  return <MDXContent />;
}

export function PostBody({ code }: { code: string }) {
  return (
    <div className="prose max-w-none prose-headings:scroll-mt-20">
      {renderMdx(code)}
    </div>
  );
}
