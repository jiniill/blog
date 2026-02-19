function getEnvOrFallback(envName: string, fallback: string) {
  const envValue = process.env[envName];
  if (!envValue || envValue.trim().length === 0) {
    return fallback;
  }
  return envValue.trim();
}

function getValidatedUrl(envName: string, fallback: string) {
  const value = getEnvOrFallback(envName, fallback);
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${envName} 환경 변수는 유효한 URL이어야 합니다.`);
  }
}

function getValidatedGiscusRepo(
  envName: string,
  fallback: `${string}/${string}`,
) {
  const value = getEnvOrFallback(envName, fallback);
  if (!value.includes("/")) {
    throw new Error(`${envName} 환경 변수는 owner/repo 형식이어야 합니다.`);
  }

  return value as `${string}/${string}`;
}

export const siteConfig = {
  title: getEnvOrFallback("NEXT_PUBLIC_SITE_TITLE", "jiniill.dev"),
  description: getEnvOrFallback(
    "NEXT_PUBLIC_SITE_DESCRIPTION",
    "개발, 기술, 그리고 생각을 기록하는 블로그",
  ),
  url: getValidatedUrl("NEXT_PUBLIC_SITE_URL", "https://jiniill.dev"),
  author: {
    name: getEnvOrFallback("NEXT_PUBLIC_AUTHOR_NAME", "jiniill"),
    github: getValidatedUrl("NEXT_PUBLIC_AUTHOR_GITHUB", "https://github.com"),
    twitter: getValidatedUrl(
      "NEXT_PUBLIC_AUTHOR_TWITTER",
      "https://twitter.com",
    ),
  },
  giscus: {
    repo: getValidatedGiscusRepo("NEXT_PUBLIC_GISCUS_REPO", "jiniill/blog"),
    repoId: getEnvOrFallback("NEXT_PUBLIC_GISCUS_REPO_ID", "R_kgDOROUtqw"),
    category: getEnvOrFallback("NEXT_PUBLIC_GISCUS_CATEGORY", "General"),
    categoryId: getEnvOrFallback(
      "NEXT_PUBLIC_GISCUS_CATEGORY_ID",
      "DIC_kwDOROUtq84C2QfE",
    ),
  },
} as const;
