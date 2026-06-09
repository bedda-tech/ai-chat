"use client";

import "driver.js/dist/driver.css";
import { useEffect } from "react";

export function OnboardingTour() {
  useEffect(() => {
    let cancelled = false;

    async function startTour() {
      const { driver } = await import("driver.js");

      if (cancelled) return;

      const driverObj = driver({
        animate: true,
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Done",
        onDestroyStarted: () => {
          markComplete();
          driverObj.destroy();
        },
        steps: [
          {
            element: '[data-tour="model-selector"]',
            popover: {
              title: "30+ AI Models",
              description:
                "Choose from GPT-5, Claude, Gemini, Grok, and 30+ more — all in one subscription.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: '[data-tour="deep-research"]',
            popover: {
              title: "Deep Research Mode",
              description:
                "Toggle autonomous web research — Bedda searches, reads, and synthesizes results for you.",
              side: "top",
              align: "start",
            },
          },
          {
            element: '[data-tour="image-studio-link"]',
            popover: {
              title: "Image Studio",
              description:
                "Generate stunning images with DALL-E 3, Imagen 3, and Flux 1.1 Pro.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="compare-link"]',
            popover: {
              title: "Model Comparison",
              description:
                "Ask the same question to multiple models side-by-side and pick the best answer.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="video-studio-link"]',
            popover: {
              title: "Video Studio",
              description:
                "Generate AI videos from text prompts or images using Kling AI.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="sidebar-user"]',
            popover: {
              title: "Settings & Memory",
              description:
                "Manage your custom instructions, memories, knowledge base, and subscription from Settings.",
              side: "top",
              align: "start",
            },
          },
        ],
      });

      driverObj.drive();
    }

    function markComplete() {
      fetch("/api/user/onboarding-complete", { method: "PATCH" }).catch(
        () => {}
      );
    }

    startTour();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
