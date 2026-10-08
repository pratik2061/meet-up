import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWebRTC } from "@/util/hooks/webrtc-hook";
import { Copy, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

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

  const [micActive, setMicActive] = useState(isMicOn);
  const [cameraActive, setCameraActive] = useState(isCameraOn);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };


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
    <section className="fixed inset-0 z-50 flex flex-col bg-white p-4 text-slate-900 md:p-6">
      <header className="flex items-center justify-between gap-4 pb-4">
        {/* Share Meeting */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm hover:border-primary/30 hover:bg-primary/5"
            >
              <Copy size={16} />
              <span className="hidden sm:inline">Share meeting</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share meeting</DialogTitle>
              <DialogDescription>
                Share this meeting room ID with the participant you want to invite.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Meeting room ID
              </p>

              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="break-all font-mono text-sm font-medium text-slate-800">
                    {roomId}
                  </p>
                </div>

                <Button
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl"
                  onClick={async () => {
                    await navigator.clipboard.writeText(roomId);
                    toast.success("Room ID copied to clipboard");
                  }}
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>


      <main className="relative flex min-h-0 flex-1 items-center justify-center">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xl font-semibold">?</span>
              </div>

              <div>
                <p className="font-medium text-slate-700">
                  Waiting for another participant
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Share the meeting room ID to invite someone
                </p>
              </div>
            </div>
          )}

          {localStream && (
            <div className="absolute bottom-5 right-5 overflow-hidden rounded-xl border-2 border-white bg-slate-200 shadow-xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-32 w-44 object-cover -scale-x-100 sm:h-40 sm:w-56"
              />

              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                You
              </div>
            </div>
          )}

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-primary/20  bg-white/20 p-2 shadow-xl backdrop-blur-md sm:gap-3 sm:p-3">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all ${micActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              onClick={toggleMic}
              title={micActive ? "Mute microphone" : "Unmute microphone"}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all ${cameraActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              onClick={toggleCamera}
              title={cameraActive ? "Turn off camera" : "Turn on camera"}
            >
              {cameraActive ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>

            <div className="mx-1 h-8 w-px bg-slate-200" />

            <Button
              variant="destructive"
              className="h-12 rounded-xl px-4 sm:px-6"
              onClick={onLeave}
            >
              <span className="hidden sm:inline">Leave</span>
              <span className="sm:hidden">Leave</span>
            </Button>
          </div>
        </div>
      </main>
    </section>

  );
}

export default MeetingRoom;