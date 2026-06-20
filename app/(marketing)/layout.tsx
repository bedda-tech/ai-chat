import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <Image
                alt="Bedda Logo"
                className="h-6 w-6"
                height={24}
                priority
                src="/images/bedda-coral-icon-background-transparent.png"
                unoptimized
                width={24}
              />
              <span className="hidden font-bold sm:inline-block">bedda.ai</span>
            </Link>
            <nav className="flex items-center space-x-6 font-medium text-sm">
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/home"
              >
                Home
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/pricing"
              >
                Pricing
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/models"
              >
                Models
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/compare/bedda-vs-chatgpt"
              >
                Compare
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/for/developers"
              >
                Use Cases
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/roadmap"
              >
                Roadmap
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-muted-foreground text-sm leading-loose md:text-left">
            &copy; {new Date().getFullYear()} bedda.ai &mdash; All AI models,
            one subscription.
          </p>
          <nav className="flex items-center gap-4 text-muted-foreground text-sm">
            <Link
              className="transition-colors hover:text-foreground/80"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80"
              href="/terms"
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
