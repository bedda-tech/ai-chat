import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["redis"],
  webpack(config, { isServer }) {
    if (!isServer) {
      // redis uses Node.js builtins; replace with empty module in client bundle
      config.resolve.alias = { ...(config.resolve.alias as object), redis: false };
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
  async rewrites() {
    const umamiHost = process.env.NEXT_PUBLIC_UMAMI_HOST;
    if (!umamiHost) return [];
    return [
      { source: "/a/script.js", destination: `${umamiHost}/script.js` },
      { source: "/a/api/send", destination: `${umamiHost}/api/send` },
    ];
  },
};

export default nextConfig;
