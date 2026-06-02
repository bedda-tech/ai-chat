import type { Metadata } from "next";
import { VideoStudio } from "@/components/video-studio";

export const metadata: Metadata = {
  title: "Video Studio — bedda.ai",
  description: "Generate videos with Kling AI powered by fal.ai.",
};

export default function VideoStudioPage() {
  return <VideoStudio />;
}
