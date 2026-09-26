import { Bell, Bot, Home, MessageSquare, Search, User } from "lucide-react";

// Primary destinations, shared by the desktop sidebar and the mobile bottom bar
export const NAV_ITEMS = [
  { id: "home", label: "Home", shortLabel: "Home", icon: Home, path: "/dashboard" },
  { id: "search", label: "Search", shortLabel: "Search", icon: Search, path: "/search" },
  { id: "messages", label: "Messages", shortLabel: "Chats", icon: MessageSquare, path: "/chat" },
  { id: "assistant", label: "Assistant", shortLabel: "AI", icon: Bot, path: "/assistant" },
  {
    id: "notifications",
    label: "Notifications",
    shortLabel: "Alerts",
    icon: Bell,
    path: "/notifications",
    showUnread: true,
  },
  { id: "profile", label: "Profile", shortLabel: "Me", icon: User, path: "/profile", exact: true },
];

// "/profile/:id" is someone else's profile — only highlight "Profile" on "/profile"
export const isNavActive = (item, pathname) =>
  item.exact
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(`${item.path}/`);
