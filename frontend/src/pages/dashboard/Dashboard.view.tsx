import { HiUsers } from "react-icons/hi2";

import { StatsCard } from "@/components/ui/stats-card";

export const DashboardView = () => {
  return (
    <>
      <div>
        <StatsCard
          title="Total Users"
          value="12,450"
          icon={HiUsers}
          change="+12.5% from last month"
          positive
        />
      </div>
    </>
  );
};
