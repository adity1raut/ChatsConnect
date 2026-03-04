---
sidebar_position: 3
---

# Client (Frontend)

The client application provides a responsive, interactive user interface for accessing the chat and group video communication features.

## Core Technologies

- **React**: Component-based UI rendering.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for rapid and modern styling.
- **Socket.IO Client**: Maintaining the WebSocket connection for real-time updates.
- **WebRTC API**: Native browser API for video and audio streaming.

## Application Structure

The client is typically structured into several domain-specific modules:

- **Auth**: Login, Registration, and JWT token management.
- **Chat**: Chat list, message timeline, message input (with AI smart-reply suggestions), and group creation.
- **Video**: Video call grid, controls (mute, disable camera, screen share), and WebRTC peer management.
- **Dashboard**: Analytics, sentiment trends, and automatic summaries of conversations.
- **Store / Context**: React Context or Redux for global state (e.g., currently active user, active chat room).

## WebRTC implementation

The WebRTC implementation inside the React client involves managing device media access and peer connections.

1. **`getUserMedia()`**: Secures access to the user's camera and microphone.
2. **`RTCPeerConnection`**: Instantiated for every participant in a group call (Mesh Topology) or to a central server if using an SFU.
3. **Signaling**: Coordinates with the backend via WebSocket to negotiate connections before local media tracks are attached to remote `<video>` elements.

## AI Enhancements in the UI

The client leverages features powered by the backend AI Microservice:

- **Smart Replies**: Inline suggestions displayed above the chat input box.
- **Message Rewriting**: Highlights a message and offers a tone-adjusted rewrite (e.g., making it sound more professional).
- **Meeting Summaries**: A side-panel or post-call view that fetches AI-generated action items and summaries based on the chat or call metadata.

## Styling & Responsiveness

The application is heavily styled using Tailwind CSS, focusing on a **modern glassmorphic aesthetic**.
All interfaces—especially the chat view and video grid—are completely responsive across mobile phones, tablets, and desktop displays.
