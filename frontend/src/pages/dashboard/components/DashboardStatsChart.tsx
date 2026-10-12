"use client";

import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { ReportActivityItem } from "@/pages/report/types/report-types";
import { BarChart3 } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ensureSixMonths = (data?: ReportActivityItem[]): ReportActivityItem[] => {
  const minMonths = 6;
  if (!data || data.length === 0) {
    const now = new Date();
    const result: ReportActivityItem[] = [];
    for (let i = minMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = MONTH_NAMES[d.getMonth()];
      result.push({
        month,
        shortMonth: month.slice(0, 3),
        year: d.getFullYear(),
        totalMeetings: 0,
        completedMeetings: 0,
        ongoingMeetings: 0,
        participants: 0,
        desktop: 0,
        mobile: 0,
      });
    }
    return result;
  }

  if (data.length >= minMonths) {
    return data;
  }

  // Prepend earlier consecutive months to reach 6 continuous months
  const first = data[0];
  const firstMonthIndex = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === (first.month || "").toLowerCase()
  );

  const baseYear = first.year || new Date().getFullYear();
  const baseMonth = firstMonthIndex >= 0 ? firstMonthIndex : new Date().getMonth();
  const needed = minMonths - data.length;
  const prepended: ReportActivityItem[] = [];

  for (let i = needed; i >= 1; i--) {
    const d = new Date(baseYear, baseMonth - i, 1);
    const month = MONTH_NAMES[d.getMonth()];
    prepended.push({
      month,
      shortMonth: month.slice(0, 3),
      year: d.getFullYear(),
      totalMeetings: 0,
      completedMeetings: 0,
      ongoingMeetings: 0,
      participants: 0,
      desktop: 0,
      mobile: 0,
    });
  }

  return [...prepended, ...data];
};

const chartConfig = {
  desktop: {
    label: "Total Meetings",
    color: "var(--barChart-primary)",
  },
  mobile: {
    label: "Completed",
    color: "var(--barChart-secondary)",
  },
} satisfies ChartConfig;

interface DashboardStatsChartProps {
  data?: ReportActivityItem[];
  isLoading?: boolean;
}

export function DashboardStatsChart({
  data,
  isLoading = false,
}: DashboardStatsChartProps) {
  const chartData = useMemo(() => ensureSixMonths(data), [data]);

  if (isLoading) {
    return (
      <div className="min-h-50 max-h-75 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="w-8 h-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
        <span className="text-xs">Loading activity metrics...</span>
      </div>
    );
  }

  const hasActivity = chartData.some(
    (item) => (item.desktop || 0) > 0 || (item.mobile || 0) > 0
  );

  return (
    <div className="w-full relative">
      <ChartContainer config={chartConfig} className="min-h-50 max-h-75 w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          barGap={10}
          barCategoryGap="5%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
          <XAxis
            dataKey="shortMonth"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value, index) =>
              value || (chartData[index]?.month ? chartData[index].month.slice(0, 3) : "")
            }
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex items-center justify-between gap-4 text-xs w-full">
                    <span className="text-muted-foreground">
                      {name === "desktop" ? "Total Meetings" : "Completed"}:
                    </span>
                    <span className="font-semibold">{value}</span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="desktop"
            fill="var(--barChart-primary)"
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
          <Bar
            dataKey="mobile"
            fill="var(--barChart-secondary)"
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ChartContainer>

      {!hasActivity && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-background/50 backdrop-blur-[1px]">
          <BarChart3 className="w-8 h-8 text-muted-foreground/40 mb-1" />
          <p className="text-xs font-medium text-muted-foreground">
            No meeting activity recorded for this period
          </p>
        </div>
      )}
    </div>
  );
}
