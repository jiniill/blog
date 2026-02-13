export interface AdminPostFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated?: string;
  published: boolean;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  author?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface AdminPostPayload extends AdminPostFrontmatter {
  content: string;
}

export interface AdminPostListItem {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  tags: string[];
  filePath: string;
}

export interface AdminPostDocument {
  frontmatter: AdminPostFrontmatter;
  content: string;
  filePath: string;
}
