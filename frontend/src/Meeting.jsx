import React, { useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { connectionsContext } from "./contexts/ConnectionsContext";
import { socketContext } from "./SocketContext";
import {
    Mic,
    Phone,
    Users,
    Video,
} from "lucide-react";

const Meeting = () => {
    const { id } = useParams();
    const { participants, setParticipants, connections, setConnections } =
        useContext(connectionsContext);
    const socket = useContext(socketContext);

    const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    let localStream;
    const localStreamRef = useRef(null);
    const connectionsRef = useRef(null);

    // Store connections in the ref for getting the updated value in the answer listener and ice candidate listener.
    useEffect(() => {
        connectionsRef.current = connections;
    }, [connections]);

    useEffect(() => {
        async function establishConnection() {
            // Get Streams
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            if (localStreamRef.current) {
                localStreamRef.current.srcObject = localStream;
            }
        }

        // Check which participant has no connection as peer with me and create connection for them
        async function createConnections() {
            await establishConnection();
            for (let p of participants) {
                if (!connectionsRef.current.has(p)) {
                    let peerConnection = new RTCPeerConnection(configuration);

                    peerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit("ice-candidate", {
                                roomId: p,
                                candidate: event.candidate,
                            });
                        }
                    };

                    // Add local stream tracks
                    if (localStream) {
                        localStream.getTracks().forEach((track) => {
                            peerConnection.addTrack(track, localStream);
                        });
                    }

                    // Handle remote stream
                    let remoteStream = new MediaStream();

                    // add tracks of remote stream
                    peerConnection.ontrack = (event) => {
                        remoteStream.addTrack(event.track);
                    };

                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);

                    // Send offer to everyone else in the room
                    socket.emit("join_room_offer", {
                        roomId: p,
                        offer,
                    });

                    // Create connection mapping for each peers connection with.
                    setConnections((prev) => {
                        const next = new Map(prev);
                        next.set(p, { peerConnection, remoteStream });
                        return next;
                    });
                }
            }
        }
        createConnections();

        async function handleOffer({ offer, sender }) {
            // create the connection for that new participant as peer
            let peerConnection = new RTCPeerConnection(configuration);

            // Add local stream tracks
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            // Handle remote stream
            let remoteStream = new MediaStream();

            // add tracks of remote stream
            peerConnection.ontrack = (event) => {
                remoteStream.addTrack(event.track);
            };

            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer),
            );

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", {
                        roomId: sender,
                        candidate: event.candidate,
                    });
                }
            };

            // Send offer to everyone else in the room
            socket.emit("join_room_answer", {
                roomId: sender,
                answer,
            });

            // Store that participants who send offer.
            setParticipants((prev) => [...prev, sender]);
            // make connnection with that participants
            setConnections((prev) => {
                const next = new Map(prev);
                next.set(sender, { peerConnection, remoteStream });
                return next;
            });
        }

        async function handleAnswer({ answer, sender }) {
            const connection = connectionsRef.current.get(sender);
            const peerConnection = connection?.peerConnection;

            if (!peerConnection) return;

            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer),
            );
        }

        async function handleIceCandidate({ sender, candidate }) {
            if (candidate) {
                const connection = connectionsRef.current.get(sender);
                const peerConnection = connection?.peerConnection;

                if (peerConnection) {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(candidate),
                    );
                }
            }
        }

        socket.on("join_room_offer", handleOffer);
        socket.on("join_room_answer", handleAnswer);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("join_room_offer");
            socket.off("join_room_answer");
            socket.off("ice-candidate");
        };
    }, []);

    return (
        <div className='min-h-screen flex flex-col bg-[#0a0a0a]'>
            <div className='flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a]'>
                <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 bg-white rounded-md flex items-center justify-center text-black'>
                        <Video className='w-4 h-4 text-black' />
                    </div>
                    <span className='text-xs text-[#555] bg-[#111] border border-[#1e1e1e] rounded-md px-2.5 py-1 cursor-pointer hover:border-[#333]'>
                        {id}
                    </span>
                </div>
                <div className='w-7 h-7 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-xs text-[#666] font-medium'>
                    NY
                </div>
            </div>
            <div
                className='flex-1 grid gap-2.5 p-4'
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    alignContent: "start",
                }}
            >
                <div
                    className='relative bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden'
                    style={{ aspectRatio: "16/9" }}
                >
                    <video
                        ref={localStreamRef}
                        autoPlay
                        muted
                        playsInline
                        className='w-full h-full object-cover'
                    />
                    <span className='absolute bottom-2.5 left-3 text-xs text-[#888] bg-black/60 px-2 py-0.5 rounded'>
                        You
                    </span>
                </div>
                {[...connections.entries()].map(([p, { remoteStream }]) => (
                    <div
                        key={p}
                        className='relative bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden'
                        style={{ aspectRatio: "16/9" }}
                    >
                        <video
                            ref={(el) => {
                                if (el) el.srcObject = remoteStream;
                            }}
                            autoPlay
                            playsInline
                            className='w-full h-full object-cover'
                        />
                        <span className='absolute bottom-2.5 left-3 text-xs text-[#888] bg-black/60 px-2 py-0.5 rounded'>
                            peerId: {p}
                        </span>
                    </div>
                ))}
            </div>
            <div className='flex items-center justify-between px-5 py-4 border-t border-[#1a1a1a]'>
                <div className='flex gap-2 text-[#656565] '>
                    <Users /> {participants.length + 1} Participants
                </div>
                <div className='flex items-center justify-center gap-2.5'>
                    <button className='w-11 h-11 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center hover:bg-[#222]'>
                        <Mic className='w-5 h-5 text-white' />
                    </button>
                    <button className='w-11 h-11 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center hover:bg-[#222]'>
                        <Video className='w-5 h-5 text-white' />
                    </button>
                    <button className='w-11 h-11 rounded-full bg-red-700 border border-red-700 flex items-center justify-center hover:bg-red-600'>
                        <Phone className='w-5 h-5 text-white rotate-135' />
                    </button>
                </div>
                <div></div>
            </div>
        </div>
    );
};

export default Meeting;
