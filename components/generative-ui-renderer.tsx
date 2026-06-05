"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Square,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
} from "lucide-react";

// --- Types ---
type ColumnDef = { key: string; label: string; type?: "text" | "number" | "badge" | "url" };
type Row = Record<string, string | number | null>;
type ChecklistItem = { id: string; label: string; checked: boolean; description?: string };
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
type ComparisonRow = { feature: string; values: Array<string | boolean | number> };

export type GenerativeUIComponent =
  | { type: "table"; title: string; description?: string; columns: ColumnDef[]; rows: Row[] }
  | { type: "checklist"; title: string; description?: string; items: ChecklistItem[] }
  | { type: "stats"; title: string; description?: string; items: StatItem[] }
  | { type: "timeline"; title: string; description?: string; items: TimelineItem[] }
  | { type: "comparison"; title: string; description?: string; columns: string[]; rows: ComparisonRow[] };

// --- Table ---
function DataTable({ title, description, columns, rows }: Extract<GenerativeUIComponent, { type: "table" }>) {
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
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden my-2">
      {(title || description) && (
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          {title && <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none whitespace-nowrap"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
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
                key={i}
                className={cn(
                  "border-b last:border-0 border-zinc-100 dark:border-zinc-800",
                  i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
                )}
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td key={col.key} className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                      {col.type === "url" && val ? (
                        <a href={String(val)} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline truncate max-w-[200px] block">
                          {String(val)}
                        </a>
                      ) : col.type === "badge" ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
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
      <div className="px-4 py-2 bg-zinc-50/50 dark:bg-zinc-800/20 text-xs text-zinc-400 text-right border-t border-zinc-100 dark:border-zinc-800">
        {rows.length} rows · click column header to sort
      </div>
    </div>
  );
}

// --- Checklist ---
function Checklist({ title, description, items: initial }: Extract<GenerativeUIComponent, { type: "checklist" }>) {
  const [items, setItems] = useState(initial);

  function toggle(id: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  }

  const done = items.filter((i) => i.checked).length;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden my-2">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
        <div>
          {title && <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
          {done}/{items.length}
        </span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
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
              <span className={cn("text-sm", item.checked && "line-through text-zinc-400 dark:text-zinc-600")}>
                {item.label}
              </span>
              {item.description && (
                <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {done === items.length && items.length > 0 && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-950/30 text-xs text-green-600 dark:text-green-400 text-center font-medium border-t border-zinc-100 dark:border-zinc-800">
          All done! ✓
        </div>
      )}
    </div>
  );
}

// --- Stats ---
function Stats({ title, description, items }: Extract<GenerativeUIComponent, { type: "stats" }>) {
  return (
    <div className="my-2">
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((stat, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 bg-zinc-50/50 dark:bg-zinc-800/30"
          >
            {stat.icon && <span className="text-lg mb-1 block">{stat.icon}</span>}
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {stat.value}{stat.unit && <span className="text-sm font-normal text-zinc-500 ml-1">{stat.unit}</span>}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</div>
            {stat.change && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs mt-1 font-medium",
                stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-500" : "text-zinc-500"
              )}>
                {stat.trend === "up" ? <TrendingUp className="size-3" /> : stat.trend === "down" ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
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
function Timeline({ title, description, items }: Extract<GenerativeUIComponent, { type: "timeline" }>) {
  return (
    <div className="my-2">
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="relative">
        <div className="absolute left-[1.125rem] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="relative flex gap-4 pl-2">
              <div className={cn(
                "size-6 rounded-full border-2 shrink-0 flex items-center justify-center z-10",
                item.status === "completed"
                  ? "bg-green-500 border-green-500"
                  : item.status === "current"
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
              )}>
                {item.status === "completed" && <Check className="size-3 text-white" />}
                {item.status === "current" && <div className="size-2 rounded-full bg-white" />}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{item.title}</span>
                  <span className="text-xs text-zinc-400">{item.date}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
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
function Comparison({ title, description, columns, rows }: Extract<GenerativeUIComponent, { type: "comparison" }>) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden my-2">
      {(title || description) && (
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          {title && <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
              <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400 w-1/4">Feature</th>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-2 text-center font-medium text-zinc-700 dark:text-zinc-200">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={cn(
                "border-b last:border-0 border-zinc-100 dark:border-zinc-800",
                i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
              )}>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium text-sm">{row.feature}</td>
                {row.values.map((val, j) => (
                  <td key={j} className="px-4 py-2 text-center">
                    {typeof val === "boolean" ? (
                      val ? (
                        <Check className="size-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="size-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{String(val)}</span>
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
export function GenerativeUIRenderer({ component }: { component: GenerativeUIComponent }) {
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
