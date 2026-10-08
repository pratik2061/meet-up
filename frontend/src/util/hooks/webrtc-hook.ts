import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";

interface userJoinedSocketType {
    socketId: string,
    user: {
        id: string,
        email: string
    }
}

interface webRTCOfferType {
    fromSocketId: string,
    offer: RTCSessionDescriptionInit
}

interface webRTCAnswerType {
    fromSocketId: string,
    answer: RTCSessionDescriptionInit
}

interface iceCandidateType {
    roomId: string,
    targetSocketId: string,
    candidate: RTCIceCandidateInit
}

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = (roomId: string, isMicOn: boolean, isCameraOn: boolean) => {
    const socketRef = useRef<Socket | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

    const localStreamRef = useRef<MediaStream | null>(null);

    const remoteSocketIdRef = useRef<string | null>(null);

    useEffect(() => {
        //initializing socket
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true
        })
        // initializing peer connection
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
                stream.getVideoTracks().forEach(track => track.enabled = isCameraOn);
                stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
                localStreamRef.current = stream;

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
            if (event.candidate && remoteSocketIdRef.current) {
                socketRef.current?.emit('ice-candidate', {
                    roomId,
                    targetSocketId: remoteSocketIdRef.current,
                    candidate: event.candidate
                })
            }
        }

        //after webRTC receive other persons video it saves in state
        peerConnectionRef.current.ontrack = (event) => {
            setRemoteStream(event.streams[0])
        }

        //After this now we will handel client offers and answer, when user joins ,in the room

        //this function is called when room is empty , and the person joining is the first person to join., so that person creates an offer
        socketRef.current.on('user-joined', async (
            data: userJoinedSocketType) => {
            remoteSocketIdRef.current = data.socketId

            const offer = await peerConnectionRef.current?.createOffer();
            await peerConnectionRef.current?.setLocalDescription(offer)

            //this socket emit function send offer to newly joined user through our backend
            socketRef.current?.emit('webrtc-offer', {
                roomId,
                targetSocketId: data.socketId,
                offer
            })
        })

        //after first person creates an offer , the other persons to join will receives that offer and creates an answer regarding it offer

        socketRef.current.on('webrtc-offer', async (
            offerData: webRTCOfferType
        ) => {
            remoteSocketIdRef.current = offerData.fromSocketId
            //we need to set the other persons offer as our remote descriptions

            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offerData.offer))

            //lets create our answer on received offers
            const answer = await peerConnectionRef.current?.createAnswer()

            //set out answer as local description
            await peerConnectionRef.current?.setLocalDescription(answer)

            //now send answer to the all 
            socketRef.current?.emit('webrtc-answer', {
                roomId,
                targetSocketId: offerData.fromSocketId,
                answer
            })
        })

        //after receiving offer , now we send offer back to them to connect us and they will reply back with an answer.

        socketRef.current.on('webrtc-answer', async (
            answerData: webRTCAnswerType) => {
            // they save our response as Remote description
            await peerConnectionRef.current?.setRemoteDescription(
                new RTCSessionDescription(answerData.answer)
            )

        })

        //At last the client sends us a network path (ICE candidate)

        socketRef.current.on('ice-candidate', async (
            iceCandidateData: iceCandidateType) => {
            try {
                await peerConnectionRef.current?.addIceCandidate(
                    new RTCIceCandidate(iceCandidateData.candidate)
                )
            } catch (error) {
                toast.error('Error adding received ice candidate')
            }
        })

        //handling user left condition 

        socketRef.current.on('user-left', () => {
            setRemoteStream(null)
            remoteSocketIdRef.current = null
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close()
                peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS)
            }

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => {
                    peerConnectionRef.current?.addTrack(track, localStreamRef.current!)
                })
            }
            peerConnectionRef.current!.onicecandidate = (event) => {
                if (event.candidate && remoteSocketIdRef.current) {
                    socketRef.current?.emit('ice-candidate', {
                        roomId,
                        targetSocketId: remoteSocketIdRef.current,
                        candidate: event.candidate
                    })
                }
            }
            peerConnectionRef.current!.ontrack = (event) => {
                setRemoteStream(event.streams[0])
            }
        })
        //cleanup function to handle socket close , when leave meeting is triggerd

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            socketRef.current?.disconnect()
            peerConnectionRef.current?.close()
        }
    }, [roomId])

    return {
        localStream,
        remoteStream
    }
}