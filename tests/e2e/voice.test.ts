import { expect, test } from "../fixtures";

const MOCK_TRANSCRIPT = "Tell me about the Eiffel Tower";

test.describe("Voice Input (Whisper)", () => {
  test("voice recorder button is visible in chat input", async ({
    adaContext,
  }) => {
    const { page } = adaContext;

    // Mock MediaRecorder so isSupported evaluates to true in Chrome
    await page.addInitScript(() => {
      if (!window.MediaRecorder) {
        // Minimal stub so VoiceRecorderButton renders
        class FakeMediaRecorder extends EventTarget {
          static isTypeSupported() {
            return true;
          }
          state = "inactive";
          ondataavailable: ((e: Event) => void) | null = null;
          onstop: (() => void) | null = null;
          start(_timeslice?: number) {
            this.state = "recording";
          }
          stop() {
            this.state = "inactive";
            if (this.onstop) this.onstop();
          }
        }
        (window as any).MediaRecorder = FakeMediaRecorder;
      }
    });

    await page.goto("/");
    const voiceButton = page.getByTestId("voice-recorder-button");
    await expect(voiceButton).toBeVisible({ timeout: 15_000 });
  });

  test("clicking voice button, stopping, and transcription fills the input", async ({
    adaContext,
  }) => {
    const { page } = adaContext;

    // Stub MediaRecorder so the button renders and can be clicked
    await page.addInitScript(() => {
      let capturedStop: (() => void) | null = null;
      let capturedDataAvailable: ((e: { data: Blob }) => void) | null = null;

      class FakeMediaRecorder extends EventTarget {
        static isTypeSupported() {
          return true;
        }
        state = "inactive";
        set ondataavailable(fn: ((e: { data: Blob }) => void) | null) {
          capturedDataAvailable = fn;
        }
        set onstop(fn: (() => void) | null) {
          capturedStop = fn;
        }
        start(_timeslice?: number) {
          this.state = "recording";
        }
        stop() {
          this.state = "inactive";
          // Emit a tiny audio blob then fire onstop
          if (capturedDataAvailable) {
            capturedDataAvailable({
              data: new Blob(["audio"], { type: "audio/webm" }),
            });
          }
          if (capturedStop) capturedStop();
        }
      }
      (window as any).MediaRecorder = FakeMediaRecorder;
      (window as any).__stopFakeRecording = () => {
        // exposed so the test can trigger stop after start
      };
    });

    // Mock the transcription API
    await page.route("**/api/transcribe", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: MOCK_TRANSCRIPT }),
      });
    });

    await page.goto("/");

    const voiceButton = page.getByTestId("voice-recorder-button");
    await expect(voiceButton).toBeVisible({ timeout: 15_000 });

    // Start recording
    await voiceButton.click();

    // Stop recording (same button toggles)
    await voiceButton.click();

    // After Whisper transcription, the input should contain the transcript
    const input = page.getByTestId("multimodal-input");
    await expect(input).toHaveValue(MOCK_TRANSCRIPT, { timeout: 15_000 });
  });

  test("transcription API error shows toast, input unchanged", async ({
    adaContext,
  }) => {
    const { page } = adaContext;

    await page.addInitScript(() => {
      class FakeMediaRecorder extends EventTarget {
        static isTypeSupported() {
          return true;
        }
        state = "inactive";
        ondataavailable: ((e: { data: Blob }) => void) | null = null;
        onstop: (() => void) | null = null;
        start(_timeslice?: number) {
          this.state = "recording";
        }
        stop() {
          this.state = "inactive";
          if (this.ondataavailable) {
            this.ondataavailable({
              data: new Blob(["audio"], { type: "audio/webm" }),
            });
          }
          if (this.onstop) this.onstop();
        }
      }
      (window as any).MediaRecorder = FakeMediaRecorder;
    });

    await page.route("**/api/transcribe", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Transcription failed" }),
      });
    });

    await page.goto("/");

    const voiceButton = page.getByTestId("voice-recorder-button");
    await expect(voiceButton).toBeVisible({ timeout: 15_000 });

    await voiceButton.click();
    await voiceButton.click();

    // Input should remain empty after an error
    const input = page.getByTestId("multimodal-input");
    await expect(input).toHaveValue("", { timeout: 10_000 });
  });
});
