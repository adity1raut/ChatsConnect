import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "../config/axiosInstance.js";
import { useAuth } from "./AuthContext";
import { AI_API_URL } from "../config/api.js";

const AIContext = createContext(null);

const readLocal = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable — setting applies for this session
  }
};

export function AIProvider({ children }) {
  const { user } = useAuth();

  const [aiEnabled, setAiEnabledState] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(() => readLocal("autoTranslate", "false") === "true");
  const [preferredLanguage, setPreferredLanguage] = useState(() => readLocal("preferredLanguage", "English"));
  const [smartReplies, setSmartReplies] = useState([]);

  // Personal assistant
  const [assistant, setAssistant] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Per-user AI state from the server ────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.allSettled([
      axios.get(`${AI_API_URL}/status`),
      axios.get(`${AI_API_URL}/assistant`),
      axios.get(`${AI_API_URL}/chat/history`),
    ]).then(([status, settings, history]) => {
      if (cancelled) return;
      if (status.status === "fulfilled") setAiEnabledState(status.value.data.aiEnabled ?? false);
      if (settings.status === "fulfilled") setAssistant(settings.value.data.assistant);
      if (history.status === "fulfilled") setChatHistory(history.value.data.messages ?? []);
    });
    return () => {
      cancelled = true;
      setAiEnabledState(false);
      setAssistant(null);
      setChatHistory([]);
      setSmartReplies([]);
    };
  }, [user]);

  // ── Toggle AI suggestions (persisted on the server) ──────────────
  const setAiEnabled = useCallback(async () => {
    try {
      const { data } = await axios.put(`${AI_API_URL}/toggle`, {});
      setAiEnabledState(data.aiEnabled);
      return data.aiEnabled;
    } catch {
      // Leave the switch as-is: the server did not change, so the UI must not either
      setError("Couldn't update the AI setting. Please try again.");
      return null;
    }
  }, []);

  const handleSetAutoTranslate = useCallback((val) => {
    setAutoTranslate(val);
    writeLocal("autoTranslate", String(val));
  }, []);

  const handleSetPreferredLanguage = useCallback((lang) => {
    setPreferredLanguage(lang);
    writeLocal("preferredLanguage", lang);
  }, []);

  // ── Smart replies & translation ──────────────────────────────────
  const fetchSmartReplies = useCallback(
    async (messages) => {
      if (!aiEnabled || !messages?.length) return;
      try {
        const { data } = await axios.post(`${AI_API_URL}/smart-reply`, { messages });
        setSmartReplies(data.replies || []);
      } catch {
        setSmartReplies([]);
      }
    },
    [aiEnabled],
  );

  const clearSmartReplies = useCallback(() => setSmartReplies([]), []);

  const translateMessage = useCallback(async (text, targetLanguage) => {
    try {
      const { data } = await axios.post(`${AI_API_URL}/translate`, {
        text,
        target_language: targetLanguage,
        source_language: "auto",
      });
      return data.translated_text;
    } catch {
      return null;
    }
  }, []);

  // ── Personal assistant ────────────────────────────────────────────
  const updateAssistant = useCallback(async (changes) => {
    const { data } = await axios.put(`${AI_API_URL}/assistant`, changes);
    setAssistant(data.assistant);
    return data.assistant;
  }, []);

  const sendAIMessage = useCallback(async (message) => {
    const text = message.trim();
    if (!text) return null;
    setIsLoading(true);
    setError(null);
    // Show the question right away; the server's copy replaces it
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: text, createdAt: new Date().toISOString(), pending: true },
    ]);
    try {
      const { data } = await axios.post(`${AI_API_URL}/chat`, { message: text });
      setChatHistory(data.messages ?? []);
      return data.reply;
    } catch (err) {
      setChatHistory((prev) => prev.filter((m) => !m.pending));
      setError(err.response?.data?.message || "The assistant is unavailable right now");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(async () => {
    setChatHistory([]);
    setError(null);
    await axios.delete(`${AI_API_URL}/chat/history`).catch(() => {});
  }, []);

  return (
    <AIContext.Provider
      value={{
        aiEnabled,
        setAiEnabled,
        autoTranslate,
        setAutoTranslate: handleSetAutoTranslate,
        preferredLanguage,
        setPreferredLanguage: handleSetPreferredLanguage,
        smartReplies,
        setSmartReplies,
        fetchSmartReplies,
        clearSmartReplies,
        translateMessage,
        assistant,
        updateAssistant,
        chatHistory,
        sendAIMessage,
        clearChat,
        isLoading,
        error,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used inside AIProvider");
  return ctx;
}
