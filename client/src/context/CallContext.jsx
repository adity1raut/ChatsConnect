import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const CallContext = createContext(null);

const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function CallProvider({ children }) {
  const { user } = useAuth();
  const {
    socket,
    initiateCall,
    acceptCall,
    rejectCall,
    hangUp,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
  } = useSocket();

  // incomingCall: info about a call ringing in
  const [incomingCall, setIncomingCall] = useState(null);
  // activeCall: info about the ongoing call
  const [activeCall, setActiveCall] = useState(null);
  // Whether the call is connecting (WebRTC negotiating) or established
  const [isConnecting, setIsConnecting] = useState(false);
  // Mute / camera state
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pcRef = useRef(null); // RTCPeerConnection
  const pendingCandidatesRef = useRef([]); // ICE candidates buffered before remote description is set

  // ── Cleanup helper ────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    // Stop local tracks
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    pendingCandidatesRef.current = [];
    setActiveCall(null);
    setIncomingCall(null);
    setIsConnecting(false);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  // ── Create RTCPeerConnection ──────────────────────────────────────
  const createPC = useCallback(
    (peerId) => {
      const pc = new RTCPeerConnection(STUN_SERVERS);

      // When we get ICE candidates, relay them via signaling server
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) sendIceCandidate(peerId, candidate);
      };

      // When remote tracks arrive, store stream
      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        setIsConnecting(false);
        // Trigger re-render so VideoCallModal picks up new stream
        setActiveCall((prev) => (prev ? { ...prev, _ts: Date.now() } : prev));
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          cleanup();
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [sendIceCandidate, cleanup],
  );

  // ── Get local media stream ────────────────────────────────────────
  const getLocalStream = useCallback(async (isAudio = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isAudio,
        audio: true,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("getUserMedia error:", err);
      throw err;
    }
  }, []);

  // ── Caller: start a call ──────────────────────────────────────────
  const startCall = useCallback(
    async (chat, isAudio = false) => {
      if (!user || activeCall || incomingCall) return;

      try {
        const stream = await getLocalStream(isAudio);

        setIsConnecting(true);
        setActiveCall({
          peerId: chat.id,
          peerName: chat.name,
          peerAvatar: chat.avatar,
          isAudio,
          isCaller: true,
        });

        // Signal the callee
        initiateCall(
          chat.id,
          user.name,
          user.avatar,
          isAudio ? "audio" : "video",
        );

        // Create PC and add tracks (offer will be sent after callAccepted)
        const pc = createPC(chat.id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      } catch {
        cleanup();
      }
    },
    [
      user,
      activeCall,
      incomingCall,
      getLocalStream,
      initiateCall,
      createPC,
      cleanup,
    ],
  );

  // ── Callee: accept incoming call ──────────────────────────────────
  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const { callerId, callerName, callerAvatar, callType } = incomingCall;
    const isAudio = callType === "audio";

    try {
      const stream = await getLocalStream(isAudio);

      setIsConnecting(true);
      setActiveCall({
        peerId: callerId,
        peerName: callerName,
        peerAvatar: callerAvatar,
        isAudio,
        isCaller: false,
      });
      setIncomingCall(null);

      // Signal acceptance — caller will now send an offer
      acceptCall(callerId);

      // Create PC and add local tracks
      const pc = createPC(callerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch {
      cleanup();
    }
  }, [incomingCall, getLocalStream, acceptCall, createPC, cleanup]);

  // ── Callee: reject incoming call ──────────────────────────────────
  const handleRejectCall = useCallback(() => {
    if (!incomingCall) return;
    rejectCall(incomingCall.callerId);
    setIncomingCall(null);
  }, [incomingCall, rejectCall]);

  // ── Either side: end active call ──────────────────────────────────
  const handleEndCall = useCallback(() => {
    if (activeCall) hangUp(activeCall.peerId);
    cleanup();
  }, [activeCall, hangUp, cleanup]);

  // ── Toggle mic ────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  // ── Toggle camera ─────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff((prev) => !prev);
  }, []);

  // ── Socket event listeners ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Incoming ring
    const onIncomingCall = (data) => {
      if (!activeCall) setIncomingCall(data);
    };

    // Our call was accepted — now send the WebRTC offer
    const onCallAccepted = async ({ calleeId }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendOffer(calleeId, offer);
      } catch (err) {
        console.error("createOffer error:", err);
      }
    };

    // Our call was rejected
    const onCallRejected = () => {
      cleanup();
    };

    // Other side hung up
    const onCallEnded = () => {
      cleanup();
    };

    // Received WebRTC offer (callee side)
    const onWebrtcOffer = async ({ fromUserId, offer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Flush any buffered candidates
        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendAnswer(fromUserId, answer);
      } catch (err) {
        console.error("setRemoteDescription (offer) error:", err);
      }
    };

    // Received WebRTC answer (caller side)
    const onWebrtcAnswer = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        // Flush buffered candidates
        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("setRemoteDescription (answer) error:", err);
      }
    };

    // Received ICE candidate
    const onIceCandidate = async ({ candidate }) => {
      const pc = pcRef.current;
      if (!pc || !candidate) return;
      if (pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("addIceCandidate error:", err);
        }
      } else {
        // Buffer until remote description is ready
        pendingCandidatesRef.current.push(candidate);
      }
    };

    socket.on("incomingCall", onIncomingCall);
    socket.on("callAccepted", onCallAccepted);
    socket.on("callRejected", onCallRejected);
    socket.on("callEnded", onCallEnded);
    socket.on("webrtcOffer", onWebrtcOffer);
    socket.on("webrtcAnswer", onWebrtcAnswer);
    socket.on("iceCandidate", onIceCandidate);

    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("callAccepted", onCallAccepted);
      socket.off("callRejected", onCallRejected);
      socket.off("callEnded", onCallEnded);
      socket.off("webrtcOffer", onWebrtcOffer);
      socket.off("webrtcAnswer", onWebrtcAnswer);
      socket.off("iceCandidate", onIceCandidate);
    };
  }, [socket, activeCall, cleanup, sendOffer, sendAnswer]);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        activeCall,
        isConnecting,
        isMuted,
        isCameraOff,
        localStreamRef,
        remoteStreamRef,
        startCall,
        acceptCall: handleAcceptCall,
        rejectCall: handleRejectCall,
        endCall: handleEndCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}
