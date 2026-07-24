import useSWR from "swr";

export type ModelStatusKind = "removed" | "deprecated" | "degraded";

export type ModelStatusEntry = {
  status: ModelStatusKind;
  message: string;
  replacementId?: string;
  replacementName?: string;
  removedAt?: string;
};

export type RemovedModelEntry = {
  id: string;
  name: string;
  description: string;
  provider: string;
};

type ModelStatusFeed = {
  version: string;
  updated: string;
  statuses: Record<string, ModelStatusEntry>;
  removedModels?: RemovedModelEntry[];
};

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) {
      throw new Error("status feed unavailable");
    }
    return r.json() as Promise<ModelStatusFeed>;
  });

/** Fetches the static /model-status.json feed (1-hour SWR dedup) and returns per-model status flags and removed model list. */
export function useModelStatus() {
  const { data } = useSWR<ModelStatusFeed>("/model-status.json", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3_600_000,
    errorRetryCount: 1,
    shouldRetryOnError: false,
  });

  return {
    statuses: data?.statuses ?? {},
    removedModels: data?.removedModels ?? [],
  };
}
