"use client";

import { Pie, PieChart, Cell } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MeetingTypeDistributionItem } from "../types/report-types";

const defaultColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

const fallbackChartConfig: ChartConfig = {
  visitors: {
    label: "Meetings",
  },
  casualMeeting: {
    label: "Casual Meeting",
    color: "var(--chart-1)",
  },
  formalMeeting: {
    label: "Formal Meeting",
    color: "var(--chart-2)",
  },
  studyMeeting: {
    label: "Study Meeting",
    color: "var(--chart-3)",
  },
  otherMeeting: {
    label: "Other Meeting",
    color: "var(--chart-4)",
  },
};

interface ReportPieChartProps {
  data?: MeetingTypeDistributionItem[];
  totalMeetings?: number;
  description?: string;
  dateRangeLabel?: string;
  isLoading?: boolean;
}

export function ReportPieChart({
  data = [],
  totalMeetings = 0,
  description,
  dateRangeLabel,
  isLoading = false,
}: ReportPieChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill || defaultColors[index % defaultColors.length],
  }));

  const hasData = totalMeetings > 0 && chartData.some((d) => d.count > 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base font-semibold">
          Meeting Type Distribution
        </CardTitle>
        <CardDescription>
          {dateRangeLabel || "Overview for selected period"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center min-h-[250px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <div className="w-24 h-24 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <span className="text-xs">Loading distribution...</span>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <PieChartIcon className="w-10 h-10 opacity-40 stroke-1" />
            <p className="text-sm font-medium">No meeting records found</p>
            <p className="text-xs text-muted-foreground/75">
              Create meetings to see type distribution
            </p>
          </div>
        ) : (
          <ChartContainer
            config={fallbackChartConfig}
            className="mx-auto aspect-square max-h-[250px] w-full px-0"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="label"
                    formatter={(value, name) => (
                      <div className="flex items-center justify-between gap-4 w-full text-xs">
                        <span className="text-muted-foreground">{name}:</span>
                        <span className="font-semibold">{value} meetings</span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ payload, ...props }) => {
                  if (!payload.count) return null;
                  return (
                    <text
                      cx={props.cx}
                      cy={props.cy}
                      x={props.x}
                      y={props.y}
                      textAnchor={props.textAnchor}
                      dominantBaseline={props.dominantBaseline}
                      fill="var(--foreground)"
                      fontSize={11}
                      fontWeight={600}
                    >
                      {payload.percentage}%
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || defaultColors[index % defaultColors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.fill || defaultColors[idx % defaultColors.length] }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">({item.count})</span>
            </div>
          ))}
        </div>
        <div className="leading-none text-muted-foreground text-xs text-center mt-1">
          {description ||
            `Showing distribution across ${totalMeetings} total meetings`}
        </div>
      </CardFooter>
    </Card>
  );
}
