import type { Metadata } from "next";
import { ImageStudio } from "@/components/image-studio";

export const metadata: Metadata = {
  title: "Image Studio — bedda.ai",
  description:
    "Generate images side-by-side with DALL-E 3, Imagen 3, and Flux 1.1 Pro.",
};

export default function StudioPage() {
  return <ImageStudio />;
}
