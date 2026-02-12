import { config, collection, fields } from "@keystatic/core";

const isGitHub = process.env.KEYSTATIC_STORAGE_KIND === "github";

export default config({
  storage: isGitHub
    ? {
        kind: "github",
        repo: {
          owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || "owner",
          name: process.env.NEXT_PUBLIC_GITHUB_REPO || "blog",
        },
      }
    : { kind: "local" },
  ui: {
    brand: { name: "Blog Admin" },
  },
  collections: {
    posts: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "content/posts/*/index",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: { label: "제목", validation: { isRequired: true } },
        }),
        description: fields.text({
          label: "설명",
          validation: { isRequired: true, length: { max: 300 } },
        }),
        date: fields.date({
          label: "작성일",
          validation: { isRequired: true },
        }),
        updated: fields.date({ label: "수정일" }),
        published: fields.checkbox({
          label: "공개",
          defaultValue: true,
        }),
        tags: fields.array(fields.text({ label: "태그" }), {
          label: "태그",
          itemLabel: (props) => props.value,
        }),
        image: fields.image({
          label: "대표 이미지",
          directory: "content/posts",
          publicPath: "/static/",
        }),
        content: fields.mdx({
          label: "본문",
          options: {
            image: {
              directory: "content/posts",
              publicPath: "/static/",
            },
          },
        }),
      },
    }),
  },
});
