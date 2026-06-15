import { useRef } from "react";

export let peerConnection;
export let localStream;
export let remoteStream;
export let localStreamRef = { current: null }
export let remoteStreamRef = { current: null };
