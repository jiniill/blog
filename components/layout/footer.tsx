import Link from "next/link";
import { Github, Rss } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Container } from "./container";
import type { Locale } from "@/lib/i18n/types";

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-border">
      <Container className="flex items-center justify-between py-8">
        <p className="text-sm text-subtle">
          &copy; {new Date().getFullYear()} {siteConfig.author.name}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-subtle hover:text-link-hover transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <Link
            href="/feed.xml"
            className="text-subtle hover:text-link-hover transition-colors"
            aria-label="RSS Feed"
          >
            <Rss className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}
