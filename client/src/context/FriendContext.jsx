import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "../config/axiosInstance.js";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const FriendContext = createContext(null);

import { API_URL as API } from "../config/api.js";

export function FriendProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  // Cache: userId -> { status, requestId }
  const [relationships, setRelationships] = useState({});

  // ── Load on login ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const [friendsRes, incomingRes, sentRes] = await Promise.all([
      axios.get(`${API}/friends`, {}),
      axios.get(`${API}/friends/requests`, {}),
      axios.get(`${API}/friends/sent`, {}),
    ]);
    return {
      friends: friendsRes.data.friends || [],
      incoming: incomingRes.data.requests || [],
      sent: sentRes.data.requests || [],
    };
  }, []);

  const applyAll = useCallback(({ friends, incoming, sent }) => {
    setFriends(friends);
    setIncomingRequests(incoming);
    setSentRequests(sent);

    // Populate relationship cache from loaded data
    const rel = {};
    friends.forEach((f) => {
      rel[f._id] = { status: "friends" };
    });
    incoming.forEach((r) => {
      rel[r.sender._id] = { status: "received", requestId: r._id };
    });
    sent.forEach((r) => {
      rel[r.receiver._id] = { status: "sent", requestId: r._id };
    });
    setRelationships(rel);
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      applyAll(await fetchAll());
    } catch (err) {
      console.error("FriendContext loadAll error:", err);
    }
  }, [user, fetchAll, applyAll]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchAll()
      .then((data) => {
        if (!cancelled) applyAll(data);
      })
      .catch((err) => console.error("FriendContext loadAll error:", err));
    return () => {
      cancelled = true;
    };
  }, [user, fetchAll, applyAll]);

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

    // The sender withdrew their request — drop it from our list
    const handleFriendRequestCancelled = ({ requestId, senderId }) => {
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      setRelationships((prev) => {
        const next = { ...prev };
        delete next[senderId];
        return next;
      });
    };

    socket.on("friendRequest", handleFriendRequest);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);
    socket.on("friendRequestCancelled", handleFriendRequestCancelled);
    return () => {
      socket.off("friendRequest", handleFriendRequest);
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
      socket.off("friendRequestCancelled", handleFriendRequestCancelled);
    };
  }, [socket, user]);

  // ── Actions ───────────────────────────────────────────────────────
  const sendRequest = useCallback(async (userId) => {
    const res = await axios.post(`${API}/friends/request/${userId}`, {}, {});
    const req = res.data.request;
    setSentRequests((prev) => [req, ...prev]);
    setRelationships((prev) => ({
      ...prev,
      [userId]: { status: "sent", requestId: req._id },
    }));
    return req;
  }, []);

  const acceptRequest = useCallback(
    async (requestId, senderId) => {
      await axios.put(`${API}/friends/request/${requestId}/accept`, {}, {});
      const accepted = incomingRequests.find(
        (r) => r._id === requestId,
      )?.sender;
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (accepted) {
        setFriends((prev) => [...prev, accepted]);
        setRelationships((prev) => ({
          ...prev,
          [senderId]: { status: "friends" },
        }));
      }
    },
    [incomingRequests],
  );

  const rejectRequest = useCallback(async (requestId, senderId) => {
    await axios.put(`${API}/friends/request/${requestId}/reject`, {}, {});
    setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
    setRelationships((prev) => ({ ...prev, [senderId]: { status: "none" } }));
  }, []);

  const cancelRequest = useCallback(async (requestId, receiverId) => {
    await axios.delete(`${API}/friends/request/${requestId}/cancel`);
    setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
    setRelationships((prev) => ({ ...prev, [receiverId]: { status: "none" } }));
  }, []);

  const removeFriend = useCallback(async (userId) => {
    await axios.delete(`${API}/friends/${userId}`, {});
    setFriends((prev) => prev.filter((f) => f._id !== userId));
    setRelationships((prev) => ({ ...prev, [userId]: { status: "none" } }));
  }, []);

  // Get relationship for a single user (with cache)
  const getRelationship = useCallback(
    (userId) => relationships[userId] || { status: "none" },
    [relationships],
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
