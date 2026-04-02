import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Trash2, Loader2, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAI } from "../../context/AIContext";

export default function AIPanel({ onClose }) {
  const { isDark } = useTheme();
  const { chatHistory, sendAIMessage, clearChat, isLoading, error } = useAI();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput("");
    await sendAIMessage(msg);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const bg = isDark
    ? "bg-gray-900 border-white/10"
    : "bg-white border-gray-200";
  const msgUser = isDark
    ? "bg-violet-600 text-white"
    : "bg-violet-500 text-white";
  const msgAI = isDark
    ? "bg-white/8 text-gray-200"
    : "bg-gray-100 text-gray-800";
  const inputBg = isDark
    ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-violet-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400";

  const displayMessages = chatHistory.filter((m) => m.role !== "system");

  return (
    <div
      className={`flex flex-col h-full border-l ${bg} transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              ChatBot
            </p>
            <p
              className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Powered by LangGraph
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {displayMessages.length > 0 && (
            <button
              onClick={clearChat}
              title="Clear chat"
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
            >
              <Trash2 size={15} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <Sparkles size={24} className="text-violet-500" />
            </div>
            <p
              className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Ask me anything!
            </p>
            <p
              className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}
            >
              I can help draft messages, summarise conversations, translate
              text, and more.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              {[
                "Summarise this chat",
                "Help me reply politely",
                "Translate to Spanish",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setInput(hint)}
                  className={`text-xs px-3 py-2 rounded-xl border text-left transition-colors ${
                    isDark
                      ? "border-white/8 text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      : "border-gray-200 text-gray-500 hover:bg-violet-50 hover:text-violet-600"
                  }`}
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? msgUser : msgAI
              } ${msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <Bot size={12} className="text-white" />
            </div>
            <div className={`px-3 py-2 rounded-2xl rounded-bl-sm ${msgAI}`}>
              <Loader2 size={14} className="animate-spin text-violet-500" />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center px-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={`px-3 pb-3 pt-2 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask ChatBot..."
            rows={1}
            className={`flex-1 resize-none px-3 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 max-h-28 ${inputBg}`}
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40 hover:opacity-90"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p
          className={`text-[10px] mt-1.5 text-center ${isDark ? "text-gray-700" : "text-gray-400"}`}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
