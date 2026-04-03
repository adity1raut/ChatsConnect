import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { SOCKET_URL } from "../config/api.js";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  // Expose socket as state so consumers always get a reactive reference
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Read both token keys — auth controller stores as "authToken"
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("accessToken");

    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    // Already connected with same token — skip
    if (socketRef.current?.connected) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      // Force WebSocket immediately — skip HTTP long-polling round-trip
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      timeout: 10000,
    });

    s.on("connect", () => {
      setIsConnected(true);
      setSocket(s); // expose to consumers only after connection is live
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("reconnect", () => {
      setIsConnected(true);
      setSocket(s);
    });

    s.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    s.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socketRef.current = s;

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const joinGroup = (groupId) => {
    socketRef.current?.emit("joinGroup", { groupId });
  };

  const leaveGroup = (groupId) => {
    socketRef.current?.emit("leaveGroup", { groupId });
  };

  const sendMessage = (receiverId, content) => {
    socketRef.current?.emit("sendMessage", { receiverId, content });
  };

  const sendGroupMessage = (groupId, content) => {
    socketRef.current?.emit("sendGroupMessage", { groupId, content });
  };

  const emitTyping = (receiverId, groupId) => {
    socketRef.current?.emit("typing", { receiverId, groupId });
  };

  const emitStopTyping = (receiverId, groupId) => {
    socketRef.current?.emit("stopTyping", { receiverId, groupId });
  };

  // ── Call signaling helpers ─────────────────────────────────────
  const initiateCall = (toUserId, callerName, callerAvatar, callType) => {
    socketRef.current?.emit("callUser", {
      toUserId,
      callerName,
      callerAvatar,
      callType,
    });
  };

  const acceptCall = (toUserId) => {
    socketRef.current?.emit("callAccepted", { toUserId });
  };

  const rejectCall = (toUserId) => {
    socketRef.current?.emit("callRejected", { toUserId });
  };

  const hangUp = (toUserId) => {
    socketRef.current?.emit("endCall", { toUserId });
  };

  const sendOffer = (toUserId, offer) => {
    socketRef.current?.emit("webrtcOffer", { toUserId, offer });
  };

  const sendAnswer = (toUserId, answer) => {
    socketRef.current?.emit("webrtcAnswer", { toUserId, answer });
  };

  const sendIceCandidate = (toUserId, candidate) => {
    socketRef.current?.emit("iceCandidate", { toUserId, candidate });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        joinGroup,
        leaveGroup,
        sendMessage,
        sendGroupMessage,
        emitTyping,
        emitStopTyping,
        initiateCall,
        acceptCall,
        rejectCall,
        hangUp,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
