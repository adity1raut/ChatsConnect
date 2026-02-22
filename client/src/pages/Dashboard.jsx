import React, { useState } from "react";
import { MessageSquare, Video, Users, Calendar } from "lucide-react";
import MainDashboard from "../components/chat/MainDashboard";

function Dashboard() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [_currentView, setCurrentView] = useState('dashboard');
  const [_showSettingsModal, setShowSettingsModal] = useState(false);

  // Stats data
  const stats = [
    {
      icon: MessageSquare,
      value: "156",
      label: "Total Messages",
      color: "blue",
    },
    {
      icon: Video,
      value: "23",
      label: "Video Calls",
      color: "green",
    },
    {
      icon: Users,
      value: "45",
      label: "Active Users",
      color: "purple",
    },
    {
      icon: Calendar,
      value: "12",
      label: "Meetings Today",
      color: "orange",
    },
  ];

  // Recent activity data
  const recentActivity = [
    {
      user: "Sarah Johnson",
      action: "sent you a message",
      time: "2 minutes ago",
      avatar: "👩",
    },
    {
      user: "Mike Chen",
      action: "started a video call",
      time: "15 minutes ago",
      avatar: "👨",
    },
    {
      user: "Emma Wilson",
      action: "joined the group chat",
      time: "1 hour ago",
      avatar: "👩‍💼",
    },
    {
      user: "Alex Brown",
      action: "shared a file",
      time: "2 hours ago",
      avatar: "👨‍💻",
    },
    {
      user: "Lisa Martinez",
      action: "scheduled a meeting",
      time: "3 hours ago",
      avatar: "👩‍🦰",
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
