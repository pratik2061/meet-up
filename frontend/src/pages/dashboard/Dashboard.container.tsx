import { useValidateMeeting } from "@/util/api/api-hooks/use-meeting";
import {
  invalidateRecentLogs,
  useGetRecentLogs,
} from "@/util/api/api-hooks/use-recent-logs";
import {
  useGetReportActivity,
  useGetReportSummary,
} from "@/util/api/api-hooks/use-report";
import { DashboardView } from "./Dashboard.view";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMemo, useState } from "react";
import { HiUsers } from "react-icons/hi2";
import { GiVideoConference } from "react-icons/gi";
import { PiPresentation } from "react-icons/pi";
import type { statsCardProps } from "@/components/ui/stats-card";

const fallbackStatsData: statsCardProps[] = [
  {
    title: "Total users",
    value: "0",
    icon: HiUsers,
    change: "0% from last month",
    positive: true,
  },
  {
    title: "Total Meetings",
    value: "0",
    icon: GiVideoConference,
    change: "0% from last month",
    positive: true,
  },
  {
    title: "Total Ongoing meetings",
    value: "0",
    icon: PiPresentation,
    change: "0 active right now",
    positive: false,
  },
];

export const DashboardContainer = () => {
  const navigate = useNavigate();
  const { isPending, mutate } = useValidateMeeting();

  // Pagination & Search state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch);
    setPage(1);
  };

  const handleActionFilterChange = (newAction: string) => {
    setActionFilter(newAction);
    setPage(1);
  };

  const {
    data: logsResponse,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    refetch: refetchLogs,
  } = useGetRecentLogs({
    page,
    limit,
    search: searchTerm.trim() || undefined,
    action: actionFilter.trim() || undefined,
  });

  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useGetReportSummary();

  const {
    data: activityResponse,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
    refetch: refetchActivity,
  } = useGetReportActivity();

  const handleJoinMeeting = (roomId: string) => {
    const code = roomId.includes("/meeting/")
      ? roomId.split("/meeting/")[1].split("/")[0]
      : roomId.trim();
    if (!code) {
      toast.error("Please enter a valid meeting code");
      return;
    }

    mutate(code, {
      onSuccess: () => {
        invalidateRecentLogs();
        navigate(`/meeting/${code}`);
        toast.success("Room joined successfully");
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || "Invalid meeting code");
        } else {
          toast.error("Invalid meeting code");
        }
      },
    });
  };

  const handleRefreshAll = () => {
    refetchLogs();
    refetchSummary();
    refetchActivity();
  };

  const statsData: statsCardProps[] = useMemo(() => {
    if (!summaryResponse?.data?.statsCards) {
      return fallbackStatsData;
    }

    // Map the 3 primary metrics for the dashboard stats section
    return summaryResponse.data.statsCards
      .filter((card) =>
        ["totalUsers", "totalMeetings", "ongoingMeetings"].includes(card.metric)
      )
      .map((card) => {
        let icon = GiVideoConference;
        if (card.metric === "totalUsers") {
          icon = HiUsers;
        } else if (card.metric === "ongoingMeetings") {
          icon = PiPresentation;
        }

        return {
          title: card.title,
          value: card.value,
          icon,
          change: card.change,
          positive: card.positive,
        };
      });
  }, [summaryResponse]);

  return (
    <DashboardView
      isPending={isPending}
      handleJoinMeeting={handleJoinMeeting}
      recentLogs={logsResponse?.logsData}
      pagination={logsResponse?.pagination}
      page={page}
      limit={limit}
      searchTerm={searchTerm}
      actionFilter={actionFilter}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
      onSearchChange={handleSearchChange}
      onActionFilterChange={handleActionFilterChange}
      isLogsLoading={isLogsLoading}
      isLogsFetching={isLogsFetching || isSummaryFetching || isActivityFetching}
      onRefreshLogs={handleRefreshAll}
      statsData={statsData}
      activityData={activityResponse?.data}
      isStatsLoading={isSummaryLoading || !summaryResponse?.data}
      isActivityLoading={isActivityLoading || !activityResponse?.data}
    />
  );
};
