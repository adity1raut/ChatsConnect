import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../config/axiosInstance.js";
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
  const [allUsers, setAllUsers] = useState([]); // every user on the platform
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const {
    aiEnabled,
    setSmartReplies,
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

  // ── Load conversations + groups (no onlineUsers dependency) ─────
  const loadContacts = useCallback(async () => {
    if (!user) return;
    try {
      const [convRes, groupRes] = await Promise.all([
        axios.get(`${API}/messages/conversations`),
        axios.get(`${API}/groups/my`),
      ]);

      const dmContacts = (convRes.data.conversations || []).map((c) => ({
        id: c.contact._id,
        conversationId: c.conversationId,
        name: c.contact.name,
        username: c.contact.username,
        avatar: c.contact.avatar,
        isOnline: c.contact.isOnline, // resolved at render time via onlineUsers
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

      const all = [...dmContacts, ...groupContacts].sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0),
      );

      setContacts(all);
    } catch (err) {
      console.error("loadContacts error:", err);
    }
  }, [user]);

  // ── Load ALL users for discovery sidebar ────────────────────────
  const loadAllUsers = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/profile/all?limit=50`);
      // Exclude self
      const others = (res.data.users || []).filter((u) => u._id !== user._id);
      setAllUsers(others);
    } catch (err) {
      console.error("loadAllUsers error:", err);
    }
  }, [user]);

  useEffect(() => {
    loadContacts();
    loadAllUsers();
  }, [loadContacts, loadAllUsers]);

  // ── Join group socket rooms when contacts load ───────────────────
  useEffect(() => {
    contacts.forEach((c) => {
      if (c.type === "group") joinGroup(c.groupId);
    });
  }, [contacts, joinGroup]);

  // ── Deep-link: open a chat from navigation state ─────────────────
  useEffect(() => {
    if (!contacts.length) return;
    const { openChat, openGroup } = location.state || {};

    if (openChat) {
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

        const res = await axios.get(url);
        const raw = res.data.messages || [];

        // If this is first message (new conversation), store conversationId
        if (res.data.conversationId && !selectedChat.conversationId) {
          setSelectedChat((prev) =>
            prev ? { ...prev, conversationId: res.data.conversationId } : prev,
          );
        }

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
          const results = await Promise.allSettled(
            mapped.map(async (m) => {
              if (m.sender !== "them") return m;
              const t = await translateMessage(m.text, preferredLanguage);
              return t ? { ...m, text: t, originalText: m.text } : m;
            }),
          );
          setMessages(
            results.map((r) => (r.status === "fulfilled" ? r.value : r.reason)),
          );
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
  }, [selectedChat?.id, selectedChat?.groupId, user]); // only re-run when the actual chat changes

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

      setSelectedChat((prev) => {
        if (
          prev &&
          prev.type === "user" &&
          (prev.conversationId?.toString() === conversationId?.toString() ||
            prev.id === msg.senderId._id)
        ) {
          setMessages((msgs) => {
            if (msgs.find((m) => m.id === newMsg.id)) return msgs;
            return [...msgs, newMsg];
          });
          // Attach conversationId to transient chats after first message
          if (!prev.conversationId) {
            return { ...prev, conversationId };
          }
        }
        return prev;
      });

      setContacts((prev) => {
        const exists = prev.find(
          (c) =>
            c.type === "user" &&
            (c.conversationId?.toString() === conversationId?.toString() ||
              c.id === msg.senderId._id),
        );
        if (exists) {
          return prev.map((c) =>
            c === exists
              ? {
                  ...c,
                  lastMessage: msg.content,
                  lastMessageAt: msg.createdAt,
                  conversationId,
                }
              : c,
          );
        }
        // New conversation — add sender to contact list immediately
        return [
          {
            id: msg.senderId._id,
            conversationId,
            name: msg.senderId.name,
            username: msg.senderId.username,
            avatar: msg.senderId.avatar,
            isOnline: true,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            type: "user",
            unread: 1,
          },
          ...prev,
        ];
      });
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

  // ── Socket: added to a new group ────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleGroupCreated = ({ group }) => {
      joinGroup(group._id);
      loadContacts();
    };
    socket.on("groupCreated", handleGroupCreated);
    return () => socket.off("groupCreated", handleGroupCreated);
  }, [socket, joinGroup, loadContacts]);

  // ── Socket: typing indicators (only for the active chat) ─────────
  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ senderId, groupId }) => {
      setSelectedChat((prev) => {
        if (!prev) return prev;
        const isDM = prev.type === "user" && prev.id === senderId;
        const isGroup = prev.type === "group" && prev.groupId === groupId;
        if (isDM || isGroup) setTypingUsers((p) => new Set([...p, senderId]));
        return prev;
      });
    };
    const handleStopTyping = ({ senderId, groupId }) => {
      setSelectedChat((prev) => {
        if (!prev) return prev;
        const isDM = prev.type === "user" && prev.id === senderId;
        const isGroup = prev.type === "group" && prev.groupId === groupId;
        if (isDM || isGroup)
          setTypingUsers((p) => {
            const next = new Set(p);
            next.delete(senderId);
            return next;
          });
        return prev;
      });
    };
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket]);

  // ── Socket: real-time AI smart replies ──────────────────────────
  useEffect(() => {
    if (!socket || !aiEnabled) return;
    const handleAISmartReplies = ({ conversationId, groupId, replies }) => {
      setSelectedChat((prev) => {
        if (!prev) return prev;
        const matchDM =
          prev.type === "user" &&
          prev.conversationId?.toString() === conversationId?.toString();
        const matchGroup = prev.type === "group" && prev.groupId === groupId;
        if (matchDM || matchGroup) setSmartReplies(replies);
        return prev;
      });
    };
    socket.on("aiSmartReplies", handleAISmartReplies);
    return () => socket.off("aiSmartReplies", handleAISmartReplies);
  }, [socket, aiEnabled, setSmartReplies]);

  // ── Online status: update contacts reactively ───────────────────
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
    clearSmartReplies(); // hide suggestions once message is sent

    if (selectedChat.type === "group") {
      emitStopTyping(null, selectedChat.groupId);
    } else {
      emitStopTyping(selectedChat.id, null);
    }
  };

  // ── Typing detection (with unmount cleanup) ──────────────────────
  useEffect(() => {
    return () => clearTimeout(typingTimerRef.current);
  }, []);

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

  // ── AI: auto smart replies when OTHER person sends a message ──────
  useEffect(() => {
    if (!aiEnabled || !messages.length || !selectedChat) {
      clearSmartReplies();
      return;
    }
    // Only suggest replies when the last message is from the other person
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender !== "them") return;

    const aiMessages = messages.slice(-6).map((m) => ({
      role: m.sender === "me" ? "user" : "assistant",
      content: m.text,
    }));
    fetchSmartReplies(aiMessages);
  }, [messages, aiEnabled, selectedChat, fetchSmartReplies, clearSmartReplies]);

  useEffect(() => {
    clearSmartReplies();
  }, [selectedChat, clearSmartReplies]);

  // ── Callbacks ────────────────────────────────────────────────────
  const handleGroupCreated = (group) => {
    joinGroup(group._id);
    loadContacts();
  };

  const handleNewDM = (userProfile) => {
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

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setTypingUsers(new Set());
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

  // Start a DM from the discovery list (allUsers)
  const handleStartChatWithUser = (u) => {
    handleNewDM(u);
    setShowNewDM(false);
  };

  const isTyping =
    selectedChat &&
    selectedChat.type === "user" &&
    typingUsers.has(selectedChat.id);

  return (
    <div className="flex h-full">
      <ChatPageComponent
        contacts={contacts}
        allUsers={allUsers}
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
        onStartChatWithUser={handleStartChatWithUser}
        smartReplySlot={
          <SmartReply onSelect={(reply) => handleMessageChange(reply)} />
        }
      />
      {showAIPanel && aiEnabled && (
        <div className="hidden lg:flex w-72 xl:w-80 shrink-0 h-full">
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
