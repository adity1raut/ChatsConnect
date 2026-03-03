import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  // Track which chat is currently "open" so we don't notify for it
  const activeChatRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Called by ChatPage when a conversation is selected/deselected
  const setActiveChat = useCallback((chatId) => {
    activeChatRef.current = chatId;
    // Mark notifications for this chat as read
    if (chatId) {
      setNotifications((prev) =>
        prev.map((n) => (n.chatId === chatId ? { ...n, read: true } : n))
      );
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Listen for new DM messages
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = ({ message, conversationId }) => {
      // Don't notify if the message is from ourselves
      if (message.senderId._id === user._id) return;

      const chatId = conversationId?.toString();
      // Don't notify if user is currently viewing this chat
      if (activeChatRef.current === chatId) return;

      setNotifications((prev) => [
        {
          id: `msg-${message._id}`,
          type: "message",
          chatId,
          from: message.senderId,
          content: message.content,
          time: new Date(message.createdAt),
          read: false,
        },
        ...prev,
      ]);
    };

    const handleNewGroupMessage = ({ message, groupId }) => {
      if (message.senderId._id === user._id) return;

      const chatId = `group-${groupId}`;
      if (activeChatRef.current === chatId) return;

      setNotifications((prev) => [
        {
          id: `gmsg-${message._id}`,
          type: "groupMessage",
          chatId,
          groupId,
          from: message.senderId,
          content: message.content,
          time: new Date(message.createdAt),
          read: false,
        },
        ...prev,
      ]);
    };

    const handleFriendRequest = ({ request }) => {
      setNotifications((prev) => [
        {
          id: `fr-${request._id}`,
          type: "friendRequest",
          requestId: request._id,
          from: request.sender,
          content: "sent you a friend request",
          time: new Date(request.createdAt || Date.now()),
          read: false,
        },
        ...prev,
      ]);
    };

    const handleFriendRequestAccepted = ({ acceptedBy }) => {
      setNotifications((prev) => [
        {
          id: `fra-${Date.now()}`,
          type: "friendAccepted",
          from: acceptedBy,
          content: "accepted your friend request",
          time: new Date(),
          read: false,
        },
        ...prev,
      ]);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("friendRequest", handleFriendRequest);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("friendRequest", handleFriendRequest);
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
    };
  }, [socket, user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, setActiveChat, markAllRead, dismiss }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
