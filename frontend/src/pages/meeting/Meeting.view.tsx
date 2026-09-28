import { FiVideo } from "react-icons/fi";
import MeetingScheduleCalender from "./components/MeetingScheduleCalender";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";

function MeetingView() {
  return (
    <div className="bg-white text-gray-900 font-sans p-6  flex flex-col justify-center items-center">
      {/* Main Layout Container - Uses Grid for the two columns */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* ==========================================
            LEFT COLUMN: Quick Actions (Start / Join)
            ========================================== */}
        <div className="flex flex-col space-y-4">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-800">
              Premium video meetings.
              <br />
              Now free for everyone.
            </h1>
            <p className="text-gray-500 text-lg max-w-md">
              Connect, collaborate, and celebrate from anywhere with secure
              video meetings.
            </p>
          </div>

          {/* Slot for your Quick Action Components */}
          <div className="flex flex-col md:flex-row items-center gap-2 mt-4">
            {/* Replace with your "Start New Meeting" Component */}
            <Link
              to={"/meeting/new"}
              className="w-full px-2 py-3 bg-primary/80 hover:bg-primary text-white font-medium rounded-md hover:cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <FiVideo className="w-5 h-5" />
              New Meeting
            </Link>

            {/* Replace with your "Join Meeting" Component */}
            <div className="flex w-full items-center border border-gray-300 rounded-md px-2 py-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <FaLink className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Enter a code or link"
                className="outline-none bg-transparent w-full text-gray-700"
              />
            </div>

            <button className="text-primary md:w-auto w-full border border-primary bg-primary/20 hover:cursor-pointer font-medium px-4 py-3 rounded-md hover:bg-primary hover:text-white transition duration-300 ">
              Join
            </button>
          </div>

          <hr className="border-gray-200 block lg:hidden my-8" />
        </div>

        {/* ==========================================
            RIGHT COLUMN: Scheduling / Calendar
            ========================================== */}
        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-xl p-6 md:p-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              Schedule a Meeting
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Pick a date and time to generate a future meeting link.
            </p>
            <div className="bg-gray-50  border-gray-300 rounded-lg   text-gray-400 mb-6">
              <MeetingScheduleCalender />
            </div>

            {/* Replace with your Schedule Action Component */}
            <button className="w-full px-6 py-3 bg-primary/80 hover:bg-primary hover:cursor-pointer text-white font-medium rounded-md transition-colors">
              Schedule Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingView;
