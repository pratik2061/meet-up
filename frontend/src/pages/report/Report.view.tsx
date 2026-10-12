import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStatsChart } from "../dashboard/components/DashboardStatsChart";
import { ReportPieChart } from "./components/ReportPieChart";
import {
  StatsCard,
  StatsCardSkeleton,
  type statsCardProps,
} from "@/components/ui/stats-card";
import { ReportDateRangeFilter } from "./components/ReportDateRangeFilter";
import { ReportDownloadOption } from "./components/ReportDownloadOption";
import type { DateRange } from "react-day-picker";
import type {
  MeetingTypeDistributionItem,
  ReportActivityItem,
} from "./types/report-types";
import { RefreshCw } from "lucide-react";

interface ReportViewProps {
  statsData: statsCardProps[];
  distributionData?: MeetingTypeDistributionItem[];
  totalMeetings?: number;
  distributionDescription?: string;
  activityData?: ReportActivityItem[];
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onExport: () => void;
  isExporting: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  dateRangeLabel?: string;
}

function Reportview({
  statsData,
  distributionData,
  totalMeetings = 0,
  distributionDescription,
  activityData,
  dateRange,
  onDateRangeChange,
  onExport,
  isExporting,
  isLoading,
  isFetching,
  onRefresh,
  dateRangeLabel,
}: ReportViewProps) {
  return (
    <div className="w-full lg:px-6 px-4 lg:py-4 py-2 space-y-4 md:space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Monitor platform engagement, meeting metrics, and trends.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 md:gap-3">
          <ReportDateRangeFilter
            date={dateRange}
            onDateChange={onDateRangeChange}
            disabled={isLoading || isFetching}
          />
          <ReportDownloadOption
            onExport={onExport}
            isExporting={isExporting}
            disabled={isLoading}
          />
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="p-2 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Refresh report data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={`report-stats-skeleton-${i}`} />
            ))
          : statsData.map((v, i) => (
              <StatsCard
                key={`${v.title}-${i}`}
                title={v.title}
                value={v.value}
                icon={v.icon}
                change={v.change}
                positive={v.positive}
              />
            ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ReportPieChart
          data={distributionData}
          totalMeetings={totalMeetings}
          description={distributionDescription}
          dateRangeLabel={dateRangeLabel}
          isLoading={isLoading}
        />

        <Card className="flex flex-col">
          <CardHeader className="items-center pb-2">
            <CardTitle className="text-base font-semibold">
              Meeting Activity Trend
            </CardTitle>
            <CardDescription>
              Monthly meeting frequency and completion volume
            </CardDescription>
          </CardHeader>
          <div className="p-4 flex-1 flex items-center justify-center">
            <DashboardStatsChart data={activityData} isLoading={isLoading} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Reportview;
