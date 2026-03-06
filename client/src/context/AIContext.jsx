import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { AI_API_URL } from "../config/api.js";

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("authToken")}`,
  });

  const fetchSmartReplies = useCallback(async (messages) => {
    if (!aiEnabled || !messages?.length) return;
    try {
      const { data } = await axios.post(
        `${AI_API_URL}/smart-reply`,
        { messages },
        { headers: authHeader() }
      );
      setSmartReplies(data.replies || []);
    } catch {
      setSmartReplies([]);
    }
  }, [aiEnabled]);

  const clearSmartReplies = useCallback(() => setSmartReplies([]), []);

  const sendAIMessage = useCallback(async (message) => {
    if (!message.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${AI_API_URL}/chat`,
        { message, history: chatHistory },
        { headers: authHeader() }
      );
      setChatHistory(data.history || []);
      return data.reply;
    } catch (err) {
      const msg = err.response?.data?.message || "AI service unavailable";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory]);

  const summarizeMessages = useCallback(async (messages) => {
    try {
      const { data } = await axios.post(
        `${AI_API_URL}/summarize`,
        { messages },
        { headers: authHeader() }
      );
      return data.summary;
    } catch {
      return null;
    }
  }, []);

  const translateMessage = useCallback(async (text, targetLanguage) => {
    try {
      const { data } = await axios.post(
        `${AI_API_URL}/translate`,
        { text, target_language: targetLanguage, source_language: "auto" },
        { headers: authHeader() }
      );
      return data.translated_text;
    } catch {
      return null;
    }
  }, []);

  const analyzeSentiment = useCallback(async (text) => {
    try {
      const { data } = await axios.post(
        `${AI_API_URL}/sentiment`,
        { text },
        { headers: authHeader() }
      );
      return data;
    } catch {
      return null;
    }
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
    setError(null);
  }, []);

  return (
    <AIContext.Provider value={{
      aiEnabled, setAiEnabled,
      smartReplies, fetchSmartReplies, clearSmartReplies,
      chatHistory, sendAIMessage, clearChat,
      summarizeMessages, translateMessage, analyzeSentiment,
      isLoading, error,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used inside AIProvider");
  return ctx;
}
