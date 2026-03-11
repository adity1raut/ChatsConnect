import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const GroupCallContext = createContext(null);

const STUN = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] };

export function GroupCallProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Active group call info
  const [activeGroupCall, setActiveGroupCall] = useState(null); // { groupId, groupName, callType }
  // Incoming notification (someone started a group call)
  const [incomingGroupCall, setIncomingGroupCall] = useState(null); // { groupId, groupName, callType, callerId, callerName }
  // participants: Map<userId, { name, avatar, stream }>
  const [participants, setParticipants] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localStreamRef = useRef(null);
  // pcs: Map<userId, RTCPeerConnection>
  const pcsRef = useRef(new Map());
  const pendingCandidatesRef = useRef(new Map()); // userId -> []

  // ── Helpers ─────────────────────────────────────────────────────
  const getLocalStream = useCallback(async (isAudio = false) => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: !isAudio, audio: true });
    localStreamRef.current = stream;
    return stream;
  }, []);

  const addParticipant = useCallback((userId, info) => {
    setParticipants((prev) => new Map(prev).set(userId, { name: info.name, avatar: info.avatar, stream: info.stream || null }));
  }, []);

  const updateParticipantStream = useCallback((userId, stream) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      const existing = next.get(userId) || {};
      next.set(userId, { ...existing, stream });
      return next;
    });
  }, []);

  const removeParticipant = useCallback((userId) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
    // Close PC for this user
    const pc = pcsRef.current.get(userId);
    if (pc) { pc.close(); pcsRef.current.delete(userId); }
    pendingCandidatesRef.current.delete(userId);
  }, []);

  // ── Create a PeerConnection to a specific participant ────────────
  const createPC = useCallback((peerId) => {
    const pc = new RTCPeerConnection(STUN);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket) {
        socket.emit("iceCandidate", { toUserId: peerId, candidate });
      }
    };

    pc.ontrack = (event) => {
      updateParticipantStream(peerId, event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        removeParticipant(peerId);
      }
    };

    // Buffer candidates until remote description is set
    if (!pendingCandidatesRef.current.has(peerId)) {
      pendingCandidatesRef.current.set(peerId, []);
    }

    pcsRef.current.set(peerId, pc);
    return pc;
  }, [socket, updateParticipantStream, removeParticipant]);

  // ── Add local tracks to a PC ─────────────────────────────────────
  const addLocalTracks = useCallback((pc, stream) => {
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
  }, []);

  // ── Joiner: initiate WebRTC with an existing participant ──────────
  const connectToPeer = useCallback(async (peerId, peerInfo) => {
    addParticipant(peerId, peerInfo);
    const stream = localStreamRef.current;
    if (!stream || !socket) return;

    const pc = createPC(peerId);
    addLocalTracks(pc, stream);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtcOffer", { toUserId: peerId, offer });
    } catch (err) {
      console.error("connectToPeer offer error:", err);
    }
  }, [addParticipant, createPC, addLocalTracks, socket]);

  // ── Flush pending ICE candidates ─────────────────────────────────
  const flushCandidates = useCallback(async (peerId) => {
    const pc = pcsRef.current.get(peerId);
    const candidates = pendingCandidatesRef.current.get(peerId) || [];
    for (const c of candidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    pendingCandidatesRef.current.set(peerId, []);
  }, []);

  // ── Cleanup entire call ──────────────────────────────────────────
  const cleanupCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current = new Map();
    pendingCandidatesRef.current = new Map();
    setParticipants(new Map());
    setActiveGroupCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  // ── Start a group call (initiator) ───────────────────────────────
  const startGroupCall = useCallback(async (groupId, groupName, callType = "video") => {
    if (!user || activeGroupCall || !socket) return;
    const isAudio = callType === "audio";
    try {
      await getLocalStream(isAudio);
      setActiveGroupCall({ groupId, groupName, callType });
      socket.emit("startGroupCall", { groupId, callType, callerName: user.name, callerAvatar: user.avatar });
    } catch (err) {
      console.error("startGroupCall error:", err);
      cleanupCall();
    }
  }, [user, activeGroupCall, socket, getLocalStream, cleanupCall]);

  // ── Join an existing group call ──────────────────────────────────
  const joinGroupCall = useCallback(async (groupId, groupName, callType = "video") => {
    if (!user || !socket) return;
    const isAudio = callType === "audio";
    try {
      await getLocalStream(isAudio);
      setActiveGroupCall({ groupId, groupName, callType });
      setIncomingGroupCall(null);
      socket.emit("joinGroupCall", { groupId, joinerName: user.name, joinerAvatar: user.avatar });
    } catch (err) {
      console.error("joinGroupCall error:", err);
      cleanupCall();
    }
  }, [user, socket, getLocalStream, cleanupCall]);

  // ── Leave the active group call ──────────────────────────────────
  const leaveGroupCall = useCallback(() => {
    if (!activeGroupCall || !socket) return;
    socket.emit("leaveGroupCall", { groupId: activeGroupCall.groupId });
    cleanupCall();
  }, [activeGroupCall, socket, cleanupCall]);

  // ── Toggle controls ──────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((p) => !p);
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((p) => !p);
  }, []);

  const dismissIncoming = useCallback(() => setIncomingGroupCall(null), []);

  // ── Socket event listeners ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Someone started a group call — show notification
    const onGroupCallStarted = (data) => {
      if (!activeGroupCall) {
        setIncomingGroupCall(data);
      }
    };

    // We just joined — server sends us who is already in the call
    // We initiate WebRTC with each existing participant
    const onGroupCallParticipants = async ({ participants: list }) => {
      for (const p of list) {
        await connectToPeer(p.userId, { name: p.name, avatar: p.avatar });
      }
    };

    // A new participant joined the call — they will send us an offer, just add them to the list
    const onGroupCallParticipantJoined = ({ userId: uid, name, avatar }) => {
      addParticipant(uid, { name, avatar });
    };

    // A participant left
    const onGroupCallParticipantLeft = ({ userId: uid }) => {
      removeParticipant(uid);
    };

    // Received a WebRTC offer from a group call peer (we answer)
    const onWebrtcOffer = async ({ fromUserId, offer }) => {
      // Only handle if we're in a group call AND we have a pc for this user
      // (or create one if we're the existing participant and this is a new joiner)
      if (!activeGroupCall && !pcsRef.current.has(fromUserId)) {
        // This might be a 1:1 call offer — handled by CallContext
        return;
      }
      let pc = pcsRef.current.get(fromUserId);
      if (!pc) {
        // New joiner offering to an existing participant
        pc = createPC(fromUserId);
        if (localStreamRef.current) addLocalTracks(pc, localStreamRef.current);
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushCandidates(fromUserId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtcAnswer", { toUserId: fromUserId, answer });
      } catch (err) {
        console.error("group webrtcOffer handler error:", err);
      }
    };

    // Received WebRTC answer (we were the offerer)
    const onWebrtcAnswer = async ({ fromUserId, answer }) => {
      const pc = pcsRef.current.get(fromUserId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates(fromUserId);
      } catch (err) {
        console.error("group webrtcAnswer handler error:", err);
      }
    };

    // ICE candidates for group call peers
    const onIceCandidate = async ({ fromUserId, candidate }) => {
      if (!pcsRef.current.has(fromUserId)) return;
      const pc = pcsRef.current.get(fromUserId);
      if (pc.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      } else {
        const pending = pendingCandidatesRef.current.get(fromUserId) || [];
        pending.push(candidate);
        pendingCandidatesRef.current.set(fromUserId, pending);
      }
    };

    socket.on("groupCallStarted", onGroupCallStarted);
    socket.on("groupCallParticipants", onGroupCallParticipants);
    socket.on("groupCallParticipantJoined", onGroupCallParticipantJoined);
    socket.on("groupCallParticipantLeft", onGroupCallParticipantLeft);
    socket.on("webrtcOffer", onWebrtcOffer);
    socket.on("webrtcAnswer", onWebrtcAnswer);
    socket.on("iceCandidate", onIceCandidate);

    return () => {
      socket.off("groupCallStarted", onGroupCallStarted);
      socket.off("groupCallParticipants", onGroupCallParticipants);
      socket.off("groupCallParticipantJoined", onGroupCallParticipantJoined);
      socket.off("groupCallParticipantLeft", onGroupCallParticipantLeft);
      socket.off("webrtcOffer", onWebrtcOffer);
      socket.off("webrtcAnswer", onWebrtcAnswer);
      socket.off("iceCandidate", onIceCandidate);
    };
  }, [socket, activeGroupCall, connectToPeer, addParticipant, removeParticipant, createPC, addLocalTracks, flushCandidates]);

  return (
    <GroupCallContext.Provider value={{
      activeGroupCall, incomingGroupCall, participants,
      localStreamRef, isMuted, isCameraOff,
      startGroupCall, joinGroupCall, leaveGroupCall,
      toggleMute, toggleCamera, dismissIncoming,
    }}>
      {children}
    </GroupCallContext.Provider>
  );
}

export function useGroupCall() {
  const ctx = useContext(GroupCallContext);
  if (!ctx) throw new Error("useGroupCall must be used within GroupCallProvider");
  return ctx;
}
