"use client";

import type {
  PostFormSetters,
  PostFormState,
  PostTagHandlers,
} from "@/hooks/admin/use-post-form";

const DESCRIPTION_MAX_LENGTH = 300;
const FIELD_CLASS_NAME =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-body outline-none transition focus:ring-2 focus:ring-accent";
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="group relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ backgroundColor: checked ? "var(--color-accent)" : "var(--color-border)" }}
    >
      <span
        className="pointer-events-none block size-[22px] rounded-full bg-white shadow-sm ring-0 transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

interface FrontmatterFormProps {
  mode: "create" | "edit";
  formState: PostFormState;
  tagInput: string;
  descriptionCount: number;
  setters: PostFormSetters;
  tagHandlers: PostTagHandlers;
}

function TitleAndSlugFields({
  mode,
  formState,
  setters,
}: Pick<FrontmatterFormProps, "mode" | "formState" | "setters">) {
  return (
    <>
      <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-heading">
        제목 *
        <input
          required
          value={formState.title}
          onChange={(event) => setters.setTitle(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>

      <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-heading">
        slug *
        <input
          required
          value={formState.slug}
          onChange={(event) => setters.setSlug(event.target.value)}
          readOnly={mode === "edit"}
          className={FIELD_CLASS_NAME}
        />
      </label>
    </>
  );
}

function DescriptionAndMetaFields({
  formState,
  descriptionCount,
  setters,
}: Pick<FrontmatterFormProps, "formState" | "descriptionCount" | "setters">) {
  return (
    <>
      <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-heading">
        설명 *
        <textarea
          required
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={formState.description}
          onChange={(event) => setters.setDescription(event.target.value)}
          className={`${FIELD_CLASS_NAME} min-h-24 resize-y`}
        />
        <span className="text-xs text-subtle">
          {descriptionCount}/{DESCRIPTION_MAX_LENGTH}
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm text-heading">
        날짜 *
        <input
          required
          type="date"
          value={formState.date}
          onChange={(event) => setters.setDate(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>

      <div className="flex flex-col justify-end gap-2">
        <span className="text-sm text-heading">공개 여부</span>
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={formState.published}
            onChange={setters.setPublished}
            label="공개 여부"
          />
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: formState.published ? "rgb(34 197 94 / 0.1)" : "var(--color-muted)",
              color: formState.published ? "rgb(34 197 94)" : "var(--color-subtle)",
            }}
          >
            {formState.published ? "공개" : "비공개"}
          </span>
        </div>
      </div>
    </>
  );
}

function TagFields({
  formState,
  tagInput,
  tagHandlers,
}: Pick<FrontmatterFormProps, "formState" | "tagInput" | "tagHandlers">) {
  return (
    <div className="sm:col-span-2 flex flex-col gap-2 text-sm text-heading">
      <span>태그</span>
      <input
        value={tagInput}
        placeholder="콤마(,) 또는 Enter로 태그 추가"
        onChange={(event) => tagHandlers.setInput(event.target.value)}
        onKeyDown={tagHandlers.handleInputKeyDown}
        onBlur={tagHandlers.handleInputBlur}
        className={FIELD_CLASS_NAME}
      />

      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-2 py-2">
        {formState.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-heading"
          >
            {tag}
            <button
              type="button"
              onClick={() => tagHandlers.removeTag(tag)}
              className="text-subtle hover:text-heading"
              aria-label={`${tag} 제거`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SeriesFields({
  formState,
  setters,
}: Pick<FrontmatterFormProps, "formState" | "setters">) {
  return (
    <>
      <label className="flex flex-col gap-2 text-sm text-heading">
        시리즈명
        <input
          value={formState.series}
          onChange={(event) => setters.setSeries(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-heading">
        시리즈 순서
        <input
          type="number"
          value={formState.seriesOrder}
          onChange={(event) => setters.setSeriesOrder(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>
    </>
  );
}

function AdditionalFields({
  formState,
  setters,
}: Pick<FrontmatterFormProps, "formState" | "setters">) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm text-heading">
        저자
        <input
          value={formState.author}
          onChange={(event) => setters.setAuthor(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-heading">
        원문 링크
        <input
          type="url"
          value={formState.sourceUrl}
          onChange={(event) => setters.setSourceUrl(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>

      <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-heading">
        원문 제목
        <input
          value={formState.sourceTitle}
          onChange={(event) => setters.setSourceTitle(event.target.value)}
          className={FIELD_CLASS_NAME}
        />
      </label>
    </div>
  );
}

export function FrontmatterForm(props: FrontmatterFormProps) {
  return (
    <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TitleAndSlugFields mode={props.mode} formState={props.formState} setters={props.setters} />
        <DescriptionAndMetaFields
          formState={props.formState}
          descriptionCount={props.descriptionCount}
          setters={props.setters}
        />
        <TagFields
          formState={props.formState}
          tagInput={props.tagInput}
          tagHandlers={props.tagHandlers}
        />
        <SeriesFields formState={props.formState} setters={props.setters} />
      </div>

      <details className="mt-4 rounded-md border border-border bg-surface px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-heading">추가 정보</summary>
        <AdditionalFields formState={props.formState} setters={props.setters} />
      </details>
    </section>
  );
}
