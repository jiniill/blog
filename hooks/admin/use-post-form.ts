"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import type { AdminPostDocument } from "@/lib/admin/post-types";

interface UsePostFormOptions {
  mode: "create" | "edit";
  slug?: string;
}

interface UseEditPostLoaderOptions {
  isEditMode: boolean;
  slug?: string;
  setFormState: Dispatch<SetStateAction<PostFormState>>;
}

interface UsePostFieldSettersOptions {
  isEditMode: boolean;
  isSlugEdited: boolean;
  setIsSlugEdited: Dispatch<SetStateAction<boolean>>;
  setFormState: Dispatch<SetStateAction<PostFormState>>;
}

interface UseTagHandlersOptions {
  setTagInput: (value: string) => void;
  commitInput: () => void;
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  removeTag: (tag: string) => void;
}

export interface PostFormState {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated: string;
  published: boolean;
  tags: string[];
  series: string;
  seriesOrder: string;
  author: string;
  sourceUrl: string;
  sourceTitle: string;
  content: string;
}

export interface PostFormSetters {
  setTitle: (value: string) => void;
  setSlug: (value: string) => void;
  setDescription: (value: string) => void;
  setDate: (value: string) => void;
  setPublished: (value: boolean) => void;
  setSeries: (value: string) => void;
  setSeriesOrder: (value: string) => void;
  setAuthor: (value: string) => void;
  setSourceUrl: (value: string) => void;
  setSourceTitle: (value: string) => void;
  setContent: (value: string) => void;
}

export interface PostTagHandlers {
  setInput: (value: string) => void;
  commitInput: () => void;
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleInputBlur: () => void;
  removeTag: (tag: string) => void;
}

export interface UsePostFormResult {
  formState: PostFormState;
  tagInput: string;
  descriptionCount: number;
  isLoading: boolean;
  loadError: string;
  setters: PostFormSetters;
  tagHandlers: PostTagHandlers;
  getSubmitFormState: () => PostFormState;
}

function createTodayDateString() {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60_000; // 이유: 분 단위 오프셋을 밀리초로 변환합니다.
  const localDate = new Date(now.getTime() - timezoneOffsetMs);
  return localDate.toISOString().slice(0, 10); // 이유: YYYY-MM-DD 길이가 10자리입니다.
}

function createInitialFormState(): PostFormState {
  return {
    title: "",
    slug: "",
    description: "",
    date: createTodayDateString(),
    updated: "",
    published: true,
    tags: [],
    series: "",
    seriesOrder: "",
    author: "",
    sourceUrl: "",
    sourceTitle: "",
    content: "",
  };
}

function toKebabCase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeTags(rawValue: string) {
  return rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function mergeUniqueTags(currentTags: string[], incomingTags: string[]) {
  return Array.from(new Set([...currentTags, ...incomingTags]));
}

function mapDocumentToFormState(post: AdminPostDocument): PostFormState {
  return {
    title: post.frontmatter.title,
    slug: post.frontmatter.slug,
    description: post.frontmatter.description,
    date: post.frontmatter.date,
    updated: post.frontmatter.updated ?? "",
    published: post.frontmatter.published,
    tags: post.frontmatter.tags,
    series: post.frontmatter.series ?? "",
    seriesOrder:
      typeof post.frontmatter.seriesOrder === "number"
        ? String(post.frontmatter.seriesOrder)
        : "",
    author: post.frontmatter.author ?? "",
    sourceUrl: post.frontmatter.sourceUrl ?? "",
    sourceTitle: post.frontmatter.sourceTitle ?? "",
    content: post.content,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "요청 처리에 실패했습니다.";
  } catch {
    return "요청 처리에 실패했습니다.";
  }
}

async function loadPostDocument(targetSlug: string) {
  const response = await fetch(`/api/admin/posts/${encodeURIComponent(targetSlug)}`);
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const data = (await response.json()) as { post: AdminPostDocument };
  return data.post;
}

function useAddTagsFromRaw(setFormState: Dispatch<SetStateAction<PostFormState>>) {
  return useCallback(
    (rawValue: string) => {
      const incomingTags = normalizeTags(rawValue);
      if (incomingTags.length === 0) return;

      setFormState((prevState) => ({
        ...prevState,
        tags: mergeUniqueTags(prevState.tags, incomingTags),
      }));
    },
    [setFormState],
  );
}

function useCommitTagInput(
  tagInput: string,
  setTagInput: Dispatch<SetStateAction<string>>,
  addTagsFromRaw: (rawValue: string) => void,
) {
  return useCallback(() => {
    if (!tagInput.trim()) return;
    addTagsFromRaw(tagInput);
    setTagInput("");
  }, [addTagsFromRaw, setTagInput, tagInput]);
}

function useTagKeyDownHandler(commitInput: () => void) {
  return useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter" && event.key !== ",") return;
      event.preventDefault();
      commitInput();
    },
    [commitInput],
  );
}

function useTagRemoveHandler(setFormState: Dispatch<SetStateAction<PostFormState>>) {
  return useCallback(
    (tagToRemove: string) => {
      setFormState((prevState) => ({
        ...prevState,
        tags: prevState.tags.filter((tag) => tag !== tagToRemove),
      }));
    },
    [setFormState],
  );
}

function useTagMergeHandler(tagInput: string) {
  return useCallback(
    (currentTags: string[]) => {
      const pendingTags = normalizeTags(tagInput);
      if (pendingTags.length === 0) return currentTags;
      return mergeUniqueTags(currentTags, pendingTags);
    },
    [tagInput],
  );
}

function usePostTagInput(setFormState: Dispatch<SetStateAction<PostFormState>>) {
  const [tagInput, setTagInput] = useState("");
  const addTagsFromRaw = useAddTagsFromRaw(setFormState);
  const commitInput = useCommitTagInput(tagInput, setTagInput, addTagsFromRaw);
  const handleInputKeyDown = useTagKeyDownHandler(commitInput);
  const removeTag = useTagRemoveHandler(setFormState);
  const mergeSubmitTags = useTagMergeHandler(tagInput);

  return { tagInput, setTagInput, commitInput, handleInputKeyDown, removeTag, mergeSubmitTags };
}

function useEditPostLoader({ isEditMode, slug, setFormState }: UseEditPostLoaderOptions) {
  const [isLoading, setIsLoading] = useState(isEditMode && Boolean(slug));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isEditMode || !slug) {
      setIsLoading(false);
      setLoadError("");
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setLoadError("");

    loadPostDocument(slug)
      .then((post) => {
        if (!isCancelled) setFormState(mapDocumentToFormState(post));
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        const message = error instanceof Error ? error.message : "글을 불러올 수 없습니다.";
        setLoadError(message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isEditMode, setFormState, slug]);

  return { isLoading, loadError };
}

function useTitleSetter(
  isEditMode: boolean,
  isSlugEdited: boolean,
  setFormState: Dispatch<SetStateAction<PostFormState>>,
) {
  return useCallback(
    (value: string) => {
      setFormState((prevState) => {
        if (isEditMode || isSlugEdited) return { ...prevState, title: value };
        return { ...prevState, title: value, slug: toKebabCase(value) };
      });
    },
    [isEditMode, isSlugEdited, setFormState],
  );
}

function useSlugSetter(
  setIsSlugEdited: Dispatch<SetStateAction<boolean>>,
  setFormState: Dispatch<SetStateAction<PostFormState>>,
) {
  return useCallback(
    (value: string) => {
      setIsSlugEdited(true);
      setFormState((prevState) => ({ ...prevState, slug: toKebabCase(value) }));
    },
    [setFormState, setIsSlugEdited],
  );
}

function usePostFieldSetters({
  isEditMode,
  isSlugEdited,
  setIsSlugEdited,
  setFormState,
}: UsePostFieldSettersOptions): PostFormSetters {
  const setField = useCallback(
    <K extends keyof PostFormState>(key: K, value: PostFormState[K]) => {
      setFormState((prevState) => ({ ...prevState, [key]: value }));
    },
    [setFormState],
  );
  const setTitle = useTitleSetter(isEditMode, isSlugEdited, setFormState);
  const setSlug = useSlugSetter(setIsSlugEdited, setFormState);

  return useMemo(
    () => ({
      setTitle,
      setSlug,
      setDescription: (value) => setField("description", value),
      setDate: (value) => setField("date", value),
      setPublished: (value) => setField("published", value),
      setSeries: (value) => setField("series", value),
      setSeriesOrder: (value) => setField("seriesOrder", value),
      setAuthor: (value) => setField("author", value),
      setSourceUrl: (value) => setField("sourceUrl", value),
      setSourceTitle: (value) => setField("sourceTitle", value),
      setContent: (value) => setField("content", value),
    }),
    [setField, setSlug, setTitle],
  );
}

function usePostTagHandlers({
  setTagInput,
  commitInput,
  handleInputKeyDown,
  removeTag,
}: UseTagHandlersOptions): PostTagHandlers {
  return useMemo(
    () => ({
      setInput: setTagInput,
      commitInput,
      handleInputKeyDown,
      handleInputBlur: commitInput,
      removeTag,
    }),
    [commitInput, handleInputKeyDown, removeTag, setTagInput],
  );
}

function useSubmitFormState(
  formState: PostFormState,
  mergeSubmitTags: (currentTags: string[]) => string[],
) {
  return useCallback(
    () => ({ ...formState, tags: mergeSubmitTags(formState.tags) }),
    [formState, mergeSubmitTags],
  );
}

export function usePostForm({ mode, slug }: UsePostFormOptions): UsePostFormResult {
  const [formState, setFormState] = useState<PostFormState>(createInitialFormState);
  const [isSlugEdited, setIsSlugEdited] = useState(mode === "edit");
  const isEditMode = mode === "edit";

  const tagState = usePostTagInput(setFormState);
  const { isLoading, loadError } = useEditPostLoader({ isEditMode, slug, setFormState });
  const setters = usePostFieldSetters({
    isEditMode,
    isSlugEdited,
    setIsSlugEdited,
    setFormState,
  });
  const tagHandlers = usePostTagHandlers({
    setTagInput: tagState.setTagInput,
    commitInput: tagState.commitInput,
    handleInputKeyDown: tagState.handleInputKeyDown,
    removeTag: tagState.removeTag,
  });
  const getSubmitFormState = useSubmitFormState(formState, tagState.mergeSubmitTags);

  return {
    formState,
    tagInput: tagState.tagInput,
    descriptionCount: formState.description.length,
    isLoading,
    loadError,
    setters,
    tagHandlers,
    getSubmitFormState,
  };
}
