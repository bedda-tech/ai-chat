"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  CheckSquare,
  Minus,
  Square,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- Types ---
type ColumnDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "badge" | "url";
};
type Row = Record<string, string | number | null>;
type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  description?: string;
};
type StatItem = {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
};
type TimelineItem = {
  date: string;
  title: string;
  description?: string;
  status?: "completed" | "current" | "upcoming";
};
type ComparisonRow = {
  feature: string;
  values: Array<string | boolean | number>;
};

export type GenerativeUIComponent =
  | {
      type: "table";
      title: string;
      description?: string;
      columns: ColumnDef[];
      rows: Row[];
    }
  | {
      type: "checklist";
      title: string;
      description?: string;
      items: ChecklistItem[];
    }
  | { type: "stats"; title: string; description?: string; items: StatItem[] }
  | {
      type: "timeline";
      title: string;
      description?: string;
      items: TimelineItem[];
    }
  | {
      type: "comparison";
      title: string;
      description?: string;
      columns: string[];
      rows: ComparisonRow[];
    };

// --- Table ---
function DataTable({
  title,
  description,
  columns,
  rows,
}: Extract<GenerativeUIComponent, { type: "table" }>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      })
    : rows;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      {(title || description) && (
        <div className="border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          {title && (
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-zinc-200 border-b bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/30">
              {columns.map((col) => (
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-2 text-left font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                className={cn(
                  "border-zinc-100 border-b last:border-0 dark:border-zinc-800",
                  i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
                )}
                key={i}
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td
                      className="px-4 py-2 text-zinc-800 dark:text-zinc-200"
                      key={col.key}
                    >
                      {col.type === "url" && val ? (
                        <a
                          className="block max-w-[200px] truncate text-blue-500 underline"
                          href={String(val)}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {String(val)}
                        </a>
                      ) : col.type === "badge" ? (
                        <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                          {String(val ?? "")}
                        </span>
                      ) : (
                        <span>{String(val ?? "")}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-zinc-100 border-t bg-zinc-50/50 px-4 py-2 text-right text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/20">
        {rows.length} rows · click column header to sort
      </div>
    </div>
  );
}

// --- Checklist ---
function Checklist({
  title,
  description,
  items: initial,
}: Extract<GenerativeUIComponent, { type: "checklist" }>) {
  const [items, setItems] = useState(initial);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  const done = items.filter((i) => i.checked).length;

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div>
          {title && (
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          )}
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
          {done}/{items.length}
        </span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item) => (
          <div
            className="flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            key={item.id}
            onClick={() => toggle(item.id)}
          >
            <div className="mt-0.5 shrink-0">
              {item.checked ? (
                <CheckSquare className="size-4 text-green-500" />
              ) : (
                <Square className="size-4 text-zinc-400" />
              )}
            </div>
            <div>
              <span
                className={cn(
                  "text-sm",
                  item.checked &&
                    "text-zinc-400 line-through dark:text-zinc-600"
                )}
              >
                {item.label}
              </span>
              {item.description && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {done === items.length && items.length > 0 && (
        <div className="border-zinc-100 border-t bg-green-50 px-4 py-2 text-center font-medium text-green-600 text-xs dark:border-zinc-800 dark:bg-green-950/30 dark:text-green-400">
          All done! ✓
        </div>
      )}
    </div>
  );
}

// --- Stats ---
function Stats({
  title,
  description,
  items,
}: Extract<GenerativeUIComponent, { type: "stats" }>) {
  return (
    <div className="my-2">
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((stat, i) => (
          <div
            className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30"
            key={i}
          >
            {stat.icon && (
              <span className="mb-1 block text-lg">{stat.icon}</span>
            )}
            <div className="font-bold text-xl text-zinc-900 dark:text-zinc-100">
              {stat.value}
              {stat.unit && (
                <span className="ml-1 font-normal text-sm text-zinc-500">
                  {stat.unit}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </div>
            {stat.change && (
              <div
                className={cn(
                  "mt-1 flex items-center gap-0.5 font-medium text-xs",
                  stat.trend === "up"
                    ? "text-green-600"
                    : stat.trend === "down"
                      ? "text-red-500"
                      : "text-zinc-500"
                )}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3" />
                ) : stat.trend === "down" ? (
                  <TrendingDown className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Timeline ---
function Timeline({
  title,
  description,
  items,
}: Extract<GenerativeUIComponent, { type: "timeline" }>) {
  return (
    <div className="my-2">
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          )}
        </div>
      )}
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-[1.125rem] w-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-3">
          {items.map((item, i) => (
            <div className="relative flex gap-4 pl-2" key={i}>
              <div
                className={cn(
                  "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  item.status === "completed"
                    ? "border-green-500 bg-green-500"
                    : item.status === "current"
                      ? "border-blue-500 bg-blue-500"
                      : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
                )}
              >
                {item.status === "completed" && (
                  <Check className="size-3 text-white" />
                )}
                {item.status === "current" && (
                  <div className="size-2 rounded-full bg-white" />
                )}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </span>
                  <span className="text-xs text-zinc-400">{item.date}</span>
                </div>
                {item.description && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Comparison ---
function Comparison({
  title,
  description,
  columns,
  rows,
}: Extract<GenerativeUIComponent, { type: "comparison" }>) {
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      {(title || description) && (
        <div className="border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          {title && (
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-zinc-200 border-b bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/30">
              <th className="w-1/4 px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Feature
              </th>
              {columns.map((col, i) => (
                <th
                  className="px-4 py-2 text-center font-medium text-zinc-700 dark:text-zinc-200"
                  key={i}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                className={cn(
                  "border-zinc-100 border-b last:border-0 dark:border-zinc-800",
                  i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
                )}
                key={i}
              >
                <td className="px-4 py-2 font-medium text-sm text-zinc-600 dark:text-zinc-400">
                  {row.feature}
                </td>
                {row.values.map((val, j) => (
                  <td className="px-4 py-2 text-center" key={j}>
                    {typeof val === "boolean" ? (
                      val ? (
                        <Check className="mx-auto size-4 text-green-500" />
                      ) : (
                        <X className="mx-auto size-4 text-zinc-300 dark:text-zinc-600" />
                      )
                    ) : (
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {String(val)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Dispatcher ---
export function GenerativeUIRenderer({
  component,
}: {
  component: GenerativeUIComponent;
}) {
  switch (component.type) {
    case "table":
      return <DataTable {...component} />;
    case "checklist":
      return <Checklist {...component} />;
    case "stats":
      return <Stats {...component} />;
    case "timeline":
      return <Timeline {...component} />;
    case "comparison":
      return <Comparison {...component} />;
    default:
      return null;
  }
}
