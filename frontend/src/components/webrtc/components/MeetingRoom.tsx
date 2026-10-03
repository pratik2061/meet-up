import { Button } from "@/components/ui/button";
import { useWebRTC } from "@/util/hooks/webrtc-hook";
import { useEffect, useRef } from "react";

interface MeetingRoomProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  onLeave: () => void;
  roomId: string
}

function MeetingRoom({ isMicOn, isCameraOn, onLeave, roomId }: MeetingRoomProps) {

  const { localStream, remoteStream } = useWebRTC(roomId, isMicOn, isCameraOn)

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Watch local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  // Watch remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <section className="flex min-h-full flex-col bg-slate-950 p-4 text-white">
      <header className="flex items-center justify-between pb-4">
        <div>
          <p className="text-sm text-slate-400">Meeting room</p>
          <h1 className="text-xl font-semibold">Ready to connect</h1>
        </div>

        <Button variant="destructive" onClick={onLeave}>
          Leave meeting
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center">
        <div className="relative flex aspect-video w-full max-w-5xl items-center justify-center rounded-2xl bg-slate-800 overflow-hidden">
          {/* //Video of the person joins */}
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <p className="text-slate-400">Waiting for another participant to join…</p>
          )}
          {/* Local Video (You - Small and floating in the corner) */}
          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 h-32 w-48 rounded-lg object-cover shadow-lg border-2 border-slate-600"
            />
          )}
        </div>
      </main>
    </section>
  );
}

export default MeetingRoom;