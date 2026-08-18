import { HiUsers } from "react-icons/hi2";

import { StatsCard } from "@/components/ui/stats-card";
import { GiVideoConference } from "react-icons/gi";
import { PiPresentation } from "react-icons/pi";
import { DashboardStatsChart } from "./components/DashboardStatsChart";
import DashboardQuickAction  from "./components/DashboardQuickAction";
import { DashboardRecentTable } from "./components/DashboardRecentTable";

export const DashboardView = () => {
  const dummyStatsData = [
    {
      title: "Total users",
      value: "12,450",
      icon: HiUsers,
      change: "+12.5% from last month",
      positive: true,
    },
    {
      title: "Total Meetings",
      value: "450",
      icon: GiVideoConference,
      change: "+12.5% from last month",
      positive: true,
    },
    {
      title: "Total Ongoing meetings",
      value: "12",
      icon: PiPresentation,
      change: "+12.5% from last month",
      positive: true,
    },
  ];
  return (
    <section>
      {/* sats card div */}
      <div className="w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {dummyStatsData.map((v) => (
          <StatsCard
            key={v.value}
            title={v.title}
            value={v.value}
            icon={v.icon}
            change={v.change}
            positive={v.positive}
          />
        ))}
      </div>

      {/* chart and Quick action div  */}
      <div className="w-full py-4 px-4 grid grid-cols-1 md:grid-cols-[70%_auto] gap-2 md:gap-4">
        <div className="">
          <span className="block py-4 px-4 font-semibold text-xl">
            Meetings Activity
          </span>
          <div className="font-semibold text-xl  rounded-xl   py-6">
            <DashboardStatsChart />
          </div>
        </div>
        <DashboardQuickAction />
      </div>

      {/* Recent logs table */}
      <div className="w-full px-4 py-4">
        <span className="block py-4 px-2 font-semibold text-xl">
          Recent Logs
        </span>
        <DashboardRecentTable />
      </div>
    </section>
  );
};
