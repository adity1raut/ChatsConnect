import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axiosInstance.js";
import { API_URL } from "../config/api.js";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { toast } from "../lib/toast";
import {
  describeNotification,
  notificationTarget,
} from "../features/notifications/describe";

const NotificationContext = createContext(null);

const API = `${API_URL}/notifications`;
const PAGE_SIZE = 20;
const DEVICE_PREFS_KEY = "notificationDevicePrefs";
const DEFAULT_DEVICE_PREFS = { sound: true, desktop: false };

const readDevicePrefs = () => {
  try {
    return {
      ...DEFAULT_DEVICE_PREFS,
      ...JSON.parse(localStorage.getItem(DEVICE_PREFS_KEY) || "{}"),
    };
  } catch {
    return DEFAULT_DEVICE_PREFS;
  }
};

const chatKeyOf = (chat) =>
  chat?.conversationId
    ? `dm:${chat.conversationId}`
    : chat?.groupId
      ? `group:${chat.groupId}`
      : null;

const notificationChatKey = (n) =>
  n.conversationId
    ? `dm:${n.conversationId}`
    : n.groupId?._id
      ? `group:${n.groupId._id}`
      : null;

// Short two-tone chime via Web Audio — no audio asset to ship
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    gain.connect(ctx.destination);
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      osc.connect(gain);
      osc.start(now + i * 0.09);
      osc.stop(now + 0.3);
    });
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio unavailable (no user gesture yet, or unsupported)
  }
}

export function NotificationProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [devicePrefs, setDevicePrefs] = useState(readDevicePrefs);
  const [desktopPermission, setDesktopPermission] = useState(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  const activeChatRef = useRef(null);
  const devicePrefsRef = useRef(devicePrefs);
  useEffect(() => {
    devicePrefsRef.current = devicePrefs;
  }, [devicePrefs]);

  const open = useCallback(
    (n) => {
      const { path, state } = notificationTarget(n);
      navigate(path, state ? { state } : undefined);
    },
    [navigate],
  );

  // ── Initial load when a user signs in ────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      axios.get(API, { params: { limit: PAGE_SIZE } }),
      axios.get(`${API}/preferences`),
    ])
      .then(([list, prefs]) => {
        if (cancelled) return;
        setNotifications(list.data.notifications);
        setHasMore(list.data.hasMore);
        setUnreadCount(list.data.unreadCount);
        setPreferences(prefs.data.preferences);
      })
      .catch((err) => console.error("Failed to load notifications:", err));
    return () => {
      cancelled = true;
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
    };
  }, [user]);

  // ── Tell the server which chat this tab is looking at ────────────
  const reportActiveChat = useCallback(() => {
    if (!socket) return;
    const chat = document.hidden ? null : activeChatRef.current;
    socket.emit("activeChat", {
      conversationId: chat?.conversationId,
      groupId: chat?.groupId,
      peerId: chat?.peerId,
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    reportActiveChat();
    socket.on("connect", reportActiveChat);
    document.addEventListener("visibilitychange", reportActiveChat);
    return () => {
      socket.off("connect", reportActiveChat);
      document.removeEventListener("visibilitychange", reportActiveChat);
    };
  }, [socket, reportActiveChat]);

  // ── Actions ───────────────────────────────────────────────────────
  const markChatRead = useCallback((chat) => {
    const key = chatKeyOf(chat);
    if (!key) return;
    setNotifications((prev) => prev.filter((n) => notificationChatKey(n) !== key));
    axios
      .post(`${API}/read`, chat.conversationId
        ? { conversationId: chat.conversationId }
        : { groupId: chat.groupId })
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  // ChatPage reports the open chat (null when none); its notifications are cleared
  const setActiveChat = useCallback(
    (chat) => {
      activeChatRef.current = chat;
      reportActiveChat();
      if (chat) markChatRead(chat);
    },
    [reportActiveChat, markChatRead],
  );

  const markRead = useCallback((ids) => {
    const idSet = new Set(ids);
    setNotifications((prev) =>
      prev.map((n) => (idSet.has(n._id) ? { ...n, read: true } : n)),
    );
    axios
      .post(`${API}/read`, { ids })
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    axios.post(`${API}/read`, { all: true }).catch(() => {});
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    axios
      .delete(`${API}/${id}`)
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setHasMore(false);
    axios.delete(API).catch(() => {});
  }, []);

  const loadMore = useCallback(async () => {
    const oldest = notifications.at(-1);
    if (!oldest || loading) return;
    setLoading(true);
    try {
      const { data } = await axios.get(API, {
        params: { limit: PAGE_SIZE, before: oldest.updatedAt },
      });
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n._id));
        return [...prev, ...data.notifications.filter((n) => !seen.has(n._id))];
      });
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to load more notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [notifications, loading]);

  const updatePreference = useCallback(async (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    try {
      const { data } = await axios.put(`${API}/preferences`, { [key]: value });
      setPreferences(data.preferences);
    } catch {
      setPreferences((prev) => ({ ...prev, [key]: !value }));
      toast({ title: "Couldn't save that setting", variant: "error" });
    }
  }, []);

  const setDevicePref = useCallback(async (key, value) => {
    if (key === "desktop" && value && typeof Notification !== "undefined") {
      const permission = await Notification.requestPermission();
      setDesktopPermission(permission);
      if (permission !== "granted") return;
    }
    setDevicePrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(DEVICE_PREFS_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable — applies for this session only
      }
      return next;
    });
  }, []);

  // ── Real-time events ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const alert = (n) => {
      const prefs = devicePrefsRef.current;
      const { title, body, icon } = describeNotification(n);
      if (prefs.sound) playChime();

      if (document.hidden) {
        if (
          prefs.desktop &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          const desktop = new Notification(title, {
            body,
            icon: n.actor?.avatar || "/chatsconnect.png",
            tag: n._id,
          });
          desktop.onclick = () => {
            window.focus();
            open(n);
            desktop.close();
          };
        }
        return;
      }
      toast({
        title,
        description: body,
        icon,
        avatar: n.actor ? { src: n.actor.avatar, name: n.actor.name } : undefined,
        onClick: () => open(n),
      });
    };

    const onNew = ({ notification: n, unreadCount: count }) => {
      if (typeof count === "number") setUnreadCount(count);
      // Raced with opening the chat — clear it instead of alerting
      const key = notificationChatKey(n);
      if (key && key === chatKeyOf(activeChatRef.current) && !document.hidden) {
        markChatRead(activeChatRef.current);
        return;
      }
      setNotifications((prev) => [n, ...prev.filter((x) => x._id !== n._id)]);
      alert(n);
    };

    const onRemoved = ({ id, unreadCount: count }) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (typeof count === "number") setUnreadCount(count);
    };

    const onRead = ({ ids, all, chat, unreadCount: count }) => {
      setNotifications((prev) =>
        chat
          ? prev.filter((n) => notificationChatKey(n) !== chat)
          : prev.map((n) => (all || ids?.includes(n._id) ? { ...n, read: true } : n)),
      );
      if (typeof count === "number") setUnreadCount(count);
    };

    const onCleared = () => {
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
    };

    socket.on("notification:new", onNew);
    socket.on("notification:removed", onRemoved);
    socket.on("notifications:read", onRead);
    socket.on("notifications:cleared", onCleared);
    return () => {
      socket.off("notification:new", onNew);
      socket.off("notification:removed", onRemoved);
      socket.off("notifications:read", onRead);
      socket.off("notifications:cleared", onCleared);
    };
  }, [socket, open, markChatRead]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasMore,
        loading,
        preferences,
        devicePrefs,
        desktopPermission,
        open,
        markRead,
        markAllRead,
        markChatRead,
        dismiss,
        clearAll,
        loadMore,
        setActiveChat,
        updatePreference,
        setDevicePref,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
