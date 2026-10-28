import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  VideoPresets,
  Track,
  createLocalTracks,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant as LKRemoteParticipant,
  LocalTrack,
} from "livekit-client";
import { io, type Socket } from "socket.io-client";
import { axiosInstance } from "@/util/api/axiosInstance";
import toast from "react-hot-toast";

export interface RemoteParticipant {
  socketId: string;
  stream: MediaStream;
  user?: {
    id: string;
    email: string;
  };
}

export const useLiveKit = (
  roomId: string,
  isMicOn: boolean,
  isCameraOn: boolean,
  onMeetingEnded?: () => void
) => {
  const socketRef = useRef<Socket | null>(null);
  const roomRef = useRef<Room | null>(null);
  const localTracksRef = useRef<LocalTrack[]>([]);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Helper to reconstruct remote participants state
  const syncRemoteParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const list: RemoteParticipant[] = [];
    room.remoteParticipants.forEach((p: LKRemoteParticipant) => {
      let stream = remoteStreamsRef.current.get(p.identity);
      if (!stream) {
        stream = new MediaStream();
        remoteStreamsRef.current.set(p.identity, stream);
      }

      // Try parsing metadata if present
      let userObj: { id: string; email: string } = {
        id: p.identity,
        email: p.name || p.identity,
      };
      if (p.metadata) {
        try {
          const parsed = JSON.parse(p.metadata);
          if (parsed?.id && parsed?.email) {
            userObj = { id: parsed.id, email: parsed.email };
          }
        } catch {
          // fallback to name/identity
        }
      }

      list.push({
        socketId: p.identity,
        stream,
        user: userObj,
      });
    });

    setRemoteParticipants(list);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    let isSubscribed = true;

    // 1. Maintain Socket.io connection for app events (invites, end-meeting broadcast)
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit("join-meeting", roomId);

    socket.on("meeting-ended", () => {
      toast.error("The meeting has been ended by the host");
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      onMeetingEnded?.();
    });

    // 2. Initialize LiveKit SFU Room
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
    });
    roomRef.current = room;

    const initLiveKit = async () => {
      try {
        // Fetch room join token from backend
        const response = await axiosInstance.get(`/livekit/${roomId}/token`);
        const { token, url } = response.data;

        if (!isSubscribed) return;

        // Connect to LiveKit SFU server
        const sfuUrl = url || import.meta.env.VITE_LIVEKIT_URL || "ws://127.0.0.1:7880";
        await room.connect(sfuUrl, token);

        if (!isSubscribed) return;

        // Create local camera and audio tracks
        const tracks = await createLocalTracks({
          audio: true,
          video: {
            resolution: VideoPresets.h720.resolution,
          },
        });

        if (!isSubscribed) {
          tracks.forEach((t) => t.stop());
          return;
        }

        localTracksRef.current = tracks;

        // Apply initial mic / camera mute states
        tracks.forEach((track) => {
          if (track.kind === Track.Kind.Audio) {
            track.mediaStreamTrack.enabled = isMicOn;
          }
          if (track.kind === Track.Kind.Video) {
            track.mediaStreamTrack.enabled = isCameraOn;
          }
        });

        // Publish to LiveKit SFU with simulcast
        for (const track of tracks) {
          await room.localParticipant.publishTrack(track, {
            simulcast: track.kind === Track.Kind.Video,
          });
        }

        // Build local MediaStream for tile preview
        const ms = new MediaStream(tracks.map((t) => t.mediaStreamTrack));
        setLocalStream(ms);

        // Handle remote track subscriptions
        room.on(
          RoomEvent.TrackSubscribed,
          (track: RemoteTrack, _pub: RemoteTrackPublication, participant: LKRemoteParticipant) => {
            let pStream = remoteStreamsRef.current.get(participant.identity);
            if (!pStream) {
              pStream = new MediaStream();
              remoteStreamsRef.current.set(participant.identity, pStream);
            }

            // Avoid duplicate tracks
            if (!pStream.getTracks().some((t) => t.id === track.mediaStreamTrack.id)) {
              pStream.addTrack(track.mediaStreamTrack);
            }

            // Dedicated audio player element for audio tracks to guarantee playback
            if (track.kind === Track.Kind.Audio) {
              const audioElement = track.attach();
              remoteAudioElementsRef.current.set(`${participant.identity}-audio`, audioElement);
            }

            syncRemoteParticipants();
          }
        );

        room.on(
          RoomEvent.TrackUnsubscribed,
          (track: RemoteTrack, _pub: RemoteTrackPublication, participant: LKRemoteParticipant) => {
            const pStream = remoteStreamsRef.current.get(participant.identity);
            if (pStream) {
              const existingTrack = pStream
                .getTracks()
                .find((t) => t.id === track.mediaStreamTrack.id);
              if (existingTrack) {
                pStream.removeTrack(existingTrack);
              }
            }

            if (track.kind === Track.Kind.Audio) {
              track.detach();
              const existingAudio = remoteAudioElementsRef.current.get(
                `${participant.identity}-audio`
              );
              if (existingAudio) {
                existingAudio.remove();
                remoteAudioElementsRef.current.delete(`${participant.identity}-audio`);
              }
            }

            syncRemoteParticipants();
          }
        );

        room.on(RoomEvent.ParticipantConnected, () => {
          syncRemoteParticipants();
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant: LKRemoteParticipant) => {
          remoteStreamsRef.current.delete(participant.identity);
          const existingAudio = remoteAudioElementsRef.current.get(
            `${participant.identity}-audio`
          );
          if (existingAudio) {
            existingAudio.remove();
            remoteAudioElementsRef.current.delete(`${participant.identity}-audio`);
          }
          syncRemoteParticipants();
        });

        room.on(RoomEvent.Disconnected, () => {
          onMeetingEnded?.();
        });

        syncRemoteParticipants();
      } catch (error: any) {
        console.error("Error connecting to LiveKit SFU:", error);
        toast.error("Failed to connect to SFU media server");
      }
    };

    initLiveKit();

    return () => {
      isSubscribed = false;

      // Stop and clean local tracks
      localTracksRef.current.forEach((track) => {
        track.stop();
      });
      localTracksRef.current = [];

      // Clean remote audio elements
      remoteAudioElementsRef.current.forEach((el) => el.remove());
      remoteAudioElementsRef.current.clear();
      remoteStreamsRef.current.clear();

      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, syncRemoteParticipants]);

  // Sync mic state if changed from outside
  useEffect(() => {
    const audioTrack = localTracksRef.current.find((t) => t.kind === Track.Kind.Audio);
    if (audioTrack) {
      audioTrack.mediaStreamTrack.enabled = isMicOn;
    }
  }, [isMicOn]);

  // Sync camera state if changed from outside
  useEffect(() => {
    const videoTrack = localTracksRef.current.find((t) => t.kind === Track.Kind.Video);
    if (videoTrack) {
      videoTrack.mediaStreamTrack.enabled = isCameraOn;
    }
  }, [isCameraOn]);

  // Screen sharing support via LiveKit
  const startScreenShare = async () => {
    const room = roomRef.current;
    if (!room) return false;

    try {
      const publication = await room.localParticipant.setScreenShareEnabled(true, {
        audio: false,
      });

      if (publication?.track) {
        const sStream = new MediaStream([publication.track.mediaStreamTrack]);
        setScreenStream(sStream);
        setIsScreenSharing(true);

        publication.track.mediaStreamTrack.onended = () => {
          stopScreenShare();
        };
      }
      return true;
    } catch (err) {
      console.error("Error starting screen share:", err);
      toast.error("Could not start screen sharing");
      return false;
    }
  };

  const stopScreenShare = async () => {
    const room = roomRef.current;
    if (room) {
      try {
        await room.localParticipant.setScreenShareEnabled(false);
      } catch (err) {
        console.error("Error stopping screen share:", err);
      }
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const leaveMeeting = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("leave-meeting", { roomId });
    }
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    onMeetingEnded?.();
  };

  const endMeeting = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("end-meeting", { roomId });
    }
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    onMeetingEnded?.();
  };

  return {
    localStream,
    screenStream,
    remoteParticipants,
    remoteStream: remoteParticipants[0]?.stream || null,
    isScreenSharing,
    toggleScreenShare,
    leaveMeeting,
    endMeeting,
  };
};
