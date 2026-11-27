import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["redis", "pdf-parse", "mammoth"],
  webpack(config, { isServer }) {
    if (!isServer) {
      // redis, pdf-parse, and mammoth use Node.js builtins; replace with empty modules in client bundle
      config.resolve.alias = {
        ...(config.resolve.alias as object),
        redis: false,
        "pdf-parse": false,
        mammoth: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // The address said on camera in the BeddaTech vlog. Temporary (307) so it can be repointed,
  // e.g. to the app stores on launch day. Runs before middleware, so no guest session is created.
  async redirects() {
    return [
      {
        source: "/vlog",
        destination:
          "/register?utm_source=vlog&utm_medium=video&utm_campaign=ep01",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const umamiHost = process.env.NEXT_PUBLIC_UMAMI_HOST;
    if (!umamiHost) {
      return [];
    }
    return [
      { source: "/a/script.js", destination: `${umamiHost}/script.js` },
      { source: "/a/api/send", destination: `${umamiHost}/api/send` },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Only upload source maps when auth token is present
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Disable Sentry build-time features when DSN is not configured
  sourcemaps: {
    disable: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  // Don't inject Sentry release info when DSN is absent
  release: {
    create: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    finalize: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
