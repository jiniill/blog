import Link from "next/link";
import { Github, Rss } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <Container className="flex items-center justify-between py-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} {siteConfig.author.name}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <Link
            href="/feed.xml"
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            aria-label="RSS Feed"
          >
            <Rss className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}
