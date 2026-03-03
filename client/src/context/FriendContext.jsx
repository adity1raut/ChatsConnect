import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const FriendContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

export function FriendProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  // Cache: userId -> { status, requestId }
  const [relationships, setRelationships] = useState({});

  // ── Load on login ─────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const [friendsRes, incomingRes, sentRes] = await Promise.all([
        axios.get(`${API}/friends`, { headers: authHeader() }),
        axios.get(`${API}/friends/requests`, { headers: authHeader() }),
        axios.get(`${API}/friends/sent`, { headers: authHeader() }),
      ]);
      setFriends(friendsRes.data.friends || []);
      setIncomingRequests(incomingRes.data.requests || []);
      setSentRequests(sentRes.data.requests || []);

      // Populate relationship cache from loaded data
      const rel = {};
      (friendsRes.data.friends || []).forEach((f) => {
        rel[f._id] = { status: "friends" };
      });
      (incomingRes.data.requests || []).forEach((r) => {
        rel[r.sender._id] = { status: "received", requestId: r._id };
      });
      (sentRes.data.requests || []).forEach((r) => {
        rel[r.receiver._id] = { status: "sent", requestId: r._id };
      });
      setRelationships(rel);
    } catch (err) {
      console.error("FriendContext loadAll error:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  // ── Socket: incoming friend request ──────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    const handleFriendRequest = ({ request }) => {
      setIncomingRequests((prev) => [request, ...prev]);
      setRelationships((prev) => ({
        ...prev,
        [request.sender._id]: { status: "received", requestId: request._id },
      }));
    };

    const handleFriendRequestAccepted = ({ request, acceptedBy }) => {
      // Move from sentRequests → friends
      setSentRequests((prev) => prev.filter((r) => r._id !== request._id));
      setFriends((prev) => [...prev, acceptedBy]);
      setRelationships((prev) => ({
        ...prev,
        [acceptedBy._id]: { status: "friends" },
      }));
    };

    socket.on("friendRequest", handleFriendRequest);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);
    return () => {
      socket.off("friendRequest", handleFriendRequest);
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
    };
  }, [socket, user]);

  // ── Actions ───────────────────────────────────────────────────────
  const sendRequest = useCallback(async (userId) => {
    const res = await axios.post(`${API}/friends/request/${userId}`, {}, { headers: authHeader() });
    const req = res.data.request;
    setSentRequests((prev) => [req, ...prev]);
    setRelationships((prev) => ({ ...prev, [userId]: { status: "sent", requestId: req._id } }));
    return req;
  }, []);

  const acceptRequest = useCallback(async (requestId, senderId) => {
    await axios.put(`${API}/friends/request/${requestId}/accept`, {}, { headers: authHeader() });
    const accepted = incomingRequests.find((r) => r._id === requestId)?.sender;
    setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
    if (accepted) {
      setFriends((prev) => [...prev, accepted]);
      setRelationships((prev) => ({ ...prev, [senderId]: { status: "friends" } }));
    }
  }, [incomingRequests]);

  const rejectRequest = useCallback(async (requestId, senderId) => {
    await axios.put(`${API}/friends/request/${requestId}/reject`, {}, { headers: authHeader() });
    setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
    setRelationships((prev) => ({ ...prev, [senderId]: { status: "none" } }));
  }, []);

  const cancelRequest = useCallback(async (requestId, receiverId) => {
    await axios.delete(`${API}/friends/request/${requestId}/cancel`, { headers: authHeader() });
    setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
    setRelationships((prev) => ({ ...prev, [receiverId]: { status: "none" } }));
  }, []);

  const removeFriend = useCallback(async (userId) => {
    await axios.delete(`${API}/friends/${userId}`, { headers: authHeader() });
    setFriends((prev) => prev.filter((f) => f._id !== userId));
    setRelationships((prev) => ({ ...prev, [userId]: { status: "none" } }));
  }, []);

  // Get relationship for a single user (with cache)
  const getRelationship = useCallback(
    (userId) => relationships[userId] || { status: "none" },
    [relationships]
  );

  const incomingCount = incomingRequests.length;

  return (
    <FriendContext.Provider
      value={{
        friends,
        incomingRequests,
        sentRequests,
        incomingCount,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeFriend,
        getRelationship,
        reloadFriends: loadAll,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendContext);
  if (!ctx) throw new Error("useFriends must be used within FriendProvider");
  return ctx;
}
