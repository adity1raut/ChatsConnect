import { Bell, Bot, Lock, MessageSquare, Users, Video } from "lucide-react";

// What ChatsConnect does — shared by the landing and About pages
export const FEATURES = [
  {
    icon: Lock,
    title: "End-to-end encrypted DMs",
    tag: "E2EE",
    desc: "Direct messages are encrypted on your device. Only you and the other person can read them — not even the server.",
  },
  {
    icon: Bot,
    title: "Your own AI assistant",
    tag: "AI",
    desc: "Name it, pick its personality and tone, give it instructions. It drafts messages and summarizes chats — powered by Claude.",
  },
  {
    icon: MessageSquare,
    title: "Real-time messaging",
    tag: "Realtime",
    desc: "Instant DMs and group chats with typing indicators, presence, Markdown formatting and one-click export.",
  },
  {
    icon: Video,
    title: "Voice & video calls",
    tag: "WebRTC",
    desc: "One-to-one and group calls with WebRTC, right from the chat.",
  },
  {
    icon: Users,
    title: "Groups",
    tag: "Groups",
    desc: "Create groups, add and remove members, and hand over admin when you leave.",
  },
  {
    icon: Bell,
    title: "Notifications that keep up",
    tag: "Alerts",
    desc: "Saved across devices, grouped per chat, with sound and desktop alerts you control.",
  },
];
