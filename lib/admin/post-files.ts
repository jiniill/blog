import "server-only";

import path from "node:path";
import { promises as fs } from "node:fs";
import type { Dirent } from "node:fs";
import { toDateTimestamp } from "@/lib/utils";
import type {
  AdminPostDocument,
  AdminPostFrontmatter,
  AdminPostListItem,
  AdminPostPayload,
} from "@/lib/admin/post-types";

const CONTENT_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const MDX_EXTENSION = ".mdx";
const FRONTMATTER_START = "---\n";
const FRONTMATTER_END = "\n---\n";
const DESCRIPTION_MAX_LENGTH = 300;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u;

interface PostFileInfo {
  absolutePath: string;
  filePath: string;
}

class AdminPostError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export class AdminPostValidationError extends AdminPostError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AdminPostNotFoundError extends AdminPostError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class AdminPostConflictError extends AdminPostError {
  constructor(message: string) {
    super(message, 409);
  }
}

export function parseAdminPostPayload(
  payload: unknown,
  slugLock?: string,
): AdminPostPayload {
  // 요청 본문에서 필수 필드를 읽고 기본 형식을 검증합니다.
  const data = asRecord(payload);
  const title = readRequiredString(data, "title");
  const slug = normalizeSlug(readRequiredString(data, "slug"));
  const description = readRequiredString(data, "description");
  const date = readIsoDate(readRequiredString(data, "date"), "date");
  const content = readString(data, "content", true);

  // 본문 제약 조건을 추가로 검증합니다.
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new AdminPostValidationError("설명은 300자를 넘길 수 없습니다.");
  }
  if (slugLock && slug !== slugLock) {
    throw new AdminPostValidationError("수정 시 slug는 변경할 수 없습니다.");
  }

  // 저장 가능한 payload 형식으로 정규화합니다.
  return {
    title,
    slug,
    description,
    date,
    updated: readOptionalIsoDate(data, "updated"),
    published: readBoolean(data, "published"),
    tags: readTags(data),
    series: readOptionalString(data, "series"),
    seriesOrder: readOptionalInteger(data, "seriesOrder"),
    author: readOptionalString(data, "author"),
    sourceUrl: readOptionalString(data, "sourceUrl"),
    sourceTitle: readOptionalString(data, "sourceTitle"),
    content,
  };
}

export async function listAdminPosts(): Promise<AdminPostListItem[]> {
  // 파일 시스템에서 모든 문서를 읽어 목록 아이템으로 변환합니다.
  const postFileInfos = await readAllPostFileInfos();
  const documents = await Promise.all(postFileInfos.map(readPostDocument));

  const postItems = documents.map((document) => ({
    slug: document.frontmatter.slug,
    title: document.frontmatter.title,
    date: document.frontmatter.date,
    published: document.frontmatter.published,
    tags: document.frontmatter.tags,
    filePath: document.filePath,
  }));

  // 최신 날짜가 먼저 보이도록 내림차순 정렬합니다.
  return postItems.sort((firstPost, secondPost) => {
    const firstDate = toDateTimestamp(firstPost.date);
    const secondDate = toDateTimestamp(secondPost.date);
    if (firstDate !== secondDate) {
      return secondDate - firstDate;
    }

    return firstPost.slug.localeCompare(secondPost.slug, "ko");
  });
}

export async function createAdminPost(payload: AdminPostPayload) {
  const duplicatedPostFile = await findPostFileBySlug(payload.slug);
  if (duplicatedPostFile) {
    throw new AdminPostConflictError("같은 slug의 글이 이미 존재합니다.");
  }

  const postYear = payload.date.slice(0, 4);
  const postDirectory = path.join(CONTENT_POSTS_DIR, postYear);
  const absolutePath = path.join(postDirectory, `${payload.slug}${MDX_EXTENSION}`);

  await fs.mkdir(postDirectory, { recursive: true });
  await fs.writeFile(absolutePath, buildMdxDocument(payload), "utf8");

  return readPostDocument(toPostFileInfo(absolutePath));
}

export async function getAdminPostBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const postFile = await findPostFileBySlug(normalizedSlug);
  if (!postFile) {
    throw new AdminPostNotFoundError("글을 찾을 수 없습니다.");
  }

  return readPostDocument(postFile);
}

export async function updateAdminPostBySlug(
  slug: string,
  payload: AdminPostPayload,
) {
  const normalizedSlug = normalizeSlug(slug);
  if (payload.slug !== normalizedSlug) {
    throw new AdminPostValidationError("요청 경로와 본문의 slug가 일치하지 않습니다.");
  }

  const postFile = await findPostFileBySlug(normalizedSlug);
  if (!postFile) {
    throw new AdminPostNotFoundError("글을 찾을 수 없습니다.");
  }

  await fs.writeFile(postFile.absolutePath, buildMdxDocument(payload), "utf8");
  return readPostDocument(postFile);
}

export async function deleteAdminPostBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const postFile = await findPostFileBySlug(normalizedSlug);
  if (!postFile) {
    throw new AdminPostNotFoundError("글을 찾을 수 없습니다.");
  }

  await fs.unlink(postFile.absolutePath);
}

export function resolveAdminErrorStatus(error: unknown) {
  if (error instanceof AdminPostError) {
    return error.status;
  }
  return 500;
}

export function resolveAdminErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

async function readAllPostFileInfos(): Promise<PostFileInfo[]> {
  const postFiles: PostFileInfo[] = [];
  await collectPostFileInfos(CONTENT_POSTS_DIR, postFiles);
  return postFiles;
}

async function collectPostFileInfos(
  directory: string,
  postFiles: PostFileInfo[],
) {
  // 현재 디렉터리 엔트리를 읽고 누락 디렉터리는 무시합니다.
  let entries: Dirent[];

  try {
    entries = await fs.readdir(directory, { withFileTypes: true, encoding: "utf8" });
  } catch (error: unknown) {
    if (isMissingDirectoryError(error)) {
      return;
    }
    throw error;
  }

  // 하위 디렉터리는 재귀 순회하고 mdx 파일만 수집합니다.
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await collectPostFileInfos(fullPath, postFiles);
        return;
      }

      if (entry.isFile() && fullPath.endsWith(MDX_EXTENSION)) {
        postFiles.push(toPostFileInfo(fullPath));
      }
    }),
  );
}

function toPostFileInfo(absolutePath: string): PostFileInfo {
  const relativePath = path.relative(process.cwd(), absolutePath);
  return {
    absolutePath,
    filePath: relativePath.split(path.sep).join("/"),
  };
}

async function findPostFileBySlug(slug: string) {
  const postFiles = await readAllPostFileInfos();
  return postFiles.find((postFile) => {
    const fileSlug = path.basename(postFile.absolutePath, MDX_EXTENSION);
    return fileSlug === slug;
  });
}

async function readPostDocument(postFile: PostFileInfo): Promise<AdminPostDocument> {
  const rawDocument = await fs.readFile(postFile.absolutePath, "utf8");
  const { frontmatter, content } = parseMdxDocument(rawDocument, postFile.filePath);
  return {
    frontmatter,
    content,
    filePath: postFile.filePath,
  };
}

function parseMdxDocument(rawDocument: string, filePath: string) {
  // frontmatter 시작/종료 구분자를 검증합니다.
  const normalizedDocument = normalizeLineEndings(rawDocument);
  if (!normalizedDocument.startsWith(FRONTMATTER_START)) {
    throw new AdminPostValidationError(`${filePath}: frontmatter 시작 구분자가 없습니다.`);
  }

  const frontmatterEndIndex = normalizedDocument.indexOf(
    FRONTMATTER_END,
    FRONTMATTER_START.length,
  );
  if (frontmatterEndIndex < 0) {
    throw new AdminPostValidationError(`${filePath}: frontmatter 종료 구분자가 없습니다.`);
  }

  // frontmatter와 본문을 분리합니다.
  const frontmatterText = normalizedDocument.slice(
    FRONTMATTER_START.length,
    frontmatterEndIndex,
  );
  const content = normalizedDocument.slice(frontmatterEndIndex + FRONTMATTER_END.length);

  return {
    frontmatter: parseFrontmatter(frontmatterText, filePath),
    content,
  };
}

function parseFrontmatter(frontmatterText: string, filePath: string): AdminPostFrontmatter {
  // frontmatter 라인을 순회하며 key/value를 해석합니다.
  const frontmatter: Partial<AdminPostFrontmatter> = { published: true, tags: [] };
  const lines = frontmatterText.split("\n");
  let activeArrayKey = "";

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    // tags 배열 블록(`- value`)은 직전 키 문맥으로 파싱합니다.
    if (activeArrayKey === "tags" && trimmedLine.startsWith("- ")) {
      const parsedTag = parseYamlString(trimmedLine.slice(2).trim());
      if (parsedTag) {
        frontmatter.tags?.push(parsedTag);
      }
      continue;
    }

    // 일반 key/value 라인은 구분자(`:`)를 기준으로 분리합니다.
    activeArrayKey = "";
    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex < 0) {
      throw new AdminPostValidationError(`${filePath}: frontmatter 문법이 올바르지 않습니다.`);
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    applyFrontmatterValue(frontmatter, key, rawValue, filePath);

    if (key === "tags" && rawValue === "") {
      activeArrayKey = "tags";
    }
  }

  // 필수 필드를 보강 검증한 뒤 최종 frontmatter를 반환합니다.
  return finalizeFrontmatter(frontmatter, filePath);
}

function applyFrontmatterValue(
  frontmatter: Partial<AdminPostFrontmatter>,
  key: string,
  rawValue: string,
  filePath: string,
) {
  // 스키마가 고정된 특수 필드를 우선 처리합니다.
  if (key === "tags") {
    frontmatter.tags = parseTagValue(rawValue);
    return;
  }

  if (key === "published") {
    frontmatter.published = parseYamlBoolean(rawValue, filePath, key);
    return;
  }

  if (key === "seriesOrder") {
    frontmatter.seriesOrder = parseYamlInteger(rawValue, filePath, key);
    return;
  }

  // 나머지 문자열 필드는 키별로 매핑합니다.
  const normalizedValue = parseYamlString(rawValue);
  if (!normalizedValue) {
    return;
  }

  if (key === "title") frontmatter.title = normalizedValue;
  if (key === "slug") frontmatter.slug = normalizeSlug(normalizedValue);
  if (key === "description") frontmatter.description = normalizedValue;
  if (key === "date") frontmatter.date = readIsoDate(normalizedValue, `${filePath}:date`);
  if (key === "updated") frontmatter.updated = readIsoDate(normalizedValue, `${filePath}:updated`);
  if (key === "series") frontmatter.series = normalizedValue;
  if (key === "author") frontmatter.author = normalizedValue;
  if (key === "sourceUrl") frontmatter.sourceUrl = normalizedValue;
  if (key === "sourceTitle") frontmatter.sourceTitle = normalizedValue;
}

function finalizeFrontmatter(
  frontmatter: Partial<AdminPostFrontmatter>,
  filePath: string,
): AdminPostFrontmatter {
  // 필수 문자열 필드를 최종 검증합니다.
  const title = frontmatter.title?.trim();
  const slug = frontmatter.slug?.trim();
  const description = frontmatter.description?.trim();
  const date = frontmatter.date?.trim();

  if (!title) throw new AdminPostValidationError(`${filePath}: title이 필요합니다.`);
  if (!slug) throw new AdminPostValidationError(`${filePath}: slug가 필요합니다.`);
  if (!description) throw new AdminPostValidationError(`${filePath}: description이 필요합니다.`);
  if (!date) throw new AdminPostValidationError(`${filePath}: date가 필요합니다.`);
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new AdminPostValidationError(`${filePath}: description은 300자를 넘길 수 없습니다.`);
  }

  // 검증된 값을 기반으로 타입 안정한 객체를 구성합니다.
  return {
    title,
    slug,
    description,
    date: readIsoDate(date, `${filePath}:date`),
    updated: frontmatter.updated,
    published: frontmatter.published ?? true,
    tags: frontmatter.tags ?? [],
    series: frontmatter.series,
    seriesOrder: frontmatter.seriesOrder,
    author: frontmatter.author,
    sourceUrl: frontmatter.sourceUrl,
    sourceTitle: frontmatter.sourceTitle,
  };
}

function parseTagValue(rawValue: string) {
  const normalizedValue = rawValue.trim();
  if (!normalizedValue || normalizedValue === "[]") {
    return [];
  }

  if (normalizedValue.startsWith("[") && normalizedValue.endsWith("]")) {
    return normalizedValue
      .slice(1, -1)
      .split(",")
      .map((tag) => parseYamlString(tag.trim()))
      .filter(Boolean);
  }

  return [parseYamlString(normalizedValue)].filter(Boolean);
}

function parseYamlString(rawValue: string) {
  if (!rawValue) {
    return "";
  }

  if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
    return JSON.parse(rawValue) as string;
  }
  if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
    return rawValue.slice(1, -1);
  }
  return rawValue;
}

function parseYamlBoolean(rawValue: string, filePath: string, key: string) {
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;
  throw new AdminPostValidationError(`${filePath}: ${key}는 boolean이어야 합니다.`);
}

function parseYamlInteger(rawValue: string, filePath: string, key: string) {
  const parsedValue = Number(rawValue);
  if (Number.isInteger(parsedValue)) {
    return parsedValue;
  }
  throw new AdminPostValidationError(`${filePath}: ${key}는 정수여야 합니다.`);
}

function buildMdxDocument(payload: AdminPostPayload) {
  // frontmatter 기본 필드를 고정 순서로 직렬화합니다.
  const lines = [
    "---",
    `title: ${toYamlString(payload.title)}`,
    `slug: ${toYamlString(payload.slug)}`,
    `description: ${toYamlString(payload.description)}`,
    `date: ${payload.date}`,
  ];

  if (payload.updated) lines.push(`updated: ${payload.updated}`);

  lines.push(`published: ${payload.published ? "true" : "false"}`);

  // 태그 배열은 YAML 리스트 형식으로 직렬화합니다.
  if (payload.tags.length === 0) {
    lines.push("tags: []");
  } else {
    lines.push("tags:");
    payload.tags.forEach((tag) => lines.push(`  - ${toYamlString(tag)}`));
  }

  // 선택 필드는 값이 있을 때만 포함합니다.
  if (payload.series) lines.push(`series: ${toYamlString(payload.series)}`);
  if (typeof payload.seriesOrder === "number") lines.push(`seriesOrder: ${payload.seriesOrder}`);
  if (payload.author) lines.push(`author: ${toYamlString(payload.author)}`);
  if (payload.sourceUrl) lines.push(`sourceUrl: ${toYamlString(payload.sourceUrl)}`);
  if (payload.sourceTitle) lines.push(`sourceTitle: ${toYamlString(payload.sourceTitle)}`);

  // 문서 구분자 뒤에 본문을 이어 붙여 최종 mdx를 구성합니다.
  lines.push("---");
  lines.push("");

  const normalizedContent = normalizeLineEndings(payload.content);
  const contentWithTrailingLineBreak = normalizedContent.endsWith("\n")
    ? normalizedContent
    : `${normalizedContent}\n`;

  return `${lines.join("\n")}${contentWithTrailingLineBreak}`;
}

function toYamlString(value: string) {
  return JSON.stringify(value);
}

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, "\n");
}

function readIsoDate(value: string, fieldName: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new AdminPostValidationError(`${fieldName}는 YYYY-MM-DD 형식이어야 합니다.`);
  }
  return value;
}

function normalizeSlug(slug: string) {
  const normalizedSlug = slug.trim();
  if (!SLUG_PATTERN.test(normalizedSlug)) {
    throw new AdminPostValidationError("slug는 kebab-case 형식이어야 합니다.");
  }
  return normalizedSlug;
}

function asRecord(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AdminPostValidationError("요청 본문은 객체여야 합니다.");
  }
  return value as Record<string, unknown>;
}

function readString(
  data: Record<string, unknown>,
  key: string,
  allowEmpty = false,
) {
  // 문자열 타입과 필수 입력 여부를 동시에 검증합니다.
  const value = data[key];
  if (typeof value !== "string") {
    throw new AdminPostValidationError(`${key}는 문자열이어야 합니다.`);
  }

  const trimmedValue = value.trim();
  if (!allowEmpty && !trimmedValue) {
    throw new AdminPostValidationError(`${key}는 필수 입력값입니다.`);
  }

  return allowEmpty ? value : trimmedValue;
}

function readRequiredString(data: Record<string, unknown>, key: string) {
  return readString(data, key);
}

function readOptionalString(data: Record<string, unknown>, key: string) {
  const value = data[key];
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalizedValue = readString(data, key);
  return normalizedValue || undefined;
}

function readOptionalIsoDate(data: Record<string, unknown>, key: string) {
  const value = readOptionalString(data, key);
  if (!value) {
    return undefined;
  }
  return readIsoDate(value, key);
}

function readBoolean(data: Record<string, unknown>, key: string) {
  const value = data[key];
  if (typeof value !== "boolean") {
    throw new AdminPostValidationError(`${key}는 boolean이어야 합니다.`);
  }
  return value;
}

function readOptionalInteger(data: Record<string, unknown>, key: string) {
  const value = data[key];
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsedValue)) {
    throw new AdminPostValidationError(`${key}는 정수여야 합니다.`);
  }
  return parsedValue;
}

function readTags(data: Record<string, unknown>) {
  const value = data.tags;
  if (!Array.isArray(value)) {
    throw new AdminPostValidationError("tags는 문자열 배열이어야 합니다.");
  }

  const tags = value
    .map((tag) => {
      if (typeof tag !== "string") {
        throw new AdminPostValidationError("tags는 문자열 배열이어야 합니다.");
      }
      return tag.trim();
    })
    .filter(Boolean);

  return Array.from(new Set(tags));
}

function isMissingDirectoryError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
