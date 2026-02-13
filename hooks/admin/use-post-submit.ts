"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AdminPostPayload } from "@/lib/admin/post-types";
import type { PostFormState } from "@/hooks/admin/use-post-form";

interface UsePostSubmitOptions {
  mode: "create" | "edit";
  getSubmitFormState: () => PostFormState;
}

interface RequestConfig {
  path: string;
  method: "POST" | "PUT";
}

interface UseSubmitHandlerOptions {
  mode: "create" | "edit";
  getSubmitFormState: () => PostFormState;
  setError: (value: string) => void;
  setIsSubmitting: (value: boolean) => void;
  pushAdminList: () => void;
  refreshAdminList: () => void;
}

export interface UsePostSubmitResult {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  error: string;
}

function trimToOptionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

function parseSeriesOrder(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? Number(trimmedValue) : undefined;
}

function mapFormStateToPayload(formState: PostFormState): AdminPostPayload {
  return {
    title: formState.title.trim(),
    slug: formState.slug.trim(),
    description: formState.description.trim(),
    date: formState.date,
    updated: trimToOptionalText(formState.updated),
    published: formState.published,
    tags: formState.tags,
    series: trimToOptionalText(formState.series),
    seriesOrder: parseSeriesOrder(formState.seriesOrder),
    author: trimToOptionalText(formState.author),
    sourceUrl: trimToOptionalText(formState.sourceUrl),
    sourceTitle: trimToOptionalText(formState.sourceTitle),
    content: formState.content,
  };
}

function hasRequiredFields(payload: AdminPostPayload) {
  return Boolean(payload.title && payload.slug && payload.description && payload.date);
}

function resolveRequestConfig(mode: "create" | "edit", payload: AdminPostPayload): RequestConfig {
  if (mode === "edit") return { path: `/api/admin/posts/${encodeURIComponent(payload.slug)}`, method: "PUT" };
  return { path: "/api/admin/posts", method: "POST" };
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "요청 처리에 실패했습니다.";
  } catch {
    return "요청 처리에 실패했습니다.";
  }
}

async function sendPostRequest(requestConfig: RequestConfig, payload: AdminPostPayload) {
  const response = await fetch(requestConfig.path, {
    method: requestConfig.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await readErrorMessage(response));
}

function useSubmitHandler({
  mode,
  getSubmitFormState,
  setError,
  setIsSubmitting,
  pushAdminList,
  refreshAdminList,
}: UseSubmitHandlerOptions) {
  return useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = mapFormStateToPayload(getSubmitFormState());
      if (!hasRequiredFields(payload)) return setError("필수 입력값을 모두 채워주세요.");

      setIsSubmitting(true);
      setError("");

      try {
        const requestConfig = resolveRequestConfig(mode, payload);
        await sendPostRequest(requestConfig, payload);
        pushAdminList();
        refreshAdminList();
      } catch (submitError: unknown) {
        const message =
          submitError instanceof Error ? submitError.message : "저장에 실패했습니다.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [getSubmitFormState, mode, pushAdminList, refreshAdminList, setError, setIsSubmitting],
  );
}

export function usePostSubmit({
  mode,
  getSubmitFormState,
}: UsePostSubmitOptions): UsePostSubmitResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = useSubmitHandler({
    mode,
    getSubmitFormState,
    setError,
    setIsSubmitting,
    pushAdminList: () => router.push("/admin"),
    refreshAdminList: router.refresh,
  });

  return { handleSubmit, isSubmitting, error };
}
