import {
  Card,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStatsChart } from "../dashboard/components/DashboardStatsChart";
import { ReportPieChart } from "./components/ReportPieChart";
import { StatsCard, type statsCardProps } from "@/components/ui/stats-card";
import { ReportDateRangeFilter } from "./components/ReportDateRangeFilter";
import { ReportDownloadOption } from "./components/ReportDownloadOption";

function Reportview({ statsData }: { statsData: statsCardProps[] }) {
  return (
    <>
      <div className=" w-full lg:px-6 px-4  lg:py-4 py-2 space-y-2 md:space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {statsData.map((v, i) => (
            <StatsCard
              key={i}
              title={v.title}
              value={v.value}
              icon={v.icon}
              change={v.change}
              positive={v.positive}
            />
          ))}
        </div>
        <div className="w-ful flex items-center justify-end space-x-2 md:space-x-4">
          <ReportDateRangeFilter />
          <span className="flex items-center">
            <ReportDownloadOption />
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          <ReportPieChart />
          <Card>
            <CardHeader className="items-center pb-0">
              <CardTitle>Meeting activity</CardTitle>
              {/* <CardDescription>January - June 2024</CardDescription> */}
            </CardHeader>
            <DashboardStatsChart />
          </Card>
        </div>
      </div>
    </>
  );
}

export default Reportview;
