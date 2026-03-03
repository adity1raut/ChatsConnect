import React, { useState } from "react";
import {
  Send, Phone, Video, MoreVertical, Search, MessageSquare,
  Image, Paperclip, Smile, X, Bot, Users, Mic, ArrowLeft,
  Star, Pin, Volume2, VolumeX, Trash2, ChevronDown, Check, CheckCheck,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";

/* ──────────────────────────────────────────────────────── */

const MESSAGE_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉"];

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
  aiEnabled,
  handleSendMessage,
}) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [pinnedAll, setPinnedAll] = useState(false);

  /* filter contacts by active tab + search query */
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

  const messages = selectedChat
    ? [
      { id: 1, sender: "them", text: "Hey! How's the project going?", time: "10:30 AM", status: "read" },
      { id: 2, sender: "me", text: "Going well! Just finished the dashboard design.", time: "10:32 AM", status: "read" },
      { id: 3, sender: "ai", text: "💡 AI Suggestion: You might want to mention the new features you added", time: "10:32 AM" },
      { id: 4, sender: "them", text: "That's great! Can you share a preview?", time: "10:33 AM", status: "read" },
      { id: 5, sender: "me", text: "Sure, I'll send it over in a few minutes.", time: "10:35 AM", status: "sent" },
    ]
    : [];

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
          w-full md:w-[300px] lg:w-80 flex-shrink-0
          ${isDark
            ? "bg-gray-950/90 border-white/[0.06]"
            : "bg-white/98 border-gray-200/70"
          }
        `}
      >
        {/* Top */}
        <div className={`px-4 pt-5 pb-3 border-b flex-shrink-0 ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Messages
            </h1>
            <div className="flex items-center gap-1.5">
              <button className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}>
                <Users size={14} strokeWidth={2} />
              </button>
              <button className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}>
                <Pin size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className={`relative flex items-center rounded-xl border transition-all duration-200 mb-3 ${isDark
              ? "bg-white/[0.04] border-white/8 focus-within:border-violet-500/40 focus-within:bg-violet-500/[0.04]"
              : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-violet-400"
            }`}>
            <Search className={`absolute left-3.5 w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
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
          <div className={`flex gap-1 p-1 rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-gray-100"}`}>
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
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isDark ? "bg-white/[0.04]" : "bg-gray-100"}`}>
                <Search size={22} className={isDark ? "text-gray-600" : "text-gray-300"} />
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {searchQuery ? `No results for "${searchQuery}"` : "No conversations"}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={`mt-2 text-xs font-semibold ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedChat?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedChat(contact)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 relative group ${isSelected
                      ? isDark ? "bg-violet-500/15" : "bg-violet-50"
                      : isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50/80"
                    }`}
                >
                  {/* Selected bar */}
                  {isSelected && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-9 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md ring-2 transition-all ${isSelected
                        ? "bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 ring-violet-500/40"
                        : "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 ring-transparent"
                      }`}>
                      {contact.avatar}
                    </div>
                    {contact.type === "user" && (
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${contact.status === "online" ? "bg-emerald-500" : contact.status === "away" ? "bg-amber-400" : "bg-gray-400"
                          } ${isDark ? "border-gray-950" : "border-white"}`}
                      />
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
                      <span className={`text-[10px] font-medium flex-shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                        {contact.time}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {contact.lastMessage}
                    </p>
                  </div>

                  {/* Unread */}
                  {contact.unread > 0 && (
                    <div className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
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
      <div className={`${showChatOnMobile ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0 h-full`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b flex-shrink-0 backdrop-blur-xl ${isDark ? "bg-gray-950/90 border-white/[0.06]" : "bg-white/98 border-gray-200/70"
              }`}>
              <div className="flex items-center gap-3">
                {/* Back — mobile */}
                <button
                  onClick={() => { setSelectedChat(null); setShowInfo(false); }}
                  className={`md:hidden w-8 h-8 rounded-xl flex items-center justify-center mr-1 flex-shrink-0 ${isDark ? "text-gray-400 hover:text-white bg-white/[0.04]" : "text-gray-500 bg-gray-100"}`}
                >
                  <ArrowLeft size={17} strokeWidth={2} />
                </button>

                {/* Avatar */}
                <button onClick={() => setShowInfo(!showInfo)} className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-md ring-2 ring-violet-500/30">
                    {selectedChat.avatar}
                  </div>
                  {selectedChat.type === "user" && (
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${selectedChat.status === "online" ? "bg-emerald-500" : selectedChat.status === "away" ? "bg-amber-400" : "bg-gray-400"} ${isDark ? "border-gray-950" : "border-white"}`} />
                  )}
                </button>

                {/* Name + status */}
                <button onClick={() => setShowInfo(!showInfo)} className="text-left">
                  <h2 className={`font-bold text-sm leading-none ${isDark ? "text-white" : "text-gray-900"}`}>{selectedChat.name}</h2>
                  <p className={`text-xs font-medium mt-1 ${selectedChat.status === "online" ? "text-emerald-500" : isDark ? "text-gray-500" : "text-gray-400"
                    }`}>
                    {selectedChat.type === "group" ? `${selectedChat.members || "8"} members` :
                      selectedChat.status === "online" ? "● Active now" :
                        selectedChat.status === "away" ? "● Away" : "Offline"}
                  </p>
                </button>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-1">
                {aiEnabled && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Bot size={12} strokeWidth={2.5} />
                    AI
                  </div>
                )}
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

            {/* Info Panel — slides open */}
            {showInfo && (
              <div className={`border-b px-5 py-4 flex-shrink-0 ${isDark ? "bg-gray-900/70 border-white/[0.06]" : "bg-gray-50/80 border-gray-100"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg ring-2 ring-violet-500/30">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{selectedChat.name}</h3>
                    {selectedChat.type === "user" && <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>@{selectedChat.name.toLowerCase().replace(" ", "")}</p>}
                    <p className={`text-xs mt-1 flex items-center gap-1.5 ${selectedChat.status === "online" ? "text-emerald-500" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedChat.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                      {selectedChat.status === "online" ? "Active now" : selectedChat.status === "away" ? "Away" : "Offline"}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? "bg-white/[0.04] text-gray-400 hover:bg-white/8" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
                      <Star size={14} /><span>Pin</span>
                    </button>
                    <button className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? "bg-white/[0.04] text-gray-400 hover:bg-white/8" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
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
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl">
                      {selectedChat.avatar}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedChat.name}</h2>
                  <p className="text-gray-400 text-sm mb-8">Calling...</p>
                  <div className="flex gap-5 justify-center">
                    <button className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-emerald-500/30">
                      <Video size={20} className="text-white" />
                    </button>
                    <button onClick={() => setIsVideoCall(false)} className="w-14 h-14 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-red-500/30">
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
              {/* Date separator */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex-1 h-px ${isDark ? "bg-white/[0.06]" : "bg-gray-200"}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? "bg-white/[0.04] text-gray-600" : "bg-white text-gray-400 shadow-sm"}`}>Today</span>
                <div className={`flex-1 h-px ${isDark ? "bg-white/[0.06]" : "bg-gray-200"}`} />
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex mb-4 ${msg.sender === "me" ? "justify-end" : msg.sender === "ai" ? "justify-center" : "justify-start"} group`}>
                  {/* Other avatar */}
                  {msg.sender === "them" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-sm flex-shrink-0 mr-2.5 self-end shadow-md">
                      {selectedChat.avatar}
                    </div>
                  )}

                  {msg.sender === "ai" ? (
                    <div className={`flex items-center gap-2.5 max-w-[90%] sm:max-w-lg px-4 py-2.5 rounded-2xl text-sm border shadow-sm backdrop-blur-sm ${isDark ? "bg-violet-500/10 border-violet-500/25 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-700"
                      }`}>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={10} className="text-white" strokeWidth={2.5} />
                      </div>
                      <span className="italic text-xs sm:text-sm">{msg.text}</span>
                    </div>
                  ) : (
                    <div className={`max-w-[80%] sm:max-w-xs lg:max-w-md ${msg.sender === "me" ? "" : ""}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${msg.sender === "me"
                            ? "text-white rounded-br-sm"
                            : `${isDark ? "bg-gray-800/90 text-gray-100 border border-white/[0.06]" : "bg-white text-gray-800 border border-gray-100 shadow-sm"} rounded-bl-sm`
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
                  )}
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className={`px-3 sm:px-4 py-3 border-t flex-shrink-0 ${isDark ? "bg-gray-950/90 border-white/[0.06]" : "bg-white/98 border-gray-200/70"}`}>
              <div className={`flex items-center gap-2 p-2 rounded-2xl border transition-all duration-200 focus-within:border-violet-500/40 ${isDark ? "bg-white/[0.04] border-white/8 focus-within:bg-violet-500/[0.04]" : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:shadow-md"
                }`}>
                <button className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-xl transition-all hover:scale-110 flex-shrink-0 ${isDark ? "text-gray-600 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  <Paperclip size={16} strokeWidth={2} />
                </button>
                <button className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-xl transition-all hover:scale-110 flex-shrink-0 ${isDark ? "text-gray-600 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  <Image size={16} strokeWidth={2} />
                </button>

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm outline-none py-1.5 px-1"
                  style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
                />

                <button className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 flex-shrink-0 ${isDark ? "text-gray-600 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                  <Smile size={16} strokeWidth={2} />
                </button>
                {aiEnabled && (
                  <button className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 flex-shrink-0 ${isDark ? "text-violet-500 hover:bg-violet-500/15" : "text-violet-500 hover:bg-violet-50"}`}>
                    <Bot size={16} strokeWidth={2} />
                  </button>
                )}
                <button
                  onClick={handleSendMessage}
                  disabled={!message?.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-md flex-shrink-0 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
                >
                  <Send size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — desktop only */
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
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Select a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
