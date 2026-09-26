import {
  Bell,
  MessageCircle,
  PhoneMissed,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

const nameOf = (n) => n.actor?.name || "Someone";
const groupNameOf = (n) => n.groupId?.name || "a group";

// Encrypted DMs have no server-side preview
const messageBody = (n) => {
  const preview = n.body || "Sent you a message";
  return n.count > 1 ? `${n.count} new messages · ${preview}` : preview;
};

/** Human text + icon for a notification: { title, body, icon, category } */
export function describeNotification(n) {
  switch (n.type) {
    case "message":
      return {
        title: nameOf(n),
        body: n.body === null && n.meta?.encrypted ? "🔒 Encrypted message" : messageBody(n),
        icon: MessageCircle,
        category: "messages",
      };
    case "group_message":
      return {
        title: `${nameOf(n)} in ${groupNameOf(n)}`,
        body: messageBody(n),
        icon: Users,
        category: "messages",
      };
    case "friend_request":
      return {
        title: nameOf(n),
        body: "Sent you a friend request",
        icon: UserPlus,
        category: "social",
      };
    case "friend_accepted":
      return {
        title: nameOf(n),
        body: "Accepted your friend request",
        icon: UserCheck,
        category: "social",
      };
    case "group_added":
      return {
        title: groupNameOf(n),
        body: `${nameOf(n)} added you to the group`,
        icon: Users,
        category: "social",
      };
    case "missed_call":
      return {
        title: nameOf(n),
        body: `Missed ${n.meta?.callType === "audio" ? "voice" : "video"} call`,
        icon: PhoneMissed,
        category: "calls",
      };
    default:
      return { title: "Notification", body: n.body || "", icon: Bell, category: "other" };
  }
}

/** Where tapping a notification should take the user: { path, state } */
export function notificationTarget(n) {
  const actor = n.actor;
  switch (n.type) {
    case "message":
    case "missed_call":
      return actor
        ? {
            path: "/chat",
            state: {
              openChat: {
                id: actor._id,
                name: actor.name,
                username: actor.username,
                avatar: actor.avatar,
              },
            },
          }
        : { path: "/chat" };
    case "group_message":
    case "group_added":
      return n.groupId?._id
        ? { path: "/chat", state: { openGroup: { groupId: n.groupId._id } } }
        : { path: "/chat" };
    case "friend_request":
    case "friend_accepted":
      return actor ? { path: `/profile/${actor._id}` } : { path: "/notifications" };
    default:
      return { path: "/notifications" };
  }
}
