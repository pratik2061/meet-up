import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetFriends,
  useGetFriendRequests,
  useSearchUsers,
  useSendFriendRequest,
  useRespondFriendRequest,
  useRemoveFriend,
} from "@/util/api/api-hooks/use-friends";
import { useCreateMeeting } from "@/util/api/api-hooks/use-meeting";
import { FriendsView, type FriendsTab } from "./Friends.view";
import type { FriendUser } from "./types/friends.types";

export const FriendsContainer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FriendsTab>("all");
  const [friendSearchFilter, setFriendSearchFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startingFriendId, setStartingFriendId] = useState<string | null>(null);
  const [sendingTargetId, setSendingTargetId] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(
    null
  );

  // Queries
  const { data: friends = [], isLoading: isLoadingFriends } = useGetFriends();
  const { data: requestsData, isLoading: isLoadingRequests } =
    useGetFriendRequests();
  const { data: searchResults, isLoading: isSearchingUsers } = useSearchUsers(
    searchQuery,
    activeTab === "find"
  );

  // Mutations
  const sendRequestMutation = useSendFriendRequest();
  const respondRequestMutation = useRespondFriendRequest();
  const removeFriendMutation = useRemoveFriend();
  const createMeetingMutation = useCreateMeeting();

  // Instant meeting with friend
  const handleStartMeeting = async (friend: FriendUser) => {
    try {
      setStartingFriendId(friend._id);
      const res = await createMeetingMutation.mutateAsync({
        meetingType: "instant",
      });

      const meetingData = (res as any)?.meetingData || (res as any)?.data || res;
      const roomId = meetingData?.roomId || meetingData?.meetingId;

      if (roomId) {
        toast.success(`Meeting created for ${friend.fullName}!`);
        navigate(`/meeting/${roomId}`);
      } else {
        // Fallback to /meeting/new
        navigate("/meeting/new");
      }
    } catch (error) {
      toast.error("Failed to start meeting");
    } finally {
      setStartingFriendId(null);
    }
  };

  // Generate invite link and copy message
  const handleCopyInvite = async (friend: FriendUser) => {
    try {
      setStartingFriendId(friend._id);
      const res = await createMeetingMutation.mutateAsync({
        meetingType: "instant",
      });

      const meetingData = (res as any)?.meetingData || (res as any)?.data || res;
      const roomId = meetingData?.roomId || meetingData?.meetingId;

      if (roomId) {
        const inviteLink = `${window.location.origin}/meeting/${roomId}`;
        const inviteText = `Hey ${friend.fullName}, let's talk on MeetUp! Join room: ${inviteLink}`;
        await navigator.clipboard.writeText(inviteText);
        toast.success(`Invite link for ${friend.fullName} copied to clipboard!`);
      } else {
        toast.error("Could not generate meeting link");
      }
    } catch (error) {
      toast.error("Failed to generate meeting invite");
    } finally {
      setStartingFriendId(null);
    }
  };

  const handleSendRequest = (payload: {
    email?: string;
    recipientId?: string;
  }) => {
    setSendingTargetId(payload.recipientId || null);
    sendRequestMutation.mutate(payload, {
      onSettled: () => setSendingTargetId(null),
    });
  };

  const handleRespondRequest = (
    requestId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    setRespondingRequestId(requestId);
    respondRequestMutation.mutate(
      { requestId, status },
      {
        onSettled: () => setRespondingRequestId(null),
      }
    );
  };

  const handleCancelOutgoing = (requestId: string) => {
    removeFriendMutation.mutate(requestId);
  };

  const handleRemoveFriend = (targetId: string) => {
    removeFriendMutation.mutate(targetId);
  };

  return (
    <FriendsView
      activeTab={activeTab}
      onTabChange={setActiveTab}
      friends={friends}
      isLoadingFriends={isLoadingFriends}
      requestsData={requestsData}
      isLoadingRequests={isLoadingRequests}
      friendSearchFilter={friendSearchFilter}
      onFriendSearchFilterChange={setFriendSearchFilter}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchResults={searchResults}
      isSearchingUsers={isSearchingUsers}
      onStartMeeting={handleStartMeeting}
      onCopyInvite={handleCopyInvite}
      onRemoveFriend={handleRemoveFriend}
      onSendRequest={handleSendRequest}
      onRespondRequest={handleRespondRequest}
      onCancelOutgoingRequest={handleCancelOutgoing}
      isStartingMeeting={createMeetingMutation.isPending}
      startingFriendId={startingFriendId}
      isSendingRequest={sendRequestMutation.isPending}
      sendingTargetId={sendingTargetId}
      isRespondingRequest={respondRequestMutation.isPending}
      respondingRequestId={respondingRequestId}
    />
  );
};
