import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatPageComponent from "../components/chat/ChatPage";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import NewDMModal from "../components/chat/NewDMModal";
import ManageGroupModal from "../components/chat/ManageGroupModal";
import AIPanel from "../components/ai/AIPanel";
import SmartReply from "../components/ai/SmartReply";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNotifications } from "../context/NotificationContext";
import { useCall } from "../context/CallContext";
import { useGroupCall } from "../context/GroupCallContext";
import { useAI } from "../context/AIContext";

import { API_URL as API } from "../config/api.js";

function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveChat: setNotifActiveChat } = useNotifications();
  const {
    socket,
    onlineUsers,
    joinGroup,
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
  const [showAIPanel, setShowAIPanel] = useState(false);
  const {
    aiEnabled,
    fetchSmartReplies,
    clearSmartReplies,
    autoTranslate,
    preferredLanguage,
    translateMessage,
  } = useAI();
  const { startCall } = useCall();
  const { startGroupCall } = useGroupCall();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [showManageGroup, setShowManageGroup] = useState(false);
  const [managingGroup, setManagingGroup] = useState(null);
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
        (a, b) =>
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0),
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

  // ── Deep-link: open a chat from navigation state (Search / Notifications) ─
  useEffect(() => {
    if (!contacts.length) return;
    const { openChat, openGroup } = location.state || {};

    if (openChat) {
      // Try to find existing contact; if not, create a transient one
      const existing = contacts.find(
        (c) => c.type === "user" && c.id === openChat.id,
      );
      setSelectedChat(
        existing || {
          id: openChat.id,
          name: openChat.name,
          username: openChat.username,
          avatar: openChat.avatar || null,
          type: "user",
          isOnline: onlineUsers.has(openChat.id),
        },
      );
      // Clear state so re-renders don't re-trigger
      window.history.replaceState({}, "");
    } else if (openGroup) {
      const existing = contacts.find(
        (c) => c.type === "group" && c.groupId === openGroup.groupId,
      );
      if (existing) {
        setSelectedChat(existing);
        window.history.replaceState({}, "");
      }
    }
    // Only run once after contacts first load, or when navigation state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts.length, location.state]);

  // ── Load message history when chat is selected ──────────────────
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const url =
          selectedChat.type === "group"
            ? `${API}/messages/group/${selectedChat.groupId}`
            : `${API}/messages/dm/${selectedChat.id}`;

        const res = await axios.get(url, { headers: authHeader() });
        const raw = res.data.messages || [];

        const mapped = raw.map((m) => ({
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
        }));

        if (autoTranslate) {
          const translated = await Promise.all(
            mapped.map(async (m) => {
              if (m.sender !== "them") return m;
              const t = await translateMessage(m.text, preferredLanguage);
              return t ? { ...m, text: t, originalText: m.text } : m;
            }),
          );
          setMessages(translated);
        } else {
          setMessages(mapped);
        }
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

      // Update contact's last message in-place (fast, no API call)
      setContacts((prev) =>
        prev.map((c) =>
          c.type === "user" &&
          (c.conversationId?.toString() === conversationId?.toString() ||
            c.id === msg.senderId._id)
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
            : c,
        ),
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, user]);

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

      // Update group contact's last message in-place
      setContacts((prev) =>
        prev.map((c) =>
          c.type === "group" && c.groupId === groupId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
            : c,
        ),
      );
    };

    socket.on("newGroupMessage", handleGroupMessage);
    return () => socket.off("newGroupMessage", handleGroupMessage);
  }, [socket, user]);

  // ── Socket: another user added this user to a group ─────────────
  useEffect(() => {
    if (!socket) return;

    const handleGroupCreated = ({ group }) => {
      // Join the socket room for the new group and refresh contact list
      joinGroup(group._id);
      loadContacts();
    };

    socket.on("groupCreated", handleGroupCreated);
    return () => socket.off("groupCreated", handleGroupCreated);
  }, [socket, joinGroup, loadContacts]);

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
        c.type === "user" ? { ...c, isOnline: onlineUsers.has(c.id) } : c,
      ),
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

  // ── AI: fetch smart replies when last message arrives ────────────
  useEffect(() => {
    if (!aiEnabled || !messages.length || !selectedChat) {
      clearSmartReplies();
      return;
    }
    const aiMessages = messages.slice(-6).map((m) => ({
      role: m.sender === "me" ? "user" : "assistant",
      content: m.text,
    }));
    fetchSmartReplies(aiMessages);
  }, [messages, aiEnabled, selectedChat, fetchSmartReplies, clearSmartReplies]);

  // ── AI: clear smart replies when chat changes ──────────────────
  useEffect(() => {
    clearSmartReplies();
  }, [selectedChat, clearSmartReplies]);

  // ── Group created callback ────────────────────────────────────────
  const handleGroupCreated = (group) => {
    joinGroup(group._id);
    loadContacts();
  };

  // ── New DM: open chat with selected user ──────────────────────────
  const handleNewDM = (userProfile) => {
    // Check if we already have a conversation with this user
    const existing = contacts.find(
      (c) => c.type === "user" && c.id === userProfile._id,
    );
    handleSelectChat(
      existing || {
        id: userProfile._id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar || null,
        type: "user",
        isOnline: onlineUsers.has(userProfile._id),
      },
    );
  };

  // ── Select a chat: update socket rooms + clear typing + tell notifications ─
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setTypingUsers(new Set());

    // Mark notifications for this chat as read
    if (chat) {
      const chatId =
        chat.type === "group"
          ? `group-${chat.groupId}`
          : chat.conversationId?.toString() || null;
      setNotifActiveChat(chatId);
    } else {
      setNotifActiveChat(null);
    }
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
        aiEnabled={aiEnabled}
        handleSendMessage={handleSendMessage}
        messages={messages}
        loadingMessages={loadingMessages}
        isTyping={isTyping}
        onlineUsers={onlineUsers}
        onCreateGroup={() => setShowCreateGroup(true)}
        onNewDM={() => setShowNewDM(true)}
        currentUser={user}
        onStartVideoCall={(chat) => startCall(chat, false)}
        onStartAudioCall={(chat) => startCall(chat, true)}
        onManageGroup={(chat) => {
          setManagingGroup(chat);
          setShowManageGroup(true);
        }}
        onStartGroupCall={(chat) =>
          startGroupCall(chat.groupId, chat.name, "video")
        }
        onToggleAIPanel={() => setShowAIPanel((v) => !v)}
        onViewProfile={(uid) => navigate(`/profile/${uid}`)}
        smartReplySlot={
          <SmartReply
            onSelect={(reply) => {
              handleMessageChange(reply);
            }}
          />
        }
      />
      {showAIPanel && aiEnabled && (
        <div className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 h-full">
          <AIPanel onClose={() => setShowAIPanel(false)} />
        </div>
      )}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
      {showNewDM && (
        <NewDMModal
          onClose={() => setShowNewDM(false)}
          onSelectUser={handleNewDM}
        />
      )}
      {showManageGroup && managingGroup && (
        <ManageGroupModal
          group={managingGroup}
          currentUser={user}
          onClose={() => {
            setShowManageGroup(false);
            setManagingGroup(null);
          }}
          onGroupUpdated={loadContacts}
        />
      )}
    </div>
  );
}

export default ChatPage;
