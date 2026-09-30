import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = (roomId: string) => {
    const socketRef = useRef<Socket | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);

    useEffect(() => {
        //initializing socket
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true
        })
        //initializing peer connection
        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS)


        //Initializer function to provide local media and add track 
        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(
                    {
                        video: true,
                        audio: true
                    }
                )
                setLocalStream(stream)

                stream.getTracks().forEach((track) => {
                    if (peerConnectionRef.current) {
                        peerConnectionRef.current.addTrack(track, stream)
                    }
                })

                socketRef.current?.emit('join-meeting', roomId)
            } catch (error) {
                toast.error("Error accessing media devices")
            }
        }
        initMedia()

        //Handling network paths (ice candidates ) and receiving of remote video , via network address
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate && remoteSocketId) {
                socketRef.current?.emit('ice-candidate', {
                    roomId,
                    targetSocketId: remoteSocketId,
                    candidate: event.candidate
                })
            }
        }

        //after webRTC receive other persons video it saves in state
        peerConnectionRef.current.ontrack = (event) => {
            setRemoteStream(event.streams[0])
        }
    })



}