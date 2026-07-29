"use client";

import { BookOpen } from "lucide-react";
import { memo, useState } from "react";
import {
  getPromptsByCategory,
  PROMPT_CATEGORIES,
  type PromptCategory,
} from "@/lib/prompt-library";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type PromptLibraryModalProps = {
  onSelect: (prompt: string, modelId?: string) => void;
};

function PurePromptLibraryModal({ onSelect }: PromptLibraryModalProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<PromptCategory>("writing");

  const _templates = getPromptsByCategory(activeCategory);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="gap-2 rounded-full border border-muted-foreground/40 border-dashed px-4 py-2 text-muted-foreground text-sm transition-colors hover:border-muted-foreground/70 hover:text-foreground"
            onClick={() => setOpen(true)}
            type="button"
            variant="ghost"
          >
            <BookOpen className="h-4 w-4" />
            Browse templates
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          30 prompt templates across 6 categories
        </TooltipContent>
      </Tooltip>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Prompt Library
            </DialogTitle>
            <DialogDescription>
              Choose a template to get started. Click any prompt to use it.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            className="flex min-h-0 flex-1 flex-col"
            onValueChange={(v) => setActiveCategory(v as PromptCategory)}
            value={activeCategory}
          >
            <TabsList className="mx-6 mb-0 h-auto shrink-0 flex-wrap justify-start gap-1 bg-transparent p-0">
              {PROMPT_CATEGORIES.map((cat) => (
                <TabsTrigger
                  className="rounded-full border border-transparent px-3 py-1 text-xs data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  key={cat.id}
                  value={cat.id}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PROMPT_CATEGORIES.map((cat) => (
              <TabsContent
                className="mt-3 min-h-0 flex-1 data-[state=inactive]:hidden"
                key={cat.id}
                value={cat.id}
              >
                <ScrollArea className="h-[420px] px-6 pb-6">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {getPromptsByCategory(cat.id).map((template) => (
                      <button
                        className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5 text-left transition-colors hover:border-foreground/30 hover:bg-accent"
                        key={template.id}
                        onClick={() => {
                          onSelect(template.prompt, template.modelId);
                          setOpen(false);
                        }}
                        type="button"
                      >
                        <div className="font-medium text-foreground text-sm group-hover:text-accent-foreground">
                          {template.title}
                        </div>
                        <div className="line-clamp-3 text-muted-foreground text-xs leading-relaxed group-hover:text-accent-foreground/70">
                          {template.prompt}
                        </div>
                        {template.modelId && (
                          <div className="mt-0.5 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            Optimized model
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const PromptLibraryModal = memo(PurePromptLibraryModal);
