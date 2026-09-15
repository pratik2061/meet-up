import { FiVideo } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function DashboardQuickAction() {
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <span className="block py-4 px-5 font-semibold text-xl bg-primary/10 rounded-t-2xl ">
        Quick Actions
      </span>

      {/* Changed to strictly vertical stacking (flex-col) to fit the narrow grid column */}
      <div className="flex-1 px-4 py-2 flex flex-col gap-6 justify-center">
        {/* Section 1: Start New Meeting (Moved to top as primary action) */}
        <div className="w-full flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-600">
            Host a meeting
          </span>
          <Link
            to="/meeting/new"
            className="w-full px-4 py-3 bg-primary/80  text-white font-medium rounded-xl hover:bg-primary hover:cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <FiVideo className="w-5 h-5" />
            New Meeting
          </Link>
        </div>

        {/* Divider (Always horizontal now) */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Section 2: Join Meeting */}
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="meeting-code"
            className="text-sm font-medium text-gray-600"
          >
            Join a meeting
          </label>
          {/* Stacks input and button on smaller desktops, puts them inline on huge screens */}
          <div className="flex flex-col xl:flex-row gap-2 w-full">
            <input
              id="meeting-code"
              type="text"
              placeholder="Enter code"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none  focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
            <button className="w-full bg-primary/80 xl:w-auto px-6 py-2.5  text-white font-semibold rounded-xl hover:bg-primary text-sm">
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
