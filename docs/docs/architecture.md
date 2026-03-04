---
sidebar_position: 1
---

# Architecture Overview

This document provides a high-level overview of the architecture of the AI-Powered Real-Time Chat & Group Video Communication Application.

The application follows a **microservices-based and event-driven architecture** to ensure low latency, high scalability, and secure communication.

## High-Level Architecture

The system is split into four primary components:

1. **Client (Frontend)**
2. **Backend API & Real-Time Server**
3. **AI Microservice**
4. **Database Layer**

```mermaid
graph TD
    Client[Client (React / Vite)] -->|REST API / HTTP| Backend[Backend API (Node.js/Express)]
    Client -->|WebSocket| Realtime[Realtime Server (Socket.IO)]
    Client -->|WebRTC| WebRTC[WebRTC Signaling]
    
    Backend --> Realtime
    Backend -->|REST / HTTP| AI[AI Microservice (Python)]
    
    Backend -->|Read/Write| DB[(Database Layer)]
    Realtime -->|Presence/Cache| DB
```

## 1. Client (Frontend)

The client is a single-page application built with modern web technologies that provide a responsive and interactive user interface.

- **Stack**: React, Vite, Tailwind CSS.
- **Responsibilities**:
  - User authentication and profile management interfaces.
  - Rendering chat interfaces and group video windows.
  - Maintaining Real-time WebSocket connections (Socket.IO client).
  - Managing Peer-to-Peer connections for video calls (WebRTC).

## 2. Backend API & Real-Time Server

The backend serves as the core orchestrator of the application, managing business logic, user data, state, and real-time events.

- **Stack**: Node.js, Express, Socket.IO.
- **Responsibilities**:
  - Exposing RESTful HTTP endpoints for user management, group creation, and messaging history.
  - Managing WebSocket connections via Socket.IO for real-time message broadcasting.
  - Handling WebRTC signaling to connect users for video calls.
  - Implementing security (JWT authentication, role-based access).

## 3. AI Microservice

A dedicated microservice handles computationally expensive AI tasks. It processes requests asynchronously from the main backend to prevent blocking the event loop.

- **Stack**: Python (`server/server.py`).
- **Responsibilities**:
  - Real-time sentiment analysis of chat messages.
  - Generating smart reply suggestions.
  - Conversation summarization.
  - AI-based moderation (detecting toxic or abusive messages).
  - Natural Language Processing.

## 4. Database Layer

The application utilizes multiple data stores to optimize for different types of data access patterns.

- **PostgreSQL**: Relational database used for structured data mapping, such as user profiles, groups, and relationships.
- **MongoDB**: NoSQL document store optimized for high-volume, unstructured chat messages and metadata.
- **Redis**: In-memory data structures store utilized for caching, managing online/offline user presence, and pub/sub messaging across backend instances.

## Core Features Flow

### Real-Time Chat Processing

1. User sends a message via the Client.
2. Message is transmitted via WebSocket to the Real-Time Server.
3. Backend optionally forwards message to AI Microservice for moderation and sentiment analysis.
4. If approved, the message is saved to MongoDB.
5. The message is broadcasted to all connected clients in the room via Socket.IO.

### Group Video Calling

1. User joins a video room.
2. The Client establishes WebRTC peer connections with existing participants.
3. The Real-Time Server acts as a Signaling Server, exchanging SDP offers/answers and ICE candidates.
4. Media tracks (audio/video) are transmitted Peer-to-Pee between clients.
