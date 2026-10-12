import { useMemo, useState } from "react";
import { HiUsers } from "react-icons/hi2";
import { GiVideoConference } from "react-icons/gi";
import { PiPresentation } from "react-icons/pi";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { subDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import Reportview from "./Report.view";
import {
  useExportReportCsv,
  useGetReportOverview,
} from "@/util/api/api-hooks/use-report";
import type { statsCardProps } from "@/components/ui/stats-card";
import type { ReportQueryParams } from "./types/report-types";

const fallbackStatsData: statsCardProps[] = [
  {
    title: "Total users",
    value: "0",
    icon: HiUsers,
    change: "0% from last period",
    positive: true,
  },
  {
    title: "Total Meetings",
    value: "0",
    icon: GiVideoConference,
    change: "0% from last period",
    positive: true,
  },
  {
    title: "Total Ongoing meetings",
    value: "0",
    icon: PiPresentation,
    change: "0 active right now",
    positive: false,
  },
  {
    title: "Completed Meetings",
    value: "0",
    icon: IoCheckmarkDoneCircleOutline,
    change: "0 completed",
    positive: true,
  },
];

function Reportcontainer() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = subDays(to, 30);
    return { from, to };
  });

  const queryParams = useMemo<ReportQueryParams>(() => {
    return {
      startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
      endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
    };
  }, [dateRange]);

  const {
    data: overviewResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetReportOverview(queryParams);

  const { mutate: exportCsv, isPending: isExporting } = useExportReportCsv();

  const handleExport = () => {
    exportCsv(queryParams);
  };

  const statsData: statsCardProps[] = useMemo(() => {
    if (!overviewResponse?.summary?.statsCards) {
      return fallbackStatsData;
    }

    return overviewResponse.summary.statsCards.map((card) => {
      let icon = GiVideoConference;
      if (card.metric === "totalUsers") {
        icon = HiUsers;
      } else if (card.metric === "ongoingMeetings") {
        icon = PiPresentation;
      } else if (card.metric === "completedMeetings") {
        icon = IoCheckmarkDoneCircleOutline;
      }

      return {
        title: card.title,
        value: card.value,
        icon,
        change: card.change,
        positive: card.positive,
      };
    });
  }, [overviewResponse]);

  const dateRangeLabel = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
        dateRange.to,
        "MMM dd, yyyy"
      )}`;
    }
    return undefined;
  }, [dateRange]);

  return (
    <Reportview
      statsData={statsData}
      distributionData={overviewResponse?.distribution?.byType}
      totalMeetings={overviewResponse?.distribution?.totalMeetings}
      distributionDescription={overviewResponse?.distribution?.description}
      activityData={overviewResponse?.activity}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onExport={handleExport}
      isExporting={isExporting}
      isLoading={isLoading}
      isFetching={isFetching}
      onRefresh={refetch}
      dateRangeLabel={dateRangeLabel}
    />
  );
}

export default Reportcontainer;
