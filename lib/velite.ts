import generatedPosts from "../.velite/posts.json";
import type { Post as VelitePost } from "../.velite";

export type Post = VelitePost & { locale: string };

export const posts = generatedPosts as Post[];
