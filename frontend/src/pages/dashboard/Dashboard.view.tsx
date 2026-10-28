import { DashboardStatsChart } from "./components/DashboardStatsChart";
import DashboardQuickAction from "./components/DashboardQuickAction";
import { DashboardRecentTable } from "./components/DashboardRecentTable";
import { RefreshCw } from "lucide-react";

import type {
  RecentLogItem,
  RecentLogPagination,
} from "./types/recent-log-types";
import type { ReportActivityItem } from "../report/types/report-types";

interface DashboardViewProps {
  isPending: boolean;
  handleJoinMeeting: (id: string) => void;
  recentLogs?: RecentLogItem[];
  pagination?: RecentLogPagination;
  page: number;
  limit: number;
  searchTerm: string;
  actionFilter: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onActionFilterChange: (action: string) => void;
  isLogsLoading?: boolean;
  isLogsFetching?: boolean;
  onRefreshLogs?: () => void;
  activityData?: ReportActivityItem[];
  isActivityLoading?: boolean;
}

export const DashboardView = ({
  isPending,
  handleJoinMeeting,
  recentLogs,
  pagination,
  page,
  limit,
  searchTerm,
  actionFilter,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onActionFilterChange,
  isLogsLoading,
  isLogsFetching,
  onRefreshLogs,
  activityData,
  isActivityLoading,
}: DashboardViewProps) => {
  return (
    <section className="lg:px-6 px-4 lg:py-4 py-2 space-y-2 md:space-y-4 lg:space-y-6">

      {/* chart and Quick action div  */}
      <div className="w-full py-4 px-4 grid grid-cols-1 md:grid-cols-[70%_auto] gap-2 md:gap-4">
        <div>
          <span className="block py-4 px-4 font-semibold text-xl">
            Meetings Activity
          </span>
          <div className="font-semibold text-xl rounded-xl py-6">
            <DashboardStatsChart
              data={activityData}
              isLoading={isActivityLoading}
            />
          </div>
        </div>
        <DashboardQuickAction
          isPending={isPending}
          handleJoinMeeting={handleJoinMeeting}
        />
      </div>

      {/* Recent logs table */}
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between py-4 px-2">
          <span className="font-semibold text-xl">Recent Logs</span>
          {onRefreshLogs && (
            <button
              onClick={() => onRefreshLogs()}
              disabled={isLogsFetching}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh dashboard data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isLogsFetching ? "animate-spin text-primary" : ""
                }`}
              />
              <span>{isLogsFetching ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}
        </div>
        <DashboardRecentTable
          logs={recentLogs}
          pagination={pagination}
          page={page}
          limit={limit}
          searchTerm={searchTerm}
          actionFilter={actionFilter}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          onSearchChange={onSearchChange}
          onActionFilterChange={onActionFilterChange}
          isLoading={isLogsLoading}
        />
      </div>
    </section>
  );
};
