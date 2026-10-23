import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";

export interface RemoteParticipant {
    socketId: string;
    stream: MediaStream;
    user?: {
        id: string;
        email: string;
    };
}

interface userJoinedSocketType {
    socketId: string;
    user?: {
        id: string;
        email: string;
    };
}

interface webRTCOfferType {
    fromSocketId: string;
    user?: {
        id: string;
        email: string;
    };
    offer: RTCSessionDescriptionInit;
}

interface webRTCAnswerType {
    fromSocketId: string;
    user?: {
        id: string;
        email: string;
    };
    answer: RTCSessionDescriptionInit;
}

interface iceCandidateType {
    fromSocketId: string;
    candidate: RTCIceCandidateInit;
}

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelay',
            credential: 'openrelay',
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelay',
            credential: 'openrelay',
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelay',
            credential: 'openrelay',
        },
    ],
    iceCandidatePoolSize: 10,
};

export const useWebRTC = (
    roomId: string,
    isMicOn: boolean,
    isCameraOn: boolean,
    onMeetingEnded?: () => void
) => {
    const socketRef = useRef<Socket | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const remoteUsersRef = useRef<Map<string, { id: string; email: string }>>(new Map());
    const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    // Helper: Flush buffered candidates once remoteDescription is set for a specific peer
    const processPendingCandidates = async (peerSocketId: string, pc: RTCPeerConnection) => {
        const queue = pendingCandidatesRef.current.get(peerSocketId) || [];
        while (queue.length > 0) {
            const candidate = queue.shift();
            if (candidate && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('Error adding queued ICE candidate for peer', peerSocketId, e);
                }
            }
        }
    };

    // Helper: Create a peer connection for a specific remote socket
    const createPeerConnection = (targetSocketId: string, participantUser?: { id: string; email: string }) => {
        if (peersRef.current.has(targetSocketId)) {
            return peersRef.current.get(targetSocketId)!;
        }

        if (participantUser) {
            remoteUsersRef.current.set(targetSocketId, participantUser);
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peersRef.current.set(targetSocketId, pc);

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE Connection State [${targetSocketId}]:`, pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection State [${targetSocketId}]:`, pc.connectionState);
            if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                removePeer(targetSocketId);
            }
        };

        // Add local tracks (or screen track if sharing)
        const videoTrack = screenStreamRef.current
            ? screenStreamRef.current.getVideoTracks()[0]
            : localStreamRef.current?.getVideoTracks()[0];
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];

        if (videoTrack && localStreamRef.current) {
            pc.addTrack(videoTrack, localStreamRef.current);
        }
        if (audioTrack && localStreamRef.current) {
            pc.addTrack(audioTrack, localStreamRef.current);
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    roomId,
                    targetSocketId,
                    candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            const incomingStream =
                event.streams && event.streams[0]
                    ? event.streams[0]
                    : new MediaStream([event.track]);

            setRemoteParticipants((prev) => {
                const existingIndex = prev.findIndex((p) => p.socketId === targetSocketId);
                const userInfo = remoteUsersRef.current.get(targetSocketId);
                if (existingIndex !== -1) {
                    const existing = prev[existingIndex];
                    if (existing.stream && event.track) {
                        const hasTrack = existing.stream
                            .getTracks()
                            .some((t) => t.id === event.track.id);
                        if (!hasTrack) {
                            existing.stream.addTrack(event.track);
                        }
                    }
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...existing,
                        stream: existing.stream || incomingStream,
                        user: userInfo || existing.user,
                    };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        socketId: targetSocketId,
                        stream: incomingStream,
                        user: userInfo,
                    },
                ];
            });
        };

        return pc;
    };

    const removePeer = (socketId: string) => {
        const pc = peersRef.current.get(socketId);
        if (pc) {
            pc.close();
            peersRef.current.delete(socketId);
        }
        pendingCandidatesRef.current.delete(socketId);
        remoteUsersRef.current.delete(socketId);
        setRemoteParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    };

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
        });
        socketRef.current = socket;

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                stream.getVideoTracks().forEach((track) => (track.enabled = isCameraOn));
                stream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
                localStreamRef.current = stream;
                setLocalStream(stream);

                socket.emit('join-meeting', roomId);
            } catch (error) {
                console.error("Error accessing media devices", error);
                toast.error("Error accessing camera or microphone");
            }
        };

        initMedia();

        // 0. Existing room participants
        socket.on(
            'room-users',
            (data: {
                roomId: string;
                users?: { socketId: string; user?: { id: string; email: string } }[];
            }) => {
                if (data?.users) {
                    data.users.forEach((u) => {
                        if (u.user && u.socketId) {
                            remoteUsersRef.current.set(u.socketId, u.user);
                        }
                    });
                    setRemoteParticipants((prev) =>
                        prev.map((p) => {
                            const found = data.users?.find((u) => u.socketId === p.socketId);
                            return found?.user ? { ...p, user: found.user } : p;
                        })
                    );
                }
            }
        );

        // 1. When another participant joins the room, we create an offer to connect with them
        socket.on('user-joined', async (data: userJoinedSocketType) => {
            try {
                if (data.user) {
                    remoteUsersRef.current.set(data.socketId, data.user);
                    setRemoteParticipants((prev) =>
                        prev.map((p) =>
                            p.socketId === data.socketId ? { ...p, user: data.user } : p
                        )
                    );
                }
                const pc = createPeerConnection(data.socketId, data.user);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit('webrtc-offer', {
                    roomId,
                    targetSocketId: data.socketId,
                    offer,
                });
            } catch (err) {
                console.error('Error creating offer for newly joined user:', err);
            }
        });

        // 2. When receiving an offer from an existing participant, we answer it
        socket.on('webrtc-offer', async (offerData: webRTCOfferType) => {
            try {
                if (offerData.user) {
                    remoteUsersRef.current.set(offerData.fromSocketId, offerData.user);
                    setRemoteParticipants((prev) =>
                        prev.map((p) =>
                            p.socketId === offerData.fromSocketId ? { ...p, user: offerData.user } : p
                        )
                    );
                }
                const pc = createPeerConnection(offerData.fromSocketId, offerData.user);
                await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
                await processPendingCandidates(offerData.fromSocketId, pc);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('webrtc-answer', {
                    roomId,
                    targetSocketId: offerData.fromSocketId,
                    answer,
                });
            } catch (err) {
                console.error('Error handling webrtc-offer:', err);
            }
        });

        // 3. When receiving an answer to an offer we initiated
        socket.on('webrtc-answer', async (answerData: webRTCAnswerType) => {
            try {
                const pc = peersRef.current.get(answerData.fromSocketId);
                if (pc) {
                    if (answerData.user) {
                        remoteUsersRef.current.set(answerData.fromSocketId, answerData.user);
                        setRemoteParticipants((prev) =>
                            prev.map((p) =>
                                p.socketId === answerData.fromSocketId
                                    ? { ...p, user: answerData.user }
                                    : p
                            )
                        );
                    }
                    await pc.setRemoteDescription(new RTCSessionDescription(answerData.answer));
                    await processPendingCandidates(answerData.fromSocketId, pc);
                }
            } catch (err) {
                console.error('Error handling webrtc-answer:', err);
            }
        });

        // 4. When receiving ICE candidate
        socket.on('ice-candidate', async (iceData: iceCandidateType) => {
            if (!iceData.candidate) return;
            const pc = peersRef.current.get(iceData.fromSocketId);
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(iceData.candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate', err);
                }
            } else {
                const queue = pendingCandidatesRef.current.get(iceData.fromSocketId) || [];
                queue.push(iceData.candidate);
                pendingCandidatesRef.current.set(iceData.fromSocketId, queue);
            }
        });

        // 5. When participant leaves
        socket.on('user-left', (data: { socketId: string; userId?: string }) => {
            removePeer(data.socketId);
        });

        // 6. When host ends the meeting
        socket.on('meeting-ended', () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            toast.error('The meeting has been ended by the host');
            onMeetingEnded?.();
        });

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            peersRef.current.forEach((pc) => pc.close());
            peersRef.current.clear();
            pendingCandidatesRef.current.clear();
            remoteUsersRef.current.clear();
            socket.disconnect();
        };
    }, [roomId]);

    // Screen sharing support
    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            const screenTrack = screenStream.getVideoTracks()[0];

            screenStreamRef.current = screenStream;
            setScreenStream(screenStream);
            setIsScreenSharing(true);

            // Replace video track in all active peer connections
            peersRef.current.forEach((pc) => {
                const senders = pc.getSenders();
                const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(screenTrack);
                }
            });

            screenTrack.onended = () => {
                stopScreenShare();
            };
            return true;
        } catch (err) {
            console.error('Error starting screen share', err);
            return false;
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }
        setScreenStream(null);
        setIsScreenSharing(false);

        // Revert back to camera track
        if (localStreamRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];
            if (cameraTrack) {
                peersRef.current.forEach((pc) => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(cameraTrack);
                    }
                });
            }
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            stopScreenShare();
        } else {
            await startScreenShare();
        }
    };

    const leaveMeeting = () => {
        if (socketRef.current && roomId) {
            socketRef.current.emit('leave-meeting', { roomId });
        }
    };

    const endMeeting = () => {
        if (socketRef.current && roomId) {
            socketRef.current.emit('end-meeting', { roomId });
        }
    };

    return {
        localStream,
        screenStream,
        remoteParticipants,
        remoteStream: remoteParticipants[0]?.stream || null, // fallback for 1-1 backwards compatibility
        isScreenSharing,
        toggleScreenShare,
        leaveMeeting,
        endMeeting,
    };
};
