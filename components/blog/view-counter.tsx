"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/views/${slug}`, {
      method: "POST",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.count != null) setCount(data.count);
        else setFailed(true);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setFailed(true);
      });

    return () => controller.abort();
  }, [slug]);

  if (failed) return null;

  return (
    <>
      <span aria-hidden="true">&middot;</span>
      {count === null ? (
        <span className="skeleton-glow inline-block h-3.5 w-16 rounded" />
      ) : (
        <span>{`조회 ${count.toLocaleString("ko-KR")}회`}</span>
      )}
    </>
  );
}
