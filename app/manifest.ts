import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bedda.ai — All AI Models, One Subscription",
    short_name: "bedda.ai",
    description:
      "Access Claude, GPT-5, Gemini, Grok, DeepSeek, and 30+ AI models in one app. One subscription does it all.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a292e",
    theme_color: "#1a292e",
    categories: ["productivity", "utilities"],
    lang: "en",
    icons: [
      {
        src: "/images/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/images/demo-thumbnail.png",
        type: "image/png",
        sizes: "1280x720",
        form_factor: "wide",
        label: "bedda.ai chat interface",
      },
    ],
    shortcuts: [
      {
        name: "New Chat",
        short_name: "New Chat",
        description: "Start a new AI conversation",
        url: "/",
        icons: [
          {
            src: "/images/favicons/android-chrome-192x192.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Knowledge Base",
        short_name: "Knowledge",
        description: "Manage your personal knowledge base",
        url: "/knowledge",
        icons: [
          {
            src: "/images/favicons/android-chrome-192x192.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Upgrade Plan",
        short_name: "Upgrade",
        description: "Upgrade to access more models",
        url: "/upgrade",
        icons: [
          {
            src: "/images/favicons/android-chrome-192x192.png",
            sizes: "192x192",
          },
        ],
      },
    ],
  };
}
