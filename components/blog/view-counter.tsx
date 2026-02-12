"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/views/${slug}`, {
      method: "POST",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.count != null) setCount(data.count);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("조회수 불러오기 실패:", err);
        }
      });

    return () => controller.abort();
  }, [slug]);

  if (count === null) return null;

  return <span>{`조회 ${count.toLocaleString("ko-KR")}회`}</span>;
}
