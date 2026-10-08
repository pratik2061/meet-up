import { useState } from "react";
import MeetingRoom from "./MeetingRoom";
import MeetingPreview from "./MeetingPreview";
import { useCreateMeeting } from "@/util/api/api-hooks/use-meeting";
import type { MeetingResponse } from "@/pages/meeting/types/meeting-types";
import { useNavigate, useParams } from "react-router-dom";

export interface MediaConfig {
  isMicOn: boolean;
  isCameraOn: boolean;
}
function MeetingMainPage() {
  const { roomId: roomIdFromUrl } = useParams();
  const navigate = useNavigate()
  const [hasJoined, setHasJoined] = useState(false);
  const [mediaConfig, setMediaConfig] = useState<MediaConfig>({
    isMicOn: true,
    isCameraOn: true,
  });

  const [roomId, setRoomId] = useState<string>("")
  const { mutateAsync: createMeeting, isPending } = useCreateMeeting();

  async function handleJoin(micStatus: boolean, cameraStatus: boolean) {
    let finalRoomId = roomIdFromUrl
    if (!finalRoomId) {
      const meetingDetail = await createMeeting() as MeetingResponse;
      finalRoomId = meetingDetail.meetingData.roomId
    }
    setRoomId(finalRoomId)
    setMediaConfig({
      isMicOn: micStatus,
      isCameraOn: cameraStatus,
    });
    setHasJoined(true);
    navigate(`/meeting/${finalRoomId}`, {
      replace: true
    })
  }

  function handleLeave() {
    setHasJoined(false);
    navigate('/meeting/new', {
      replace: true
    })
  }

  return hasJoined ? (
    <MeetingRoom
      isMicOn={mediaConfig.isMicOn}
      isCameraOn={mediaConfig.isCameraOn}
      onLeave={handleLeave}
      roomId={roomId}
    />
  ) : (
    <MeetingPreview onJoin={handleJoin} isPending={isPending} />
  );
}

export default MeetingMainPage;
