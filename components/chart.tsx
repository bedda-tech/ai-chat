"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

type ChartConfig = {
  chartType: "line" | "bar" | "area" | "pie";
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  xKey?: string;
  yKeys?: string[];
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
  unit?: string;
};

function formatValue(value: number, unit?: string): string {
  if (unit === "$") return `$${value.toLocaleString()}`;
  if (unit === "%") return `${value}%`;
  if (unit) return `${value}${unit}`;
  return value.toLocaleString();
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
      {label && (
        <p className="font-medium text-foreground mb-1">{label}</p>
      )}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatValue(entry.value, unit)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p className="text-muted-foreground">
        {formatValue(entry.value, unit)}{" "}
        <span className="text-xs">
          ({(entry.payload.percent * 100).toFixed(1)}%)
        </span>
      </p>
    </div>
  );
}

export function Chart({ config }: { config: ChartConfig }) {
  const colors = config.colors?.length ? config.colors : DEFAULT_COLORS;
  const yKeys = config.yKeys ?? [];

  const renderChart = () => {
    if (config.chartType === "pie") {
      const nameKey = config.nameKey ?? "name";
      const valueKey = config.valueKey ?? "value";

      return (
        <PieChart>
          <Pie
            data={config.data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={110}
            paddingAngle={2}
            label={(props) => {
              const name = props.name ?? "";
              const percent = props.percent ?? 0;
              return `${name} ${(percent * 100).toFixed(0)}%`;
            }}
            labelLine={false}
          >
            {config.data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            content={<PieTooltip unit={config.unit} />}
          />
          <Legend />
        </PieChart>
      );
    }

    const xKey = config.xKey ?? "name";

    const commonProps = {
      data: config.data,
      margin: { top: 4, right: 8, left: 0, bottom: 0 },
    };

    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v, config.unit)}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={60}
          className="text-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip unit={config.unit} />}
        />
        {yKeys.length > 1 && <Legend />}
      </>
    );

    if (config.chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {axes}
          {yKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              radius={[3, 3, 0, 0]}
              maxBarSize={60}
            />
          ))}
        </BarChart>
      );
    }

    if (config.chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          {axes}
          {yKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      );
    }

    // Default: line chart
    return (
      <LineChart {...commonProps}>
        {axes}
        {yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm w-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-card-foreground">
          {config.title}
        </h3>
        {config.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {config.description}
          </p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
