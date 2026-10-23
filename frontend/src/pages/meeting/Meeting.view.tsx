import { FiVideo } from "react-icons/fi";
import MeetingScheduleCalender from "./components/MeetingScheduleCalender";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import type {
  MeetingDetailsResponse,
  MeetingPagination,
  MeetingStatusCounts,
} from "./types/meeting-types";
import {
  MeetingListSection,
  type FilterTab,
} from "./components/MeetingListSection";

interface MeetingViewProps {
  meetingCode: string;
  setMeetingCode: (code: string) => void;
  handleJoin: (customCode?: string) => void;
  isPending: boolean;
  meetings?: MeetingDetailsResponse[];
  pagination?: MeetingPagination;
  counts?: MeetingStatusCounts;
  page?: number;
  limit?: number;
  searchQuery?: string;
  activeTab?: FilterTab;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSearchChange?: (search: string) => void;
  onTabChange?: (tab: FilterTab) => void;
  isLoadingMeetings?: boolean;
  isFetchingMeetings?: boolean;
  isMeetingsError?: boolean;
  currentUserId?: string;
  onRefreshMeetings?: () => void;
  onCancelMeeting?: (roomId: string) => void;
  isCancellingMeeting?: boolean;
  cancellingRoomId?: string | null;
}

function MeetingView({
  meetingCode,
  setMeetingCode,
  handleJoin,
  isPending,
  meetings,
  pagination,
  counts,
  page,
  limit,
  searchQuery,
  activeTab,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onTabChange,
  isLoadingMeetings,
  isFetchingMeetings,
  isMeetingsError,
  currentUserId,
  onRefreshMeetings,
  onCancelMeeting,
  isCancellingMeeting,
  cancellingRoomId,
}: MeetingViewProps) {
  return (
    <div className="min-h-full bg-background text-foreground font-sans px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="flex flex-col space-y-4">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-foreground">
              Premium video meetings.
              <br />
              <span className="text-primary font-medium">Now free for everyone.</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md">
              Connect, collaborate, and celebrate from anywhere with secure
              video meetings.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
            <Link
              to={"/meeting/new"}
              className="w-full md:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg hover:cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs whitespace-nowrap text-sm"
            >
              <FiVideo className="w-4 h-4" />
              New Meeting
            </Link>

            <div className="flex w-full items-center border border-border bg-card rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <FaLink className="text-muted-foreground mr-2 shrink-0 text-xs" />
              <input
                type="text"
                placeholder="Enter a code or link"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="outline-none bg-transparent w-full text-foreground text-xs sm:text-sm placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={() => handleJoin()}
              disabled={isPending || !meetingCode.trim()}
              className="text-primary md:w-auto w-full border border-primary/40 bg-primary/10 hover:cursor-pointer font-medium px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {isPending ? <Spinner className="size-4" /> : "Join"}
            </button>
          </div>

          <hr className="border-border block lg:hidden my-4" />
        </div>

        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[420px] bg-card border border-border shadow-xs rounded-2xl p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Schedule a Meeting
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Pick a date and time to generate a future meeting link.
              </p>
            </div>

            <MeetingScheduleCalender />
          </div>
        </div>
      </div>

      <MeetingListSection
        meetings={meetings}
        pagination={pagination}
        counts={counts}
        page={page}
        limit={limit}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onSearchChange={onSearchChange}
        onTabChange={onTabChange}
        isLoading={isLoadingMeetings}
        isFetching={isFetchingMeetings}
        isError={isMeetingsError}
        currentUserId={currentUserId}
        onRefresh={onRefreshMeetings}
        onJoin={(roomId) => handleJoin(roomId)}
        isJoining={isPending}
        onCancel={onCancelMeeting}
        isCancelling={isCancellingMeeting}
        cancellingRoomId={cancellingRoomId}
      />
    </div>
  );
}

export default MeetingView;

