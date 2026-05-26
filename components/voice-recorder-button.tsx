"use client";

import { type Dispatch, memo, type SetStateAction, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { MicIcon, MicOffIcon } from "./icons";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

function PureVoiceRecorderButton({
  setInput,
  disabled,
}: {
  setInput: Dispatch<SetStateAction<string>>;
  disabled?: boolean;
}) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      typeof navigator !== "undefined" &&
        "mediaDevices" in navigator &&
        typeof MediaRecorder !== "undefined"
    );
  }, []);

  const handleBlob = useCallback(
    async (blob: Blob) => {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Transcription failed");
      }

      const { text } = await response.json();
      if (text?.trim()) {
        setInput((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
      }
    },
    [setInput]
  );

  const handleError = useCallback((err: Error) => {
    toast.error(err.message);
  }, []);

  const { state, startRecording, stopRecording } = useVoiceRecorder({
    maxDurationMs: 60_000,
    onBlob: handleBlob,
    onError: handleError,
  });

  if (!isSupported) return null;

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "aspect-square h-8 rounded-lg p-1 transition-colors",
            isRecording
              ? "animate-pulse bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : isProcessing
                ? "cursor-wait bg-muted text-muted-foreground"
                : "hover:bg-accent"
          )}
          data-testid="voice-recorder-button"
          disabled={disabled || isProcessing}
          onClick={isRecording ? stopRecording : startRecording}
          variant="ghost"
          type="button"
          aria-label={isRecording ? "Stop recording" : "Record voice message"}
        >
          {isRecording ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isRecording
          ? "Stop recording"
          : isProcessing
            ? "Transcribing…"
            : "Voice input — record & transcribe with Whisper"}
      </TooltipContent>
    </Tooltip>
  );
}

export const VoiceRecorderButton = memo(PureVoiceRecorderButton);
