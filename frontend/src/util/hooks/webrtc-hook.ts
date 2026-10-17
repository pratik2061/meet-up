import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";

interface userJoinedSocketType {
    socketId: string;
    user: {
        id: string;
        email: string;
    };
}

interface webRTCOfferType {
    fromSocketId: string;
    offer: RTCSessionDescriptionInit;
}

interface webRTCAnswerType {
    fromSocketId: string;
    answer: RTCSessionDescriptionInit;
}

interface iceCandidateType {
    roomId: string;
    targetSocketId: string;
    candidate: RTCIceCandidateInit;
}

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Free OpenRelay TURN servers for NAT traversal
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
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteSocketIdRef = useRef<string | null>(null);

    // Queue to hold candidates that arrive before setRemoteDescription completes
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true
        });

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Helpful debug logs to see ICE connection status in console
        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'failed') {
                console.error('ICE Connection failed: Check TURN server configuration');
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('Connection State:', pc.connectionState);
        };

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                stream.getVideoTracks().forEach(track => track.enabled = isCameraOn);
                stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
                localStreamRef.current = stream;
                setLocalStream(stream);

                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream);
                });

                socketRef.current?.emit('join-meeting', roomId);
            } catch (error) {
                toast.error("Error accessing media devices");
            }
        };
        initMedia();

        pc.onicecandidate = (event) => {
            if (event.candidate && remoteSocketIdRef.current) {
                socketRef.current?.emit('ice-candidate', {
                    roomId,
                    targetSocketId: remoteSocketIdRef.current,
                    candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        // Helper function to flush buffered candidates once remoteDescription is set
        const processPendingCandidates = async () => {
            while (pendingCandidatesRef.current.length > 0) {
                const candidate = pendingCandidatesRef.current.shift();
                if (candidate && pc.remoteDescription) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error('Error adding queued ICE candidate', e);
                    }
                }
            }
        };

        socketRef.current.on('user-joined', async (data: userJoinedSocketType) => {
            remoteSocketIdRef.current = data.socketId;

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socketRef.current?.emit('webrtc-offer', {
                roomId,
                targetSocketId: data.socketId,
                offer
            });
        });

        socketRef.current.on('webrtc-offer', async (offerData: webRTCOfferType) => {
            remoteSocketIdRef.current = offerData.fromSocketId;

            await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
            await processPendingCandidates();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketRef.current?.emit('webrtc-answer', {
                roomId,
                targetSocketId: offerData.fromSocketId,
                answer
            });
        });

        socketRef.current.on('webrtc-answer', async (answerData: webRTCAnswerType) => {
            await pc.setRemoteDescription(new RTCSessionDescription(answerData.answer));
            await processPendingCandidates();
        });

        socketRef.current.on('ice-candidate', async (iceCandidateData: iceCandidateType) => {
            if (!iceCandidateData.candidate) return;

            // If remoteDescription is already set, add immediately. Otherwise, queue it!
            if (pc.remoteDescription && pc.remoteDescription.type) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(iceCandidateData.candidate));
                } catch (error) {
                    console.error('Error adding received ice candidate', error);
                }
            } else {
                pendingCandidatesRef.current.push(iceCandidateData.candidate);
            }
        });

        socketRef.current.on('user-left', () => {
            setRemoteStream(null);
            remoteSocketIdRef.current = null;
            pendingCandidatesRef.current = [];
        });

        socketRef.current.on('meeting-ended', () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            toast.error('The meeting has been ended by the host');
            onMeetingEnded?.();
        });

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            socketRef.current?.disconnect();
            pc.close();
        };
    }, [roomId]);

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
        remoteStream,
        leaveMeeting,
        endMeeting
    };
};
