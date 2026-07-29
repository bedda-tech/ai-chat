"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CustomInstructionsFormProps = {
  initialValue: string;
};

export function CustomInstructionsForm({
  initialValue,
}: CustomInstructionsFormProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customInstructions: value }),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      toast.success("Custom instructions saved");
    } catch {
      toast.error("Failed to save custom instructions");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="font-medium text-sm" htmlFor="custom-instructions">
          Custom Instructions
        </Label>
        <p className="mt-1 text-muted-foreground text-xs">
          Tell the AI about yourself or how you want it to respond. These
          instructions are added to every conversation.
        </p>
      </div>
      <Textarea
        className="min-h-[140px] resize-y text-sm"
        id="custom-instructions"
        maxLength={2000}
        onChange={(e) => setValue(e.target.value)}
        placeholder="E.g. I'm a software engineer. Always respond concisely. Use TypeScript examples."
        value={value}
      />
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {value.length} / 2000 characters
        </span>
        <Button disabled={saving} onClick={handleSave} size="sm">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
