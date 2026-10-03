import { useState } from "react";
import MeetingRoom from "./MeetingRoom";
import MeetingPreview from "./MeetingPreview";
import { useCreateMeeting } from "@/util/api/api-hooks/use-meeting";
import type { MeetingResponse } from "@/pages/meeting/types/meeting-types";

export interface MediaConfig {
  isMicOn: boolean;
  isCameraOn: boolean;
}
function MeetingMainPage() {
  const [hasJoined, setHasJoined] = useState(false);
  const [mediaConfig, setMediaConfig] = useState<MediaConfig>({
    isMicOn: true,
    isCameraOn: true,
  });
  const [roomId, setRoomId] = useState<string>("")
  const { mutateAsync: createMeeting, isPending } = useCreateMeeting();

  async function handleJoin(micStatus: boolean, cameraStatus: boolean) {
    const meetingDetail = await createMeeting() as MeetingResponse;
    setRoomId(meetingDetail.meetingData.roomId)
    setMediaConfig({
      isMicOn: micStatus,
      isCameraOn: cameraStatus,
    });
    setHasJoined(true);
  }

  function handleLeave() {
    setHasJoined(false);
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
