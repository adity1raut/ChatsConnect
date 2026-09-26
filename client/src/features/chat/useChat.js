import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserMinus } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL as API } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useNotifications } from "../../context/NotificationContext";
import { useAI } from "../../context/AIContext";
import { toast } from "../../lib/toast";
import { exportChatAsMarkdown } from "./exportChat";
import { MAX_MESSAGE_LENGTH, previewText, toViewMessage } from "./messages";

const TYPING_IDLE_MS = 1500;

const dmContact = (c) => ({
  id: c.contact._id,
  conversationId: c.conversationId,
  name: c.contact.name,
  username: c.contact.username,
  avatar: c.contact.avatar,
  lastMessage: previewText(c.lastMessage?.content),
  lastMessageAt: c.lastMessageAt,
  type: "user",
});

const groupContact = (g) => ({
  id: g._id,
  groupId: g._id,
  name: g.name,
  avatar: g.avatar || null,
  memberCount: g.members.length,
  members: g.members,
  lastMessage: previewText(g.lastMessage?.content),
  lastMessageAt: g.lastMessageAt,
  type: "group",
});

const byRecent = (a, b) =>
  new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);

const sameChat = (a, b) =>
  Boolean(a && b) &&
  a.type === b.type &&
  (a.type === "group" ? a.groupId === b.groupId : a.id === b.id);

// Stable identity of a chat, independent of when it gains a conversationId
const chatKeyOf = (chat) =>
  chat ? (chat.type === "group" ? `group:${chat.groupId}` : `user:${chat.id}`) : null;

/**
 * All chat state and behaviour for the Messages page: contacts, the open
 * chat, its messages, sending, typing, live updates, smart replies,
 * translation and export. Components only render what this returns.
 */
export function useChat() {
  const { user } = useAuth();
  const myId = user?._id;
  const location = useLocation();
  const {
    socket,
    onlineUsers,
    sendMessage,
    sendGroupMessage,
    emitTyping,
    emitStopTyping,
  } = useSocket();
  const { setActiveChat, notifications } = useNotifications();
  const {
    aiEnabled,
    setSmartReplies,
    fetchSmartReplies,
    clearSmartReplies,
    autoTranslate,
    preferredLanguage,
    translateMessage,
  } = useAI();

  const [contacts, setContacts] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  // Messages are stored with the chat they belong to, so a slow response or a
  // live message can never show up in a different chat
  const [thread, setThread] = useState({ key: null, messages: [] });
  const [typing, setTyping] = useState({ key: null, ids: new Set() });

  const selectedKey = chatKeyOf(selectedChat);
  const messages = thread.key === selectedKey ? thread.messages : [];
  const loadingMessages = Boolean(selectedKey) && thread.key !== selectedKey;
  const typingIds = typing.key === selectedKey ? typing.ids : null;

  // Socket handlers read current state from refs instead of nesting setState calls
  const selectedRef = useRef(null);
  const contactsRef = useRef(contacts);
  useEffect(() => {
    selectedRef.current = selectedChat;
    contactsRef.current = contacts;
  }, [selectedChat, contacts]);

  // One place that turns a server message into a view message.
  // (End-to-end decryption plugs in here.)
  const decode = useCallback((raw) => toViewMessage(raw, myId), [myId]);

  // Translate incoming text when auto-translate is on; originals stay visible
  const translateIncoming = useCallback(
    async (msg) => {
      if (!autoTranslate || msg.mine || !msg.text) return msg;
      try {
        const translated = await translateMessage(msg.text, preferredLanguage);
        return translated && translated !== msg.text
          ? { ...msg, text: translated, originalText: msg.text }
          : msg;
      } catch {
        return msg;
      }
    },
    [autoTranslate, preferredLanguage, translateMessage],
  );

  // ── Contacts + people to discover ─────────────────────────────────
  const loadContacts = useCallback(async () => {
    if (!myId) return;
    try {
      const [convRes, groupRes] = await Promise.all([
        axios.get(`${API}/messages/conversations`),
        axios.get(`${API}/groups/my`),
      ]);
      const dms = (convRes.data.conversations || [])
        .filter((c) => c.contact) // the other person may have deleted their account
        .map(dmContact);
      const groups = (groupRes.data.groups || []).map(groupContact);
      setContacts([...dms, ...groups].sort(byRecent));
    } catch (err) {
      console.error("loadContacts error:", err);
    }
  }, [myId]);

  useEffect(() => {
    if (!myId) return;
    let cancelled = false;
    loadContacts();
    axios
      .get(`${API}/profile/all`, { params: { limit: 50 } })
      .then(({ data }) => {
        if (!cancelled) setDiscover((data.users || []).filter((u) => u._id !== myId));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [myId, loadContacts]);

  // ── Deep links: { openChat } / { openGroup } from other pages ─────
  useEffect(() => {
    const { openChat, openGroup } = location.state || {};
    if (openChat) {
      const existing = contacts.find((c) => c.type === "user" && c.id === openChat.id);
      setSelectedChat(
        existing || {
          id: openChat.id,
          name: openChat.name,
          username: openChat.username,
          avatar: openChat.avatar || null,
          type: "user",
        },
      );
      window.history.replaceState({}, "");
    } else if (openGroup && contacts.length) {
      const existing = contacts.find((c) => c.type === "group" && c.groupId === openGroup.groupId);
      if (existing) {
        setSelectedChat(existing);
        window.history.replaceState({}, "");
      }
    }
    // Run when contacts arrive or navigation state changes — not on every contact update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts.length, location.state]);

  // ── Tell notifications which chat is open ─────────────────────────
  const activeConversationId = selectedChat?.conversationId?.toString();
  const activeGroupId = selectedChat?.type === "group" ? selectedChat.groupId : undefined;
  const activePeerId = selectedChat?.type === "user" ? selectedChat.id : undefined;
  useEffect(() => {
    setActiveChat(
      activeConversationId || activeGroupId || activePeerId
        ? { conversationId: activeConversationId, groupId: activeGroupId, peerId: activePeerId }
        : null,
    );
  }, [activeConversationId, activeGroupId, activePeerId, setActiveChat]);
  useEffect(() => () => setActiveChat(null), [setActiveChat]);

  // ── History for the open chat ─────────────────────────────────────
  useEffect(() => {
    const chat = selectedRef.current;
    if (!selectedKey || !chat) return;
    let cancelled = false;

    const url =
      chat.type === "group"
        ? `${API}/messages/group/${chat.groupId}`
        : `${API}/messages/dm/${chat.id}`;

    axios
      .get(url)
      .then(async ({ data }) => {
        if (cancelled) return;
        if (data.conversationId && !chat.conversationId) {
          setSelectedChat((prev) =>
            sameChat(prev, chat) ? { ...prev, conversationId: data.conversationId } : prev,
          );
        }
        const decoded = await Promise.all((data.messages || []).map(decode));
        const view = await Promise.all(decoded.map(translateIncoming));
        if (cancelled) return;
        setThread({ key: selectedKey, messages: view });

        // Suggest replies when the other person spoke last
        const last = view.at(-1);
        if (aiEnabled && last && !last.mine) {
          fetchSmartReplies(
            view.slice(-6).map((m) => ({ role: m.mine ? "user" : "assistant", content: m.text })),
          );
        }
      })
      .catch((err) => {
        console.error("fetchHistory error:", err);
        if (!cancelled) setThread({ key: selectedKey, messages: [] });
      });

    return () => {
      cancelled = true;
      clearSmartReplies();
    };
    // Re-run only when a different chat is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  // ── Live messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Append to the thread only if it's the chat the message belongs to
    const appendTo = async (key, raw) => {
      const view = await translateIncoming(await decode(raw));
      setThread((prev) =>
        prev.key !== key || prev.messages.some((m) => m.id === view.id)
          ? prev
          : { ...prev, messages: [...prev.messages, view] },
      );
    };

    const onDirect = ({ message: raw, conversationId, receiver }) => {
      const mine = raw.senderId?._id === myId;
      const peer = mine ? receiver : raw.senderId;
      if (!peer) return;

      appendTo(`user:${peer._id}`, raw);
      setSelectedChat((prev) =>
        prev?.type === "user" && prev.id === peer._id && !prev.conversationId
          ? { ...prev, conversationId }
          : prev,
      );

      setContacts((prev) => {
        const preview = previewText(raw.content);
        const existing = prev.find((c) => c.type === "user" && c.id === peer._id);
        const updated = existing
          ? { ...existing, conversationId, lastMessage: preview, lastMessageAt: raw.createdAt }
          : {
              id: peer._id,
              conversationId,
              name: peer.name,
              username: peer.username,
              avatar: peer.avatar,
              lastMessage: preview,
              lastMessageAt: raw.createdAt,
              type: "user",
            };
        return [updated, ...prev.filter((c) => c !== existing)];
      });
    };

    const onGroup = ({ message: raw, groupId }) => {
      appendTo(`group:${groupId}`, raw);
      setContacts((prev) => {
        const existing = prev.find((c) => c.type === "group" && c.groupId === groupId);
        if (!existing) return prev;
        const updated = {
          ...existing,
          lastMessage: previewText(raw.content),
          lastMessageAt: raw.createdAt,
        };
        return [updated, ...prev.filter((c) => c !== existing)];
      });
    };

    const onGroupCreated = () => loadContacts();

    const onRemovedFromGroup = ({ groupId }) => {
      const removed = contactsRef.current.find((c) => c.groupId === groupId);
      setContacts((prev) => prev.filter((c) => c.groupId !== groupId));
      if (selectedRef.current?.groupId === groupId) setSelectedChat(null);
      toast({
        title: removed ? `You were removed from ${removed.name}` : "You were removed from a group",
        icon: UserMinus,
      });
    };

    // Typing events for the open chat only; stale ones are dropped on chat change
    const typingKey = ({ senderId, groupId }) => (groupId ? `group:${groupId}` : `user:${senderId}`);
    const onTyping = (e) => {
      const key = typingKey(e);
      setTyping((prev) => ({
        key,
        ids: new Set(prev.key === key ? prev.ids : []).add(e.senderId),
      }));
    };
    const onStopTyping = (e) => {
      const key = typingKey(e);
      setTyping((prev) => {
        if (prev.key !== key) return prev;
        const ids = new Set(prev.ids);
        ids.delete(e.senderId);
        return { key, ids };
      });
    };

    const onSmartReplies = ({ conversationId, groupId, replies }) => {
      const chat = selectedRef.current;
      const match =
        (chat?.type === "user" && chat.conversationId?.toString() === conversationId?.toString()) ||
        (chat?.type === "group" && chat.groupId === groupId);
      if (match) setSmartReplies(replies);
    };

    socket.on("newMessage", onDirect);
    socket.on("newGroupMessage", onGroup);
    socket.on("groupCreated", onGroupCreated);
    socket.on("removedFromGroup", onRemovedFromGroup);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("aiSmartReplies", onSmartReplies);
    return () => {
      socket.off("newMessage", onDirect);
      socket.off("newGroupMessage", onGroup);
      socket.off("groupCreated", onGroupCreated);
      socket.off("removedFromGroup", onRemovedFromGroup);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("aiSmartReplies", onSmartReplies);
    };
  }, [socket, myId, decode, translateIncoming, loadContacts, setSmartReplies]);

  // ── Sending + typing ──────────────────────────────────────────────
  const typingTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(typingTimerRef.current), []);

  const typingTarget = (chat) =>
    chat.type === "group" ? [null, chat.groupId] : [chat.id, null];

  const notifyTyping = useCallback(() => {
    const chat = selectedRef.current;
    if (!chat) return;
    const [receiverId, groupId] = typingTarget(chat);
    emitTyping(receiverId, groupId);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(
      () => emitStopTyping(receiverId, groupId),
      TYPING_IDLE_MS,
    );
  }, [emitTyping, emitStopTyping]);

  const send = useCallback(
    (text) => {
      const chat = selectedRef.current;
      const content = text.trim();
      if (!chat || !content) return false;
      if (content.length > MAX_MESSAGE_LENGTH) {
        toast({
          title: "Message is too long",
          description: `Keep it under ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`,
          variant: "error",
        });
        return false;
      }
      if (chat.type === "group") sendGroupMessage(chat.groupId, content);
      else sendMessage(chat.id, content);

      clearSmartReplies();
      clearTimeout(typingTimerRef.current);
      const [receiverId, groupId] = typingTarget(chat);
      emitStopTyping(receiverId, groupId);
      return true;
    },
    [sendMessage, sendGroupMessage, emitStopTyping, clearSmartReplies],
  );

  // ── Selection ─────────────────────────────────────────────────────
  const selectChat = useCallback((chat) => setSelectedChat(chat), []);

  const startChatWith = useCallback(
    (profile) => {
      const existing = contactsRef.current.find((c) => c.type === "user" && c.id === profile._id);
      setSelectedChat(
        existing || {
          id: profile._id,
          name: profile.name,
          username: profile.username,
          avatar: profile.avatar || null,
          type: "user",
        },
      );
    },
    [],
  );

  const exportCurrentChat = useCallback(async () => {
    const chat = selectedRef.current;
    if (!chat) return;
    try {
      const count = await exportChatAsMarkdown(chat, decode);
      toast({ title: "Chat exported", description: `${count} messages saved as Markdown.` });
    } catch (err) {
      console.error("export failed:", err);
      toast({ title: "Couldn't export this chat", variant: "error" });
    }
  }, [decode]);

  // ── Derived ───────────────────────────────────────────────────────
  // Unread counts come from the (collapsed) message notifications
  const unreadByChat = useMemo(() => {
    const map = new Map();
    for (const n of notifications) {
      if (n.read || !["message", "group_message"].includes(n.type)) continue;
      const key = n.conversationId
        ? `dm:${n.conversationId}`
        : n.groupId?._id
          ? `group:${n.groupId._id}`
          : null;
      if (key) map.set(key, (map.get(key) || 0) + (n.count || 1));
    }
    return map;
  }, [notifications]);

  const contactsView = useMemo(
    () =>
      contacts.map((c) => ({
        ...c,
        isOnline: c.type === "user" && onlineUsers.has(c.id),
        unread:
          unreadByChat.get(c.type === "group" ? `group:${c.groupId}` : `dm:${c.conversationId}`) ||
          0,
      })),
    [contacts, onlineUsers, unreadByChat],
  );

  const contactIds = useMemo(
    () => new Set(contacts.filter((c) => c.type === "user").map((c) => c.id)),
    [contacts],
  );
  const discoverView = useMemo(
    () =>
      discover
        .filter((u) => !contactIds.has(u._id))
        .map((u) => ({ ...u, isOnline: onlineUsers.has(u._id) })),
    [discover, contactIds, onlineUsers],
  );

  const typingNames = useMemo(() => {
    if (!selectedChat || !typingIds?.size) return [];
    if (selectedChat.type === "user") return [selectedChat.name];
    return (selectedChat.members || [])
      .filter((m) => typingIds.has(m.user?._id))
      .map((m) => m.user.name);
  }, [selectedChat, typingIds]);

  return {
    me: user,
    contacts: contactsView,
    discover: discoverView,
    selectedChat,
    selectChat,
    startChatWith,
    reloadContacts: loadContacts,
    messages,
    loadingMessages,
    typingNames,
    isPeerOnline: selectedChat?.type === "user" && onlineUsers.has(selectedChat.id),
    send,
    notifyTyping,
    exportCurrentChat,
  };
}
