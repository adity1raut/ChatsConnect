---
sidebar_position: 2
---

# Backend API & Real-Time Server

The backend acts as the central hub of the application, managing user data, business logic, and real-time state. It is built using **Node.js** and **Express**, with **Socket.IO** handling real-time WebSocket communication.

## Core Responsibilities

- **Authentication & Authorization**: Utilizes JSON Web Tokens (JWT) for secure user sessions and role-based access control (RBAC).
- **Group Management**: Handles creation, updating, and deletion of chat groups and video rooms.
- **Message Persistence**: Provides REST APIs to fetch chat history, group metadata, and user information.
- **Real-Time Broadcasting**: Manages WebSocket connections for instant chat message delivery.
- **Video Call Signaling**: Facilitates WebRTC connections by signaling session descriptions (SDPs) and ICE candidates between peers.

## Tech Stack Overview

- **Framework**: Express.js
- **Real-Time**: Socket.IO
- **Database Access**: Mongoose (for MongoDB), Sequelize/Prisma (for PostgreSQL)
- **Validation**: Joi / Zod (for request payload validation)
- **Caching**: Redis (for user status and session caching)

## Real-Time Architecture

To maintain low-latency communication, the Real-Time Server operates via WebSocket protocols independently of standard REST HTTP calls where necessary.

### Socket.IO Namespaces & Rooms
The application uses the concept of Socket.IO **Rooms** to isolate websocket broadcasts.
1. When a user creates/joins a group, their active WebSocket connection is added to the corresponding `room_id`.
2. Any message emitted to that `room_id` is only shared with active members of that group.

### WebRTC Signaling
For group video calling, the backend serves as a signaling server.
- **`offer`**: A user initiates a call to a peer.
- **`answer`**: The peer responds with their capabilities.
- **`ice-candidate`**: Peers share network routing information to establish a direct Peer-to-Peer connection.

## Integration with AI Microservice
When a user submits a chat message, the backend may asynchronously delegate requests to the AI Python microservice via HTTP to avoid blocking the main Node.js event thread.

1. **Moderation**: Checking if a message is abusive before persisting or broadcasting.
2. **Sentiment Analysis**: Passing the stream of messages to attach sentiment scores.
