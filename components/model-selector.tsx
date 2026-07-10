"use client";

import type { Session } from "next-auth";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import useSWR from "swr";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAvailableModels } from "@/hooks/use-available-models";
import {
  entitlementsByUserType,
  FREE_TIER_MODEL_IDS,
} from "@/lib/ai/entitlements";
import { applyOrgModelPolicy, getModelIdealUse } from "@/lib/ai/model-config";
import {
  getModelTools,
  getToolDisplayName,
  getToolIcon,
  type ModelTool,
} from "@/lib/ai/model-tools";
import { chatModels } from "@/lib/ai/models";

function useUserTier() {
  const { data } = useSWR<{ tier: string }>(
    "/api/subscription/status",
    (url: string) => fetch(url).then((r) => r.json()),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
  return data?.tier ?? "free";
}

interface OrgPolicy {
  allowedModelIds?: string[] | null;
  deniedModelIds?: string[] | null;
}

function useOrgModelPolicy() {
  const { data } = useSWR<{ policy: OrgPolicy | null }>(
    "/api/org/model-policy",
    (url: string) => fetch(url).then((r) => r.json()),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
  return data?.policy ?? null;
}

import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToolFilters, setSelectedToolFilters] = useState<
    Set<ModelTool>
  >(new Set());

  // Fetch dynamic models from AI Gateway
  const { models: dynamicModels, isLoading, isFallback } = useAvailableModels();
  const orgPolicy = useOrgModelPolicy();

  const userType = session.user.type;
  const isGuest = userType === "guest";
  const userTier = useUserTier();
  const isPaidUser =
    userTier === "pro" || userTier === "premium" || userTier === "enterprise";

  // Use dynamic models if available, fallback to static models
  const availableChatModels = useMemo(() => {
    // Merge dynamic models with static models for backward compatibility
    const allModels =
      dynamicModels.length > 0
        ? [
            ...dynamicModels.map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              warning: m.warning,
              disabled: m.disabled,
              tags: m.tags,
            })),
            ...chatModels, // Keep legacy models
          ]
        : chatModels;

    // Guests see a restricted model list; regular users see everything
    if (isGuest) {
      const { availableChatModelIds } = entitlementsByUserType["guest"];
      return allModels.filter((chatModel) =>
        availableChatModelIds.includes(chatModel.id)
      );
    }
    // Remove duplicates (dynamic + legacy may overlap)
    const seen = new Set<string>();
    let deduped = allModels.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    // Apply org model policy (allowlist / denylist) for enterprise teams
    if (orgPolicy) {
      const allowedIds = applyOrgModelPolicy(
        deduped.map((m) => m.id),
        orgPolicy
      );
      const allowedSet = new Set(allowedIds);
      deduped = deduped.filter((m) => allowedSet.has(m.id));
    }

    return deduped;
  }, [dynamicModels, isGuest, orgPolicy]);

  const allAvailableTools = useMemo(() => {
    const toolsSet = new Set<ModelTool>();
    for (const model of availableChatModels) {
      const tools = getModelTools(model.id);
      for (const tool of tools) {
        toolsSet.add(tool);
      }
    }
    return Array.from(toolsSet);
  }, [availableChatModels]);

  const filteredModels = useMemo(() => {
    let models = availableChatModels;

    // Apply text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query)
      );
    }

    // Apply tool filters
    if (selectedToolFilters.size > 0) {
      models = models.filter((model) => {
        const modelTools = getModelTools(model.id);
        return Array.from(selectedToolFilters).every((tool) =>
          modelTools.includes(tool)
        );
      });
    }

    return models;
  }, [availableChatModels, searchQuery, selectedToolFilters]);

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId
      ),
    [optimisticModelId, availableChatModels]
  );

  const toggleToolFilter = (tool: ModelTool) => {
    setSelectedToolFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(tool)) {
        newFilters.delete(tool);
      } else {
        newFilters.add(tool);
      }
      return newFilters;
    });
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="md:h-[34px] md:px-2"
          data-testid="model-selector"
          variant="outline"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[280px] max-w-[90vw] sm:min-w-[400px]"
      >
        {/* Dynamic Model Discovery Status */}
        {(isLoading || isFallback || dynamicModels.length > 0) && (
          <div className="border-border border-b px-3 py-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Loading models from AI Gateway...
              </div>
            )}
            {!isLoading && dynamicModels.length > 0 && !isFallback && (
              <div className="flex items-center gap-2 text-green-600 text-xs dark:text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                {dynamicModels.length} models discovered dynamically
              </div>
            )}
            {isFallback && (
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                Using cached models (live data unavailable)
              </div>
            )}
          </div>
        )}

        <div className="p-2 pb-0">
          <Input
            className="mb-2 h-8 text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            value={searchQuery}
          />

          {allAvailableTools.length > 0 && (
            <div className="mb-2 flex flex-col gap-2">
              <div className="font-medium text-muted-foreground text-xs">
                Filter by tools:
              </div>
              <div className="flex flex-wrap gap-1">
                {allAvailableTools.map((tool) => (
                  <Badge
                    className={cn(
                      "h-6 cursor-pointer px-2 text-xs transition-colors",
                      selectedToolFilters.has(tool) &&
                        "bg-primary text-primary-foreground"
                    )}
                    key={tool}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleToolFilter(tool);
                    }}
                    variant={
                      selectedToolFilters.has(tool) ? "default" : "outline"
                    }
                  >
                    {(() => {
                      const Icon = getToolIcon(tool);
                      return <Icon className="mr-1 h-3 w-3" />;
                    })()}
                    {getToolDisplayName(tool)}
                  </Badge>
                ))}
                {selectedToolFilters.size > 0 && (
                  <Button
                    className="h-6 px-2 text-xs"
                    onClick={() => setSelectedToolFilters(new Set())}
                    size="sm"
                    variant="ghost"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredModels.map((chatModel) => {
            const { id } = chatModel;
            const modelTools = getModelTools(id);
            const idealUse = getModelIdealUse(id);
            const isPremiumModel = !FREE_TIER_MODEL_IDS.includes(id);
            const isEnvDisabled =
              "disabled" in chatModel && chatModel.disabled === true;
            const isFreeTierLocked = !isGuest && !isPaidUser && isPremiumModel;
            const isLocked = isEnvDisabled || isFreeTierLocked;
            const warning =
              "warning" in chatModel
                ? (chatModel as { warning?: string }).warning
                : undefined;
            const tags =
              "tags" in chatModel
                ? (chatModel as { tags?: string[] }).tags
                : undefined;

            return (
              <DropdownMenuItem
                asChild
                data-active={id === optimisticModelId}
                data-testid={`model-selector-item-${id}`}
                key={id}
                onSelect={
                  isLocked
                    ? (e) => e.preventDefault()
                    : () => {
                        setOpen(false);
                        setSearchQuery("");
                        setSelectedToolFilters(new Set());

                        startTransition(() => {
                          setOptimisticModelId(id);
                          saveChatModelAsCookie(id);
                        });
                      }
                }
              >
                <button
                  className={cn(
                    "group/item flex w-full flex-row items-center justify-between gap-2 sm:gap-4",
                    isLocked && "cursor-not-allowed opacity-50"
                  )}
                  disabled={isLocked}
                  type="button"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                    <div className="flex items-center gap-1.5 text-sm sm:text-base">
                      {chatModel.name}
                      {tags?.includes("experimental") && (
                        <Badge
                          className="h-4 px-1 font-semibold text-[9px] uppercase tracking-wide"
                          variant="outline"
                        >
                          Experimental
                        </Badge>
                      )}
                      {isPremiumModel && (
                        <Badge
                          className="h-4 px-1 font-semibold text-[9px] uppercase tracking-wide"
                          variant="secondary"
                        >
                          Plus
                        </Badge>
                      )}
                      {isEnvDisabled && (
                        <Badge
                          className="h-4 px-1 font-semibold text-[9px] uppercase tracking-wide"
                          variant="outline"
                        >
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className="line-clamp-2 text-muted-foreground text-xs">
                      {chatModel.description}
                    </div>
                    {warning && (
                      <div className="text-[10px] text-yellow-600 dark:text-yellow-400">
                        ⚠ {warning}
                      </div>
                    )}
                    {isFreeTierLocked && !isEnvDisabled && (
                      <div className="text-[10px] text-primary">
                        Upgrade to Plus to unlock
                      </div>
                    )}
                    {idealUse && (
                      <div className="text-[10px] text-muted-foreground/70 italic">
                        Best for: {idealUse}
                      </div>
                    )}
                    {modelTools.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {modelTools.map((tool) => (
                          <Badge
                            className="h-5 px-1.5 text-[10px]"
                            key={tool}
                            variant="secondary"
                          >
                            {(() => {
                              const Icon = getToolIcon(tool);
                              return <Icon className="mr-0.5 h-2.5 w-2.5" />;
                            })()}
                            {getToolDisplayName(tool)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            );
          })}
          {filteredModels.length === 0 && (
            <div className="py-8 text-center text-foreground/60 text-sm">
              {selectedToolFilters.size > 0
                ? "No models found with selected tools"
                : searchQuery.trim()
                  ? "No models found"
                  : "No models available"}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
