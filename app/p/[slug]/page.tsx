import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/lib/db/published-pages";
import { ReportLink } from "./report-link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  return {
    title: page ? `${page.title} · Made with Bedda Chat` : "Not found",
    // Noindex until an admin marks the page reviewed-clean.
    robots: page?.reviewedClean
      ? { index: true, follow: false }
      : { index: false, follow: false },
  };
}

export default async function PublishedPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    notFound();
  }
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-2 text-sm">
        <span className="truncate font-medium">{page.title}</span>
        <ReportLink slug={slug} />
      </header>
      <iframe
        className="w-full flex-1 border-0 bg-white"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts"
        src={`/p/${slug}/raw`}
        title={page.title}
      />
      <footer className="border-t px-4 py-2 text-center text-muted-foreground text-xs">
        Made with{" "}
        <Link className="underline" href="/register">
          Bedda Chat
        </Link>{" "}
        — sign up free
      </footer>
    </div>
  );
}
