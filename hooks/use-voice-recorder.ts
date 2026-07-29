"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "processing";

type UseVoiceRecorderOptions = {
  maxDurationMs?: number;
  onBlob: (blob: Blob) => void | Promise<void>;
  onError?: (error: Error) => void;
};

export function useVoiceRecorder({
  maxDurationMs = 60_000,
  onBlob,
  onError,
}: UseVoiceRecorderOptions) {
  const [state, setState] = useState<RecorderState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => {
      t.stop();
    });
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (state !== "idle") {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stopStream();
        setState("processing");
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        try {
          await onBlob(blob);
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setState("idle");
        }
      };

      recorder.onerror = () => {
        stopStream();
        setState("idle");
        onError?.(new Error("Recording failed. Please try again."));
      };

      recorder.start(250);
      setState("recording");

      autoStopTimerRef.current = setTimeout(stopRecording, maxDurationMs);
    } catch (err) {
      stopStream();
      setState("idle");
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone permissions."
          : "Could not access microphone. Please try again.";
      onError?.(new Error(message));
    }
  }, [state, maxDurationMs, onBlob, onError, stopRecording, stopStream]);

  useEffect(
    () => () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      mediaRecorderRef.current?.stop();
      stopStream();
    },
    [stopStream]
  );

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "mediaDevices" in navigator &&
    typeof MediaRecorder !== "undefined";

  return { state, startRecording, stopRecording, isSupported };
}
