export const siteConfig = {
  title: "My Blog",
  description: "개발, 기술, 그리고 생각을 기록하는 블로그",
  url: "https://myblog.vercel.app",
  author: {
    name: "Blog Author",
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
  giscus: {
    repo: "jiniill/blog" as `${string}/${string}`,
    repoId: "R_kgDOROUtqw",
    category: "General",
    categoryId: "DIC_kwDOROUtq84C2QfE",
  },
} as const;
