import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Video, Users, Layers } from "lucide-react";
import axios from "../config/axiosInstance.js";
import MainDashboard from "../components/chat/MainDashboard";
import { API_URL } from "../config/api.js";
import { useSocket } from "../context/SocketContext";
import { useAI } from "../context/AIContext";

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function Dashboard() {
  const { aiEnabled, setAiEnabled } = useAI();
  const [_currentView, setCurrentView] = useState("dashboard");
  const [_showSettingsModal, setShowSettingsModal] = useState(false);

  const [statsData, setStatsData] = useState({
    totalMessages: 0,
    activeUsers: 0,
    conversations: 0,
    groups: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const { socket } = useSocket();

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/dashboard/stats`);
      setStatsData(data.stats);
      setRecentActivity(
        data.recentActivity.map((a) => ({
          ...a,
          time: timeAgo(a.time),
          avatar: a.avatar || "👤",
        })),
      );
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message }) => {
      // Increment message count
      setStatsData((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
      }));

      // Prepend to recent activity (messages from others only)
      setRecentActivity((prev) => {
        const newEntry = {
          user: message.senderId?.name || "Someone",
          avatar: message.senderId?.avatar || "👤",
          action: "sent you a message",
          time: "just now",
          type: "dm",
        };
        return [newEntry, ...prev.slice(0, 4)];
      });
    };

    const handleNewGroupMessage = ({ message }) => {
      setStatsData((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
      }));

      setRecentActivity((prev) => {
        const newEntry = {
          user: message.senderId?.name || "Someone",
          avatar: message.senderId?.avatar || "👤",
          action: "sent a group message",
          time: "just now",
          type: "group",
        };
        return [newEntry, ...prev.slice(0, 4)];
      });
    };

    const handleUserOnline = () => {
      setStatsData((prev) => ({ ...prev, activeUsers: prev.activeUsers + 1 }));
    };

    const handleUserOffline = () => {
      setStatsData((prev) => ({
        ...prev,
        activeUsers: Math.max(0, prev.activeUsers - 1),
      }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket]);

  const stats = [
    {
      icon: MessageSquare,
      value: String(statsData.totalMessages),
      label: "Total Messages",
      color: "blue",
    },
    {
      icon: Video,
      value: String(statsData.activeUsers),
      label: "Online Now",
      color: "green",
    },
    {
      icon: Users,
      value: String(statsData.conversations),
      label: "Conversations",
      color: "purple",
    },
    {
      icon: Layers,
      value: String(statsData.groups),
      label: "Groups",
      color: "orange",
    },
  ];

  return (
    <>
      <MainDashboard
        stats={stats}
        recentActivity={recentActivity}
        aiEnabled={aiEnabled}
        setAiEnabled={setAiEnabled}
        setCurrentView={setCurrentView}
        setShowSettingsModal={setShowSettingsModal}
      />
    </>
  );
}

export default Dashboard;
