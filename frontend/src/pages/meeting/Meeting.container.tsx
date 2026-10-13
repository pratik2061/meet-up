import {
  useGetAllMeetings,
  useValidateMeeting,
  useCancelMeeting,
} from "@/util/api/api-hooks/use-meeting";
import { useCurrentUser } from "@/util/api/api-hooks/use-current-user";
import MeetingView from "./Meeting.view";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import type { FilterTab } from "./components/MeetingListSection";

function MeetingContainer() {
  const [meetingCode, setMeetingCode] = useState("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [cancellingRoomId, setCancellingRoomId] = useState<string | null>(null);

  const navigate = useNavigate();

  const { data: currentUserResponse } = useCurrentUser();
  const currentUserId =
    currentUserResponse?.data?._id ||
    (currentUserResponse as unknown as { _id?: string })?._id;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    setPage(1);
  };

  const handleTabChange = (newTab: FilterTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

  const {
    data: meetingsResponse,
    isLoading: isLoadingMeetings,
    isFetching: isFetchingMeetings,
    isError: isMeetingsError,
    refetch: refetchMeetings,
  } = useGetAllMeetings({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
  });

  const { mutate: validateMeeting, isPending } = useValidateMeeting();
  const { mutate: cancelMeetingMutate, isPending: isCancellingMeeting } =
    useCancelMeeting();

  const handleCancelMeeting = (roomId: string) => {
    setCancellingRoomId(roomId);
    cancelMeetingMutate(roomId, {
      onSettled: () => {
        setCancellingRoomId(null);
      },
    });
  };

  const handleJoin = async (customCode?: string) => {
    const targetCode = customCode || meetingCode;
    if (!targetCode.trim()) return;

    const code = targetCode.includes("/meeting/")
      ? targetCode.split("/meeting/")[1].split("/")[0]
      : targetCode.trim();

    if (!code) {
      toast.error("Please enter a valid meeting code");
      return;
    }

    validateMeeting(code, {
      onSuccess: () => {
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

  return (
    <MeetingView
      meetingCode={meetingCode}
      setMeetingCode={setMeetingCode}
      handleJoin={handleJoin}
      isPending={isPending}
      meetings={meetingsResponse?.meetingsData || []}
      pagination={meetingsResponse?.pagination}
      counts={meetingsResponse?.counts}
      page={page}
      limit={limit}
      searchQuery={searchQuery}
      activeTab={activeTab}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
      onSearchChange={handleSearchChange}
      onTabChange={handleTabChange}
      isLoadingMeetings={isLoadingMeetings}
      isFetchingMeetings={isFetchingMeetings}
      isMeetingsError={isMeetingsError}
      currentUserId={currentUserId}
      onRefreshMeetings={refetchMeetings}
      onCancelMeeting={handleCancelMeeting}
      isCancellingMeeting={isCancellingMeeting}
      cancellingRoomId={cancellingRoomId}
    />
  );
}

export default MeetingContainer;
