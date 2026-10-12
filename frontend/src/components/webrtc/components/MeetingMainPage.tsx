import { useEffect, useState } from "react";
import MeetingRoom from "./MeetingRoom";
import MeetingPreview from "./MeetingPreview";
import { useCreateMeeting, useGetMeeting } from "@/util/api/api-hooks/use-meeting";
import { useCurrentUser } from "@/util/api/api-hooks/use-current-user";
import type { MeetingResponse } from "@/pages/meeting/types/meeting-types";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export interface MediaConfig {
  isMicOn: boolean;
  isCameraOn: boolean;
}
function MeetingMainPage() {
  const { roomId: roomIdFromUrl } = useParams();
  const navigate = useNavigate();
  const [hasJoined, setHasJoined] = useState(false);
  const [mediaConfig, setMediaConfig] = useState<MediaConfig>({
    isMicOn: true,
    isCameraOn: true,
  });

  const [roomId, setRoomId] = useState<string>("");
  const [isCreatedByMe, setIsCreatedByMe] = useState(false);
  const { mutateAsync: createMeeting, isPending } = useCreateMeeting();
  const { data: currentUser } = useCurrentUser();

  const activeRoomId = roomIdFromUrl && roomIdFromUrl !== "new" ? roomIdFromUrl : roomId;
  const { data: meetingQueryData } = useGetMeeting(activeRoomId);

  // If meeting was already completed, inform user and redirect to dashboard
  useEffect(() => {
    if (meetingQueryData?.meetingData?.meetingStatus === "completed") {
      toast.error("This meeting has already ended");
      navigate("/dashboard", { replace: true });
    }
  }, [meetingQueryData?.meetingData?.meetingStatus, navigate]);

  const meetingHostId =
    typeof meetingQueryData?.meetingData?.host === "object" &&
    meetingQueryData?.meetingData?.host !== null
      ? meetingQueryData.meetingData.host._id
      : meetingQueryData?.meetingData?.host;

  const currentUserId = currentUser?.data?._id;
  const isHost =
    isCreatedByMe ||
    Boolean(
      currentUserId &&
        meetingHostId &&
        String(currentUserId) === String(meetingHostId)
    );

  async function handleJoin(micStatus: boolean, cameraStatus: boolean) {
    let finalRoomId = roomIdFromUrl;
    if (!finalRoomId || finalRoomId === "new") {
      const meetingDetail = (await createMeeting()) as MeetingResponse;
      finalRoomId = meetingDetail.meetingData.roomId;
      setIsCreatedByMe(true);
    }
    setRoomId(finalRoomId);
    setMediaConfig({
      isMicOn: micStatus,
      isCameraOn: cameraStatus,
    });
    setHasJoined(true);
    navigate(`/meeting/${finalRoomId}`, {
      replace: true,
    });
  }

  function handleLeave() {
    setHasJoined(false);
    navigate("/dashboard", {
      replace: true,
    });
  }

  return hasJoined ? (
    <MeetingRoom
      isMicOn={mediaConfig.isMicOn}
      isCameraOn={mediaConfig.isCameraOn}
      onLeave={handleLeave}
      roomId={roomId || activeRoomId}
      isHost={isHost}
    />
  ) : (
    <MeetingPreview onJoin={handleJoin} isPending={isPending} />
  );
}

export default MeetingMainPage;
