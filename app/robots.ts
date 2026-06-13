import type { MetadataRoute } from "next";

const BASE_URL = "https://bedda.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/roadmap", "/register", "/login", "/privacy", "/terms"],
        disallow: [
          "/api/",
          "/settings/",
          "/knowledge-base/",
          "/projects/",
          "/compare/",
          "/studio/",
          "/drive/",
          "/notion/",
          "/admin/",
          "/upgrade/",
          "/subscription/",
          "/chat/",
          "/plugins/",
          "/join/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
