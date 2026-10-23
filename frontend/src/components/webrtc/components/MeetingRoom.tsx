import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type RemoteParticipant, useWebRTC } from "@/util/hooks/webrtc-hook";
import { useEndMeeting, useGetMeeting } from "@/util/api/api-hooks/use-meeting";
import { MeetingFriendsSheet } from "./MeetingFriendsSheet";
import {
  Clock,
  Copy,
  LogOut,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Pin,
  PinOff,
  UserPlus,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface MeetingRoomProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  onLeave: () => void;
  roomId: string;
  isHost: boolean;
  startedAt?: Date | string;
}

function formatMeetingDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

// Dedicated Remote Video Tile
function RemoteVideoTile({
  participant,
  onPin,
  isPinned,
}: {
  participant: RemoteParticipant;
  onPin?: () => void;
  isPinned?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const displayName = participant.user?.email
    ? participant.user.email.split("@")[0]
    : "Participant";

  return (
    <div className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-slate-200 shadow-md">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm z-10 flex items-center gap-1.5">
        <span className="max-w-[160px] truncate">
          {participant.user?.email || displayName}
        </span>
      </div>

      {onPin && (
        <button
          onClick={onPin}
          title={isPinned ? "Unpin participant" : "Pin participant"}
          className="absolute top-2 right-2 rounded-lg bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70 z-10 cursor-pointer"
        >
          {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>
      )}
    </div>
  );
}

function MeetingRoom({
  isMicOn,
  isCameraOn,
  onLeave,
  roomId,
  isHost,
  startedAt,
}: MeetingRoomProps) {
  const { data: meetingQueryData } = useGetMeeting(roomId);
  const effectiveStartedAt = startedAt || meetingQueryData?.meetingData?.startedAt;

  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Sync with backend start timestamp if available
  useEffect(() => {
    if (effectiveStartedAt) {
      const parsedTime = new Date(effectiveStartedAt).getTime();
      if (!isNaN(parsedTime) && parsedTime <= Date.now()) {
        startTimeRef.current = parsedTime;
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - parsedTime) / 1000)));
      }
    }
  }, [effectiveStartedAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startTimeRef.current) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { mutateAsync: mutateEndMeeting, isPending: isEndingMeeting } =
    useEndMeeting();
  const [isEnding, setIsEnding] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isFriendsSheetOpen, setIsFriendsSheetOpen] = useState(false);
  const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);

  const {
    localStream,
    screenStream,
    remoteParticipants,
    isScreenSharing,
    toggleScreenShare,
    leaveMeeting,
    endMeeting: emitEndMeeting,
  } = useWebRTC(roomId, isMicOn, isCameraOn, onLeave);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const singleRemoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

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

  const handleEndMeeting = async () => {
    try {
      setIsEnding(true);
      emitEndMeeting();
      await mutateEndMeeting(roomId);
      toast.success("Meeting ended successfully");
      setIsEndDialogOpen(false);
      onLeave();
    } catch (error) {
      console.error("Error ending meeting:", error);
      onLeave();
    } finally {
      setIsEnding(false);
    }
  };

  const handleLeaveMeeting = () => {
    leaveMeeting();
    toast.success("Left the meeting");
    onLeave();
  };

  // Watch local stream for 1-on-1 or waiting state
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, cameraActive]);

  // Watch 1st remote stream when in 1-on-1 mode
  useEffect(() => {
    if (
      singleRemoteVideoRef.current &&
      remoteParticipants.length === 1 &&
      remoteParticipants[0].stream
    ) {
      singleRemoteVideoRef.current.srcObject = remoteParticipants[0].stream;
    }
  }, [remoteParticipants]);

  // Watch screen share stream
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Clean up pinned user if they left
  useEffect(() => {
    if (
      pinnedSocketId &&
      !remoteParticipants.some((p) => p.socketId === pinnedSocketId)
    ) {
      setPinnedSocketId(null);
    }
  }, [pinnedSocketId, remoteParticipants]);

  // Responsive grid layout calculation for 2+ remote participants
  const getGridCols = (totalParticipants: number) => {
    if (totalParticipants <= 2) return "grid-cols-1 md:grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-1 sm:grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  };

  const pinnedParticipant = remoteParticipants.find(
    (p) => p.socketId === pinnedSocketId
  );
  const otherParticipants = remoteParticipants.filter(
    (p) => p.socketId !== pinnedSocketId
  );

  return (
    <section className="fixed inset-0 z-50 flex flex-col bg-white p-4 text-slate-900 md:p-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 pb-4">
        {/* Left Action Buttons: Share & Add Friends */}
        <div className="flex items-center gap-2">
          {/* Share Meeting Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
              >
                <Copy size={16} />
                <span className="hidden sm:inline">Share meeting</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share meeting</DialogTitle>
                <DialogDescription>
                  Share this meeting room ID or invite your friends directly.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-600">
                    Meeting room ID
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                      <p className="break-all font-mono text-xs sm:text-sm font-medium text-slate-800">
                        {roomId}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl cursor-pointer"
                      onClick={async () => {
                        await navigator.clipboard.writeText(roomId);
                        toast.success("Room ID copied to clipboard");
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Want to invite your friends?
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFriendsSheetOpen(true)}
                    className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 rounded-xl cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>Open Friends</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        {/* Right Section: Timer & Participant Count Badge */}
        <div className="flex items-center gap-2">
          {/* Meeting Timer */}
          <div
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm"
            title="Meeting duration"
          >
            <Clock size={15} className="text-primary" />
            <span className="font-mono font-medium tabular-nums text-slate-700">
              {formatMeetingDuration(elapsedSeconds)}
            </span>
          </div>

          {/* Participant Count Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm">
            <Users size={15} className="text-primary" />
            <span>
              {remoteParticipants.length + 1} participant
              {remoteParticipants.length === 0 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Video Viewport */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          {/* Active Screen Share View (Google Meet style presentation) */}
          {isScreenSharing && screenStream ? (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-900">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-contain"
              />

              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-md backdrop-blur-md border border-slate-200 z-10">
                <MonitorUp size={15} className="text-primary" />
                <span>You are presenting your screen</span>
              </div>

              {/* Remote participants thumbnail strip if any participants exist */}
              {remoteParticipants.length > 0 && (
                <div className="absolute top-4 right-4 flex max-w-[80%] gap-2 overflow-x-auto p-1.5 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-lg z-20">
                  {remoteParticipants.map((p) => (
                    <div
                      key={p.socketId}
                      className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white bg-slate-200 shadow-sm"
                    >
                      <RemoteVideoTile participant={p} />
                    </div>
                  ))}
                </div>
              )}

              {/* Local Stream PiP */}
              {localStream && (
                <div className="absolute bottom-5 right-5 overflow-hidden rounded-xl border-2 border-white bg-slate-200 shadow-xl z-20">
                  {cameraActive ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-32 w-44 object-cover -scale-x-100 sm:h-40 sm:w-56"
                    />
                  ) : (
                    <div className="flex h-32 w-44 items-center justify-center bg-slate-300 sm:h-40 sm:w-56">
                      <span className="text-sm font-semibold text-slate-700">
                        Camera Off
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm flex items-center gap-1.5">
                    <span>You</span>
                    {!micActive && <MicOff size={12} className="text-red-400" />}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Case 0: Waiting for others (0 remote participants) */}
              {remoteParticipants.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-xl font-semibold">?</span>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 text-base">
                      Waiting for another participant
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-sm">
                      Invite your friends to jump into this meeting or share the room link.
                    </p>
                  </div>

                  {/* Quick Action Buttons in Empty State */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <Button
                      onClick={() => setIsFriendsSheetOpen(true)}
                      className="gap-2 rounded-xl shadow-sm text-xs sm:text-sm font-medium px-4 cursor-pointer"
                    >
                      <UserPlus size={16} />
                      <span>Add Friends</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `${window.location.origin}/meeting/${roomId}`
                        );
                        toast.success("Meeting link copied to clipboard");
                      }}
                      className="gap-2 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium px-4 cursor-pointer"
                    >
                      <Copy size={15} />
                      <span>Copy Link</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Case 1: 1-on-1 meeting (exactly 1 remote participant) */}
              {remoteParticipants.length === 1 && (
                <div className="relative h-full w-full">
                  <video
                    ref={singleRemoteVideoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-5 left-5 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm z-10 flex items-center gap-1.5">
                    <span>
                      {remoteParticipants[0].user?.email || "Participant"}
                    </span>
                  </div>
                </div>
              )}

              {/* Local Stream Picture-in-Picture for 0 or 1 remote participant */}
              {remoteParticipants.length <= 1 && localStream && (
                <div className="absolute bottom-5 right-5 overflow-hidden rounded-xl border-2 border-white bg-slate-200 shadow-xl z-20">
                  {cameraActive ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-32 w-44 object-cover -scale-x-100 sm:h-40 sm:w-56"
                    />
                  ) : (
                    <div className="flex h-32 w-44 items-center justify-center bg-slate-300 sm:h-40 sm:w-56">
                      <span className="text-sm font-semibold text-slate-700">
                        Camera Off
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm flex items-center gap-1.5">
                    <span>You</span>
                    {!micActive && <MicOff size={12} className="text-red-400" />}
                  </div>
                </div>
              )}

              {/* Case 2: Multi-user meeting (2+ remote participants) */}
              {remoteParticipants.length >= 2 && (
                <>
                  {pinnedParticipant ? (
                    /* Pinned Focus View */
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                      <RemoteVideoTile
                        participant={pinnedParticipant}
                        onPin={() => setPinnedSocketId(null)}
                        isPinned={true}
                      />

                      {/* Top-Right Mini Stream Ribbon */}
                      <div className="absolute top-4 right-4 flex max-w-[85%] gap-2 overflow-x-auto p-1.5 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-lg z-20">
                        {/* Local participant thumbnail */}
                        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white bg-slate-200 shadow-sm">
                          {cameraActive && localStream ? (
                            <video
                              ref={localVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="h-full w-full object-cover -scale-x-100"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                              You
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                            You
                          </div>
                        </div>

                        {/* Other remote participants thumbnail */}
                        {otherParticipants.map((p) => (
                          <div
                            key={p.socketId}
                            onClick={() => setPinnedSocketId(p.socketId)}
                            className="relative h-20 w-32 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white bg-slate-200 shadow-sm transition hover:ring-2 hover:ring-primary"
                          >
                            <RemoteVideoTile
                              participant={p}
                              onPin={() => setPinnedSocketId(p.socketId)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Balanced Multi-User Grid View */
                    <div
                      className={`grid w-full h-full gap-3 p-3 pb-24 ${getGridCols(
                        remoteParticipants.length + 1
                      )}`}
                    >
                      {/* Local participant tile */}
                      <div className="relative flex h-full w-full min-h-[160px] sm:min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-slate-200 shadow-md">
                        {cameraActive && localStream ? (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover -scale-x-100"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
                              You
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm z-10 flex items-center gap-1.5">
                          <span>You</span>
                          {!micActive && (
                            <MicOff size={12} className="text-red-400" />
                          )}
                        </div>
                      </div>

                      {/* Remote participant tiles */}
                      {remoteParticipants.map((participant) => (
                        <div
                          key={participant.socketId}
                          className="min-h-[160px] sm:min-h-[220px]"
                        >
                          <RemoteVideoTile
                            participant={participant}
                            onPin={() => setPinnedSocketId(participant.socketId)}
                            isPinned={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Floating Controls Bar (centered at bottom) */}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-primary/20 bg-white/70 p-2 shadow-xl backdrop-blur-md sm:gap-3 sm:p-3 z-30">
            {/* Mic Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all cursor-pointer ${
                micActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
              onClick={toggleMic}
              title={micActive ? "Mute microphone" : "Unmute microphone"}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>

            {/* Camera Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all cursor-pointer ${
                cameraActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
              onClick={toggleCamera}
              title={cameraActive ? "Turn off camera" : "Turn on camera"}
            >
              {cameraActive ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>

            {/* Screen Share Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all cursor-pointer ${
                isScreenSharing
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
              onClick={toggleScreenShare}
              title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
            >
              <MonitorUp size={20} />
            </Button>

            {/* Add Friends Section Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all cursor-pointer ${
                isFriendsSheetOpen
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
              onClick={() => setIsFriendsSheetOpen((p) => !p)}
              title="Friends & Invites"
            >
              <UserPlus size={20} />
            </Button>

            <div className="mx-1 h-8 w-px bg-slate-200" />

            {/* End Meeting / Leave Action */}
            {isHost ? (
              <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 rounded-xl px-4 sm:px-6 gap-2 font-medium bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer">
                    <PhoneOff size={18} className="text-white shrink-0" />
                    <span className="text-white font-medium">End meeting</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>End meeting for everyone?</DialogTitle>
                    <DialogDescription>
                      You are the host of this meeting. Ending this meeting will disconnect all participants and mark the meeting as completed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEndDialogOpen(false)}
                      disabled={isEnding || isEndingMeeting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEndDialogOpen(false);
                        handleLeaveMeeting();
                      }}
                      disabled={isEnding || isEndingMeeting}
                    >
                      Leave only
                    </Button>
                    <Button
                      onClick={handleEndMeeting}
                      disabled={isEnding || isEndingMeeting}
                      className="bg-red-600 text-white hover:bg-red-700 font-medium"
                    >
                      {isEnding || isEndingMeeting ? "Ending meeting..." : "End meeting for all"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                className="h-12 rounded-xl px-4 sm:px-6 gap-2 font-medium bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                onClick={handleLeaveMeeting}
              >
                <LogOut size={18} className="text-white shrink-0" />
                <span className="text-white font-medium">Leave</span>
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Friends & Invites Sheet Drawer */}
      <MeetingFriendsSheet
        open={isFriendsSheetOpen}
        onOpenChange={setIsFriendsSheetOpen}
        roomId={roomId}
      />
    </section>
  );
}

export default MeetingRoom;