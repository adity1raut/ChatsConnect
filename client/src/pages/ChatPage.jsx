import React, { useState } from "react";
import ChatPageComponent from "../components/chat/ChatPage";

function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [aiEnabled, _setAiEnabled] = useState(true);

  // Sample contacts data
  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "👩",
      lastMessage: "See you tomorrow!",
      time: "2:30 PM",
      unread: 2,
      status: "online",
      type: "user",
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "👨",
      lastMessage: "Thanks for the update",
      time: "1:45 PM",
      unread: 0,
      status: "away",
      type: "user",
    },
    {
      id: 3,
      name: "Team Alpha",
      avatar: "👥",
      lastMessage: "Meeting at 3 PM",
      time: "12:30 PM",
      unread: 5,
      status: "8 members",
      type: "group",
    },
    {
      id: 4,
      name: "Emma Wilson",
      avatar: "👩‍💼",
      lastMessage: "Great work on the project!",
      time: "11:20 AM",
      unread: 0,
      status: "online",
      type: "user",
    },
    {
      id: 5,
      name: "Project Discuss",
      avatar: "💼",
      lastMessage: "Alex: I'll send the files",
      time: "10:15 AM",
      unread: 3,
      status: "12 members",
      type: "group",
    },
    {
      id: 6,
      name: "Alex Brown",
      avatar: "👨‍💻",
      lastMessage: "Let's catch up soon",
      time: "9:30 AM",
      unread: 0,
      status: "offline",
      type: "user",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add your message sending logic here
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen">
      <ChatPageComponent
        contacts={contacts}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        message={message}
        setMessage={setMessage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isVideoCall={isVideoCall}
        setIsVideoCall={setIsVideoCall}
        aiEnabled={aiEnabled}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default ChatPage;