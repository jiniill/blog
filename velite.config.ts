import { defineConfig, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { rehypeFixEmphasis } from "./lib/rehype-fix-emphasis";
import { countContentChars } from "./lib/content-char-count";

function extractLocaleFromPath(path: string) {
  const pathSegments = path.split("/");
  const postsSegmentIndex = pathSegments.indexOf("posts");
  const locale = pathSegments[postsSegmentIndex + 1];
  if (locale === "ko" || locale === "en") {
    return locale;
  }

  throw new Error(`Unsupported locale in post path: ${path}`);
}

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name].[ext]",
    clean: true,
  },
  collections: {
    posts: {
      name: "Post",
      pattern: "posts/{ko,en}/**/*.mdx",
      schema: s
        .object({
          title: s.string().max(120),
          locale: s
            .custom()
            .transform((_, { meta }) => extractLocaleFromPath(meta.path)),
          slug: s.string(),
          description: s.string().max(300),
          date: s.isodate(),
          updated: s.isodate().optional(),
          published: s.boolean().default(true),
          tags: s.array(s.string()).default([]),
          series: s.string().optional(),
          seriesOrder: s.number().optional(),
          author: s.string().optional(),
          sourceUrl: s.string().url().optional(),
          sourceTitle: s.string().optional(),
          references: s
            .array(s.object({ title: s.string(), url: s.string().url() }))
            .default([]),
          image: s.image().optional(),
          body: s.mdx(),
          metadata: s
            .custom()
            .transform((_, { meta }) => countContentChars(meta.plain ?? "")),
          toc: s.toc(),
        })
        .transform((data) => ({
          ...data,
          permalink: `/${data.locale}/blog/${data.slug}`,
        })),
    },
  },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeFixEmphasis,
      rehypeSlug,
      [rehypePrettyCode, { theme: { dark: "github-dark", light: "github-light" } }],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});
