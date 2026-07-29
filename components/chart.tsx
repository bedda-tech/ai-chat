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
  if (unit === "$") {
    return `$${value.toLocaleString()}`;
  }
  if (unit === "%") {
    return `${value}%`;
  }
  if (unit) {
    return `${value}${unit}`;
  }
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
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry) => (
        <div className="flex items-center gap-2" key={entry.name}>
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
  payload?: Array<{
    name: string;
    value: number;
    payload: { percent: number };
  }>;
  unit?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
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
            cx="50%"
            cy="50%"
            data={config.data}
            dataKey={valueKey}
            label={(props) => {
              const name = props.name ?? "";
              const percent = props.percent ?? 0;
              return `${name} ${(percent * 100).toFixed(0)}%`;
            }}
            labelLine={false}
            nameKey={nameKey}
            outerRadius={110}
            paddingAngle={2}
          >
            {config.data.map((_, index) => (
              <Cell
                fill={colors[index % colors.length]}
                key={`cell-${index}`}
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip unit={config.unit} />} />
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
        <CartesianGrid className="stroke-border" strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          className="text-muted-foreground"
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          className="text-muted-foreground"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => formatValue(v, config.unit)}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip unit={config.unit} />} />
        {yKeys.length > 1 && <Legend />}
      </>
    );

    if (config.chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {axes}
          {yKeys.map((key, i) => (
            <Bar
              dataKey={key}
              fill={colors[i % colors.length]}
              key={key}
              maxBarSize={60}
              radius={[3, 3, 0, 0]}
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
              activeDot={{ r: 4 }}
              dataKey={key}
              dot={false}
              fill={colors[i % colors.length]}
              fillOpacity={0.15}
              key={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              type="monotone"
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
            activeDot={{ r: 4 }}
            dataKey={key}
            dot={false}
            key={key}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            type="monotone"
          />
        ))}
      </LineChart>
    );
  };

  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="font-semibold text-card-foreground text-sm">
          {config.title}
        </h3>
        {config.description && (
          <p className="mt-0.5 text-muted-foreground text-xs">
            {config.description}
          </p>
        )}
      </div>
      <ResponsiveContainer height={260} width="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
