import { HiUsers } from "react-icons/hi2";
import Reportview from "./Report.view";
import { GiVideoConference } from "react-icons/gi";
import { PiPresentation } from "react-icons/pi";

function Reportcontainer() {
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
    <>
      <Reportview statsData={dummyStatsData} />
    </>
  );
}

export default Reportcontainer;
