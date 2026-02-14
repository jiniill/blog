import generatedPosts from "../.velite/posts.json";
import type { Post as VelitePost } from "../.velite";

export type Post = VelitePost;

export const posts = generatedPosts as Post[];
