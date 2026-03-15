import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      { source: "/a/script.js", destination: "https://media-server.tail0af452.ts.net:10000/script.js" },
      { source: "/a/api/send", destination: "https://media-server.tail0af452.ts.net:10000/api/send" },
    ];
  },
};

export default nextConfig;
