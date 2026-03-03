import { useState, useRef, useEffect } from "react";
import {
  Send, Phone, Video, MoreVertical, Search, MessageSquare,
  Image, Paperclip, Smile, X, Users, ArrowLeft,
  Star, Pin, VolumeX, Trash2, Check, CheckCheck, Plus, Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";

export default function ChatPage({
  contacts,
  selectedChat,
  setSelectedChat,
  message,
  setMessage,
  activeTab,
  setActiveTab,
  isVideoCall,
  setIsVideoCall,
  handleSendMessage,
  messages = [],
  loadingMessages = false,
  isTyping = false,
  onlineUsers = new Set(),
  onCreateGroup,
}) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close info panel when chat changes
  useEffect(() => {
    setShowInfo(false);
  }, [selectedChat]);

  const filteredContacts = contacts.filter((contact) => {
    const matchesTab =
      activeTab === "all" ? true :
      activeTab === "users" ? contact.type === "user" :
      activeTab === "groups" ? contact.type === "group" : true;

    const matchesSearch = !searchQuery
      || contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      || (contact.lastMessage || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const TABS = [
    { id: "all", label: "All" },
    { id: "users", label: "People" },
    { id: "groups", label: "Groups" },
  ];

  const showContactListOnMobile = !selectedChat;
  const showChatOnMobile = !!selectedChat;

  return (
    <>
      {/* Theme Toggle — desktop */}
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <ThemeToggle />
      </div>

      {/* ══ Contact Sidebar ══════════════════════════════════════ */}
      <div
        className={`
          ${showContactListOnMobile ? "flex" : "hidden"} md:flex
          flex-col h-full border-r transition-colors duration-300
          w-full md:w-75 shrink-0
          ${isDark ? "bg-gray-950/90 border-white/6" : "bg-white/98 border-gray-200/70"}
        `}
      >
        {/* Top */}
        <div className={`px-4 pt-5 pb-3 border-b shrink-0 ${isDark ? "border-white/6" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Messages
            </h1>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onCreateGroup}
                title="New Group"
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
              <button className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}>
                <Pin size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className={`relative flex items-center rounded-xl border transition-all duration-200 mb-3 ${isDark
              ? "bg-white/4 border-white/8 focus-within:border-violet-500/40 focus-within:bg-violet-500/4"
              : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-violet-400"
            }`}>
            <Search className={`absolute left-3.5 w-4 h-4 shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 pl-10 pr-9 py-2.5 bg-transparent text-sm outline-none"
              style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 w-5 h-5 flex items-center justify-center rounded-full ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-xl ${isDark ? "bg-white/4" : "bg-gray-100"}`}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === tab.id
                    ? "text-white shadow-sm"
                    : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                  }`}
                style={activeTab === tab.id ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isDark ? "bg-white/4" : "bg-gray-100"}`}>
                {activeTab === "groups"
                  ? <Users size={22} className={isDark ? "text-gray-600" : "text-gray-300"} />
                  : <Search size={22} className={isDark ? "text-gray-600" : "text-gray-300"} />
                }
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : activeTab === "groups" ? "No groups yet"
                  : activeTab === "users" ? "No conversations yet"
                  : "No conversations"}
              </p>
              {activeTab === "groups" && !searchQuery && (
                <button
                  onClick={onCreateGroup}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-400"
                >
                  <Plus size={13} /> Create a group
                </button>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected =
                selectedChat?.id === contact.id ||
                (contact.type === "group" && selectedChat?.groupId === contact.groupId);
              const contactOnline = contact.type === "user" && onlineUsers.has(contact.id);

              return (
                <div
                  key={contact.type === "group" ? contact.groupId : contact.id}
                  onClick={() => setSelectedChat(contact)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 relative group ${isSelected
                      ? isDark ? "bg-violet-500/15" : "bg-violet-50"
                      : isDark ? "hover:bg-white/4" : "hover:bg-gray-50/80"
                    }`}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-9 rounded-full bg-linear-to-b from-violet-500 to-purple-600" />
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {contact.avatar && contact.avatar.startsWith("http") ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className={`w-12 h-12 rounded-full object-cover shadow-md ring-2 transition-all ${isSelected ? "ring-violet-500/40" : "ring-transparent"}`}
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ring-2 transition-all font-bold text-white text-lg ${isSelected
                          ? "bg-linear-to-br from-violet-500 via-purple-500 to-pink-500 ring-violet-500/40"
                          : "bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 ring-transparent"
                        }`}>
                        {contact.type === "group"
                          ? <Users size={20} />
                          : contact.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {contact.type === "user" && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${contactOnline ? "bg-emerald-500" : "bg-gray-400"} ${isDark ? "border-gray-950" : "border-white"}`} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className={`font-semibold text-sm truncate ${isSelected
                          ? isDark ? "text-violet-300" : "text-violet-700"
                          : isDark ? "text-gray-100" : "text-gray-800"
                        }`}>
                        {contact.name}
                      </h3>
                      <span className={`text-[10px] font-medium shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                        {contact.lastMessageAt
                          ? new Date(contact.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {contact.lastMessage || (contact.type === "group" ? `${contact.memberCount} members` : "Start a conversation")}
                    </p>
                  </div>

                  {contact.unread > 0 && (
                    <div className="shrink-0 min-w-5 h-5 px-1.5 bg-linear-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                      {contact.unread}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══ Chat Area ════════════════════════════════════════════ */}
      <div className={`${showChatOnMobile ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0 h-full relative`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b shrink-0 backdrop-blur-xl ${isDark ? "bg-gray-950/90 border-white/6" : "bg-white/98 border-gray-200/70"}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className={`md:hidden w-8 h-8 rounded-xl flex items-center justify-center mr-1 shrink-0 ${isDark ? "text-gray-400 hover:text-white bg-white/4" : "text-gray-500 bg-gray-100"}`}
                >
                  <ArrowLeft size={17} strokeWidth={2} />
                </button>

                <button onClick={() => setShowInfo(!showInfo)} className="relative shrink-0">
                  {selectedChat.avatar && selectedChat.avatar.startsWith("http") ? (
                    <img src={selectedChat.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-2 ring-violet-500/30 text-white font-bold text-lg">
                      {selectedChat.type === "group" ? <Users size={18} /> : selectedChat.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {selectedChat.type === "user" && (
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${onlineUsers.has(selectedChat.id) ? "bg-emerald-500" : "bg-gray-400"} ${isDark ? "border-gray-950" : "border-white"}`} />
                  )}
                </button>

                <button onClick={() => setShowInfo(!showInfo)} className="text-left">
                  <h2 className={`font-bold text-sm leading-none ${isDark ? "text-white" : "text-gray-900"}`}>{selectedChat.name}</h2>
                  <p className={`text-xs font-medium mt-1 ${
                    selectedChat.type === "group" ? isDark ? "text-gray-400" : "text-gray-500"
                    : isTyping ? "text-violet-400"
                    : onlineUsers.has(selectedChat.id) ? "text-emerald-500"
                    : isDark ? "text-gray-500" : "text-gray-400"
                  }`}>
                    {selectedChat.type === "group"
                      ? `${selectedChat.memberCount || selectedChat.members?.length || 0} members`
                      : isTyping ? "typing..."
                      : onlineUsers.has(selectedChat.id) ? "● Active now"
                      : "Offline"}
                  </p>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${isDark ? "text-gray-400 hover:bg-white/8 hover:text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  <Phone size={15} strokeWidth={2} />
                </button>
                <button onClick={() => setIsVideoCall(true)} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${isDark ? "text-gray-400 hover:bg-white/8 hover:text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  <Video size={15} strokeWidth={2} />
                </button>
                <button onClick={() => setShowInfo(!showInfo)} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${showInfo ? isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-50 text-violet-600" : isDark ? "text-gray-400 hover:bg-white/8 hover:text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  <MoreVertical size={15} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Info Panel */}
            {showInfo && (
              <div className={`border-b px-5 py-4 shrink-0 ${isDark ? "bg-gray-900/70 border-white/6" : "bg-gray-50/80 border-gray-100"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-violet-500/30 text-white font-bold text-2xl">
                    {selectedChat.type === "group" ? <Users size={24} /> : selectedChat.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{selectedChat.name}</h3>
                    {selectedChat.type === "user" && (
                      <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>@{selectedChat.username}</p>
                    )}
                    {selectedChat.type === "group" && (
                      <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{selectedChat.memberCount} members</p>
                    )}
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? "bg-white/4 text-gray-400 hover:bg-white/8" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
                      <Star size={14} /><span>Pin</span>
                    </button>
                    <button className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? "bg-white/4 text-gray-400 hover:bg-white/8" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
                      <VolumeX size={14} /><span>Mute</span>
                    </button>
                    <button className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                      <Trash2 size={14} /><span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video call overlay */}
            {isVideoCall && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 z-50 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="relative mx-auto mb-6 w-28 h-28 sm:w-32 sm:h-32">
                    <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                    <div className="relative w-full h-full rounded-full bg-linear-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
                      {selectedChat.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedChat.name}</h2>
                  <p className="text-gray-400 text-sm mb-8">Calling...</p>
                  <div className="flex gap-5 justify-center">
                    <button className="w-14 h-14 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-emerald-500/30">
                      <Video size={20} className="text-white" />
                    </button>
                    <button onClick={() => setIsVideoCall(false)} className="w-14 h-14 bg-linear-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-red-500/30">
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              className={`flex-1 overflow-y-auto px-3 sm:px-5 py-4 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
              style={{
                backgroundImage: isDark
                  ? "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.05) 0%, transparent 50%)"
                  : "radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(244,114,182,0.08) 0%, transparent 50%)",
              }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={28} className="animate-spin text-violet-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-white/4" : "bg-white shadow-sm"}`}>
                    <MessageSquare size={28} className="text-violet-400" strokeWidth={1.5} />
                  </div>
                  <p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`flex-1 h-px ${isDark ? "bg-white/6" : "bg-gray-200"}`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? "bg-white/4 text-gray-600" : "bg-white text-gray-400 shadow-sm"}`}>Today</span>
                    <div className={`flex-1 h-px ${isDark ? "bg-white/6" : "bg-gray-200"}`} />
                  </div>

                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex mb-4 ${msg.sender === "me" ? "justify-end" : "justify-start"} group`}>
                      {msg.sender === "them" && (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-sm shrink-0 mr-2.5 self-end shadow-md text-white font-bold overflow-hidden">
                          {msg.senderAvatar && msg.senderAvatar.startsWith("http") ? (
                            <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.senderName?.charAt(0).toUpperCase()
                          )}
                        </div>
                      )}

                      <div className="max-w-[80%] sm:max-w-xs lg:max-w-md">
                        {msg.sender === "them" && selectedChat.type === "group" && (
                          <p className={`text-[10px] font-semibold mb-1 ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {msg.senderName}
                          </p>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${msg.sender === "me"
                              ? "text-white rounded-br-sm"
                              : `${isDark ? "bg-gray-800/90 text-gray-100 border border-white/6" : "bg-white text-gray-800 border border-gray-100 shadow-sm"} rounded-bl-sm`
                            }`}
                          style={msg.sender === "me" ? { background: "linear-gradient(135deg, #7c3aed, #9333ea)" } : {}}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={`flex items-center gap-1 mt-1.5 ${msg.sender === "me" ? "justify-end" : ""}`}>
                            <p className={`text-[10px] font-medium ${msg.sender === "me" ? "text-purple-200" : isDark ? "text-gray-600" : "text-gray-400"}`}>
                              {msg.time}
                            </p>
                            {msg.sender === "me" && (
                              <span className="text-purple-200">
                                {msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex mb-4 justify-start">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shrink-0 mr-2.5 self-end shadow-md text-white font-bold">
                        {selectedChat.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDark ? "bg-gray-800/90 border border-white/6" : "bg-white border border-gray-100 shadow-sm"}`}>
                        <div className="flex gap-1 items-center h-5">
                          <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-500" : "bg-gray-300"}`} style={{ animationDelay: "0ms" }} />
                          <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-500" : "bg-gray-300"}`} style={{ animationDelay: "150ms" }} />
                          <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-500" : "bg-gray-300"}`} style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div className={`px-3 sm:px-4 py-3 border-t shrink-0 ${isDark ? "bg-gray-950/90 border-white/6" : "bg-white/98 border-gray-200/70"}`}>
              <div className={`flex items-center gap-2 p-2 rounded-2xl border transition-all duration-200 focus-within:border-violet-500/40 ${isDark ? "bg-white/4 border-white/8 focus-within:bg-violet-500/4" : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:shadow-md"}`}>
                <button className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-xl transition-all hover:scale-110 shrink-0 ${isDark ? "text-gray-600 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  <Paperclip size={16} strokeWidth={2} />
                </button>
                <button className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-xl transition-all hover:scale-110 shrink-0 ${isDark ? "text-gray-600 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  <Image size={16} strokeWidth={2} />
                </button>

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder={`Message ${selectedChat.type === "group" ? "#" + selectedChat.name : selectedChat.name}...`}
                  className="flex-1 bg-transparent text-sm outline-none py-1.5 px-1"
                  style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
                />

                <button className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 shrink-0 ${isDark ? "text-gray-600 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  <Smile size={16} strokeWidth={2} />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!message?.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-md shrink-0 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
                >
                  <Send size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className={`flex-1 items-center justify-center ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"} hidden md:flex`}
            style={{
              backgroundImage: isDark
                ? "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 60%)"
                : "radial-gradient(ellipse at center, rgba(167,139,250,0.12) 0%, transparent 60%)",
            }}
          >
            <div className="text-center max-w-xs px-4">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl"
                style={{ background: isDark ? "rgba(139,92,246,0.1)" : "rgba(167,139,250,0.15)", border: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)"}` }}
              >
                <MessageSquare size={38} className="text-violet-400" strokeWidth={1.5} />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Your messages</h2>
              <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Select a conversation or start a new one
              </p>
              <button
                onClick={onCreateGroup}
                className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
              >
                <Users size={15} /> New Group Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
