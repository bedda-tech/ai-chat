import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegistration } from "@/components/pwa-registration";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "@/components/posthog-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://bedda.ai"),
  title: "bedda.ai — All AI Models, One Subscription",
  description:
    "Access Claude, GPT-5, Gemini, Grok, DeepSeek, and 30+ more AI models for $12/month. Why pay for multiple AI subscriptions when one does it all?",
  icons: {
    icon: [
      {
        url: "/images/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/images/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/images/favicons/favicon.ico", sizes: "any" },
    ],
    apple: [
      {
        url: "/images/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans",
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-mono",
});

const LIGHT_THEME_COLOR = "hsl(200 35% 92%)";
const DARK_THEME_COLOR = "hsl(200 28% 14%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function getThemeColor() {
    var hasDark = html.classList.contains('dark');
    if (hasDark) {
      return '${DARK_THEME_COLOR}';
    }
    if (html.classList.contains('light')) {
      return '${LIGHT_THEME_COLOR}';
    }
    return '${DARK_THEME_COLOR}';
  }
  function updateThemeColor() {
    meta.setAttribute('content', getThemeColor());
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${notoSans.variable} ${notoSansMono.variable}`}
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "bedda.ai",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              url: "https://bedda.ai",
              description:
                "Access Claude, GPT-5, Gemini, Grok, DeepSeek and 30+ AI models with one subscription.",
              offers: [
                { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
                { "@type": "Offer", name: "Plus", price: "12", priceCurrency: "USD" },
                { "@type": "Offer", name: "Pro", price: "25", priceCurrency: "USD" },
                { "@type": "Offer", name: "Max", price: "50", priceCurrency: "USD" },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Script
          async
          defer
          data-website-id="78383df2-9b6e-4622-8f60-af512e108991"
          src="/a/script.js"
          strategy="afterInteractive"
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: GA4 init requires inline script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <Toaster position="top-center" />
          <PwaRegistration />
          <SessionProvider>
            <PostHogProvider>
              {children}
              <Analytics />
            </PostHogProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
