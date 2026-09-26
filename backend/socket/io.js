// Holds the Socket.io server so controllers and services can emit events
// without importing socket.js (which would create an import cycle).
let io = null;

export const setIO = (instance) => {
  io = instance;
};

export const getIO = () => io;

// userId -> Set<socketId>: a user is online while any of their tabs is connected
export const onlineUsers = new Map();

export const isOnline = (userId) => onlineUsers.has(String(userId));

// Users who hide their activity: never reported as online to anyone
export const hiddenPresence = new Set();
