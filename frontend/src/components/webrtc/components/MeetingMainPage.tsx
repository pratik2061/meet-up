import { useState } from "react";
import MeetingRoom from "./MeetingRoom";
import MeetingPreview from "./MeetingPreview";

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

  function handleJoin(micStatus: boolean, cameraStatus: boolean) {
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
    />
  ) : (
    <MeetingPreview onJoin={handleJoin} />
  );
}

export default MeetingMainPage;