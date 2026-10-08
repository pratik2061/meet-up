import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { FiVideo } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function DashboardQuickAction({
  isPending,
  handleJoinMeeting
}: {
  isPending: boolean
  handleJoinMeeting: (id: string) => void
}) {
  const [meetingCode, setMeetingCode] = useState("")

  const handleJoin = () => {
    console.log(meetingCode)
    if (!meetingCode.trim()) return
    handleJoinMeeting(meetingCode)
  }
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <span className="block py-4 px-5 font-semibold text-xl bg-primary/10 rounded-t-2xl ">
        Quick Actions
      </span>

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 justify-center">
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

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="meeting-code"
            className="text-sm font-medium text-gray-600"
          >
            Join a meeting
          </label>
          <div className="flex flex-col xl:flex-row gap-2 w-full">
            <input
              id="meeting-code"
              type="text"
              placeholder="Enter code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}

              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none  focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full bg-primary/80 xl:w-auto px-6 py-2.5  text-white font-semibold rounded-xl hover:bg-primary text-sm">
              {
                isPending ? (<Spinner className="w-full "/>) : 'Join'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
