import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

import { SOCKET_URL } from "../config/api.js";

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!user || !token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    // Already connected
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
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
    socketRef.current?.emit("callUser", { toUserId, callerName, callerAvatar, callType });
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
        socket: socketRef.current,
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
