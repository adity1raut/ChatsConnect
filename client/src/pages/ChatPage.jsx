import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ChatPageComponent from "../components/chat/ChatPage";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ChatPage() {
  const { user } = useAuth();
  const {
    socket,
    onlineUsers,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendGroupMessage,
    emitTyping,
    emitStopTyping,
  } = useSocket();

  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [aiEnabled] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const typingTimerRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // ── Load conversations + groups ──────────────────────────────────
  const loadContacts = useCallback(async () => {
    try {
      const [convRes, groupRes] = await Promise.all([
        axios.get(`${API}/messages/conversations`, { headers: authHeader() }),
        axios.get(`${API}/groups/my`, { headers: authHeader() }),
      ]);

      const dmContacts = (convRes.data.conversations || []).map((c) => ({
        id: c.contact._id,
        conversationId: c.conversationId,
        name: c.contact.name,
        username: c.contact.username,
        avatar: c.contact.avatar,
        isOnline: onlineUsers.has(c.contact._id) || c.contact.isOnline,
        lastMessage: c.lastMessage?.content || "",
        lastMessageAt: c.lastMessageAt,
        type: "user",
        unread: 0,
      }));

      const groupContacts = (groupRes.data.groups || []).map((g) => ({
        id: g._id,
        groupId: g._id,
        name: g.name,
        avatar: g.avatar || null,
        memberCount: g.members.length,
        members: g.members,
        lastMessage: g.lastMessage?.content || "",
        lastMessageAt: g.lastMessageAt,
        type: "group",
        unread: 0,
      }));

      // Merge and sort by last activity
      const all = [...dmContacts, ...groupContacts].sort(
        (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );

      setContacts(all);
    } catch (err) {
      console.error("loadContacts error:", err);
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (user) loadContacts();
  }, [user, loadContacts]);

  // ── Join group socket rooms when contacts load ───────────────────
  useEffect(() => {
    contacts.forEach((c) => {
      if (c.type === "group") joinGroup(c.groupId);
    });
  }, [contacts, joinGroup]);

  // ── Load message history when chat is selected ──────────────────
  useEffect(() => {
    if (!selectedChat) { setMessages([]); return; }

    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const url =
          selectedChat.type === "group"
            ? `${API}/messages/group/${selectedChat.groupId}`
            : `${API}/messages/dm/${selectedChat.id}`;

        const res = await axios.get(url, { headers: authHeader() });
        const raw = res.data.messages || [];

        setMessages(
          raw.map((m) => ({
            id: m._id,
            sender: m.senderId._id === user._id ? "me" : "them",
            senderName: m.senderId.name,
            senderAvatar: m.senderId.avatar,
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "read",
          }))
        );
      } catch (err) {
        console.error("fetchHistory error:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();
  }, [selectedChat, user]);

  // ── Socket: incoming DM ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message: msg, conversationId }) => {
      const newMsg = {
        id: msg._id,
        sender: msg.senderId._id === user._id ? "me" : "them",
        senderName: msg.senderId.name,
        senderAvatar: msg.senderId.avatar,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      // Append if we're viewing this conversation
      setSelectedChat((prev) => {
        if (
          prev &&
          prev.type === "user" &&
          (prev.conversationId?.toString() === conversationId?.toString() ||
            prev.id === msg.senderId._id)
        ) {
          setMessages((msgs) => {
            // Deduplicate by id
            if (msgs.find((m) => m.id === newMsg.id)) return msgs;
            return [...msgs, newMsg];
          });
        }
        return prev;
      });

      // Update contact's last message in list
      loadContacts();
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, user, loadContacts]);

  // ── Socket: incoming group message ───────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleGroupMessage = ({ message: msg, groupId }) => {
      const newMsg = {
        id: msg._id,
        sender: msg.senderId._id === user._id ? "me" : "them",
        senderName: msg.senderId.name,
        senderAvatar: msg.senderId.avatar,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      setSelectedChat((prev) => {
        if (prev && prev.type === "group" && prev.groupId === groupId) {
          setMessages((msgs) => {
            if (msgs.find((m) => m.id === newMsg.id)) return msgs;
            return [...msgs, newMsg];
          });
        }
        return prev;
      });

      loadContacts();
    };

    socket.on("newGroupMessage", handleGroupMessage);
    return () => socket.off("newGroupMessage", handleGroupMessage);
  }, [socket, user, loadContacts]);

  // ── Socket: typing indicators ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      setTypingUsers((prev) => new Set([...prev, senderId]));
    });

    socket.on("stopTyping", ({ senderId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(senderId);
        return next;
      });
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket]);

  // ── Online status: update contacts when users come/go online ────
  useEffect(() => {
    setContacts((prev) =>
      prev.map((c) =>
        c.type === "user"
          ? { ...c, isOnline: onlineUsers.has(c.id) }
          : c
      )
    );
  }, [onlineUsers]);

  // ── Send message ─────────────────────────────────────────────────
  const handleSendMessage = () => {
    const content = message.trim();
    if (!content || !selectedChat) return;

    if (selectedChat.type === "group") {
      sendGroupMessage(selectedChat.groupId, content);
    } else {
      sendMessage(selectedChat.id, content);
    }

    setMessage("");

    // Stop typing
    if (selectedChat.type === "group") {
      emitStopTyping(null, selectedChat.groupId);
    } else {
      emitStopTyping(selectedChat.id, null);
    }
  };

  // ── Typing detection ──────────────────────────────────────────────
  const handleMessageChange = (val) => {
    setMessage(val);

    if (!selectedChat) return;

    const receiverId = selectedChat.type === "user" ? selectedChat.id : null;
    const groupId = selectedChat.type === "group" ? selectedChat.groupId : null;

    emitTyping(receiverId, groupId);

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitStopTyping(receiverId, groupId);
    }, 1500);
  };

  // ── Group created callback ────────────────────────────────────────
  const handleGroupCreated = (group) => {
    joinGroup(group._id);
    loadContacts();
  };

  // ── Leave a group room when deselecting ──────────────────────────
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setTypingUsers(new Set());
  };

  const isTyping =
    selectedChat &&
    selectedChat.type === "user" &&
    typingUsers.has(selectedChat.id);

  return (
    <div className="flex h-full">
      <ChatPageComponent
        contacts={contacts}
        selectedChat={selectedChat}
        setSelectedChat={handleSelectChat}
        message={message}
        setMessage={handleMessageChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isVideoCall={isVideoCall}
        setIsVideoCall={setIsVideoCall}
        aiEnabled={aiEnabled}
        handleSendMessage={handleSendMessage}
        messages={messages}
        loadingMessages={loadingMessages}
        isTyping={isTyping}
        onlineUsers={onlineUsers}
        onCreateGroup={() => setShowCreateGroup(true)}
      />
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}

export default ChatPage;
