---
sidebar_position: 3
title: Requirements
---

# Requirements

## 1. Functional Requirements (FR)

Functional requirements describe **what the system must do**.

### FR-1: User Authentication

| ID | Requirement |
|---|---|
| FR-1.1 | The system shall allow a new user to register using email with OTP verification (2-step). |
| FR-1.2 | The system shall allow registered users to log in with email and password. |
| FR-1.3 | The system shall support GitHub OAuth for single-click sign-in. |
| FR-1.4 | The system shall issue a JWT access token (15-minute expiry) and a refresh token (7-day expiry). |
| FR-1.5 | The system shall allow users to log out, invalidating their session tokens. |
| FR-1.6 | The system shall allow users to change their account password. |

### FR-2: User Profile

| ID | Requirement |
|---|---|
| FR-2.1 | The system shall allow users to view and update their profile (name, bio, avatar). |
| FR-2.2 | The system shall allow users to upload a profile picture (stored via Cloudinary). |
| FR-2.3 | The system shall display real-time online/offline status for contacts. |
| FR-2.4 | The system shall allow users to search for other users by name or username. |
| FR-2.5 | The system shall allow users to delete their account permanently. |

### FR-3: Direct Messaging

| ID | Requirement |
|---|---|
| FR-3.1 | The system shall allow authenticated users to send text messages to other users in real time. |
| FR-3.2 | The system shall persist all messages in MongoDB and retrieve conversation history on load. |
| FR-3.3 | The system shall display typing indicators when the other party is composing a message. |
| FR-3.4 | The system shall show unread message counts via a notification badge. |

### FR-4: Group Messaging

| ID | Requirement |
|---|---|
| FR-4.1 | The system shall allow users to create named group chats and add members. |
| FR-4.2 | The system shall allow group admins to add or remove members. |
| FR-4.3 | The system shall broadcast messages to all online members of a group in real time. |
| FR-4.4 | The system shall persist group message history and allow retrieval on load. |

### FR-5: Video Calling

| ID | Requirement |
|---|---|
| FR-5.1 | The system shall allow a user to initiate a video/audio call with another user. |
| FR-5.2 | The system shall notify the target user of an incoming call via Socket.io event. |
| FR-5.3 | The system shall establish a peer-to-peer WebRTC connection upon call acceptance. |
| FR-5.4 | The system shall allow either party to end the call at any time. |

### FR-6: AI Features

| ID | Requirement |
|---|---|
| FR-6.1 | The system shall provide smart reply suggestions based on recent conversation context. |
| FR-6.2 | The system shall allow users to request a summary of a long conversation thread. |
| FR-6.3 | The system shall allow users to translate a message to a selected target language. |
| FR-6.4 | The system shall analyse and display the sentiment (positive/neutral/negative) of messages. |
| FR-6.5 | The system shall provide a general AI chat assistant panel within the interface. |

### FR-7: Notifications

| ID | Requirement |
|---|---|
| FR-7.1 | The system shall display real-time in-app notifications for new messages. |
| FR-7.2 | The system shall allow users to click a notification to deep-link to the relevant conversation. |
| FR-7.3 | The system shall reset unread counts when the user opens the relevant chat. |

---

## 2. Non-Functional Requirements (NFR)

Non-functional requirements describe **how well** the system performs.

### NFR-1: Performance

| ID | Requirement |
|---|---|
| NFR-1.1 | Message delivery latency shall be less than 200 ms on a local network. |
| NFR-1.2 | AI smart reply generation shall complete within 3 seconds under normal load. |
| NFR-1.3 | The frontend initial page load (First Contentful Paint) shall be under 2 seconds. |

### NFR-2: Security

| ID | Requirement |
|---|---|
| NFR-2.1 | All passwords shall be hashed using bcrypt with a minimum cost factor of 10. |
| NFR-2.2 | JWT tokens shall be stored in HttpOnly cookies to prevent XSS token theft. |
| NFR-2.3 | All API communication shall use HTTPS in production. |
| NFR-2.4 | OTP codes shall expire after 10 minutes and be single-use. |
| NFR-2.5 | The system shall validate and sanitise all user inputs to prevent injection attacks. |

### NFR-3: Reliability

| ID | Requirement |
|---|---|
| NFR-3.1 | The system shall maintain 99% uptime during the academic demonstration period. |
| NFR-3.2 | Socket.io shall automatically attempt reconnection on transient network failures. |
| NFR-3.3 | Message persistence shall ensure no data loss on server restart. |

### NFR-4: Scalability

| ID | Requirement |
|---|---|
| NFR-4.1 | The backend shall support at least 50 simultaneous WebSocket connections without degradation. |
| NFR-4.2 | The database schema shall support horizontal scaling via MongoDB Atlas sharding (future). |

### NFR-5: Usability

| ID | Requirement |
|---|---|
| NFR-5.1 | The UI shall be fully responsive and functional on screens from 375 px (mobile) to 1920 px (desktop). |
| NFR-5.2 | Colour scheme shall support both light mode and dark mode, respecting OS preference. |
| NFR-5.3 | All core user flows (register, login, send message) shall be completable in under 3 steps. |

### NFR-6: Maintainability

| ID | Requirement |
|---|---|
| NFR-6.1 | The codebase shall be modular, separating controllers, routes, models, and middleware. |
| NFR-6.2 | The AI microservice shall be independently deployable and versioned. |

---

## 3. Hardware and Software Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Development machine | 4 GB RAM, dual-core CPU | 8 GB RAM, quad-core CPU |
| Storage | 5 GB free disk space | 20 GB SSD |
| Network | Broadband internet (for MongoDB Atlas, Cloudinary) | Stable broadband ≥ 10 Mbps |
| Camera/Microphone | For video call testing | HD webcam + headset |

### Software Requirements

#### Development Environment

| Software | Version | Purpose |
|---|---|---|
| Node.js | v20+ (LTS) | Backend runtime |
| npm | v10+ | Package management |
| Python | v3.11+ | AI microservice runtime |
| Git | v2.x | Version control |
| MongoDB Compass (optional) | Latest | Local DB inspection |

#### Backend Dependencies

| Package | Version | Purpose |
|---|---|---|
| Express | v5.x | HTTP server framework |
| Mongoose | v8.x | MongoDB ODM |
| Socket.io | v4.x | WebSocket server |
| jsonwebtoken | v9.x | JWT signing/verification |
| bcryptjs | v2.x | Password hashing |
| Nodemailer | v6.x | Email / OTP delivery |
| Passport.js | v0.7.x | GitHub OAuth strategy |
| Cloudinary SDK | v2.x | Media uploads |

#### AI Microservice Dependencies

| Package | Version | Purpose |
|---|---|---|
| FastAPI | v0.111+ | Python API framework |
| Uvicorn | v0.29+ | ASGI server |
| Groq SDK | Latest | LLM API client (LLaMA-3) |
| httpx | v0.27+ | Async HTTP client |

#### Frontend Dependencies

| Package | Version | Purpose |
|---|---|---|
| React | v19.x | UI library |
| Vite | v7.x | Build tool / dev server |
| Tailwind CSS | v4.x | Utility-first CSS framework |
| React Router | v7.x | Client-side routing |
| Axios | v1.x | HTTP client |
| Socket.io-client | v4.x | WebSocket client |
| simple-peer | v9.x | WebRTC abstraction |

#### Cloud Services

| Service | Purpose |
|---|---|
| MongoDB Atlas | Managed MongoDB cluster (free tier) |
| Cloudinary | Image and media storage (free tier) |
| Vercel | Frontend and backend deployment (free tier) |
| Groq API | LLM inference for AI microservice (free tier) |
| Gmail SMTP | OTP email delivery |
| GitHub OAuth App | Social login |

---

## 4. User Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | New user | Register with my email and verify via OTP | My account is secure from the start |
| US-02 | Registered user | Log in with GitHub in one click | I don't need to remember a separate password |
| US-03 | User | Send a message to a friend instantly | We can have a real-time conversation |
| US-04 | User | See when my friend is typing | I know a reply is coming |
| US-05 | User | Create a group chat with my team | We can collaborate in a shared channel |
| US-06 | User | Start a video call from within the chat | I can switch to face-to-face without leaving the app |
| US-07 | User | Get AI-suggested replies | I can respond faster without typing everything manually |
| US-08 | User | Summarise a long chat thread | I can catch up quickly after being away |
| US-09 | User | Translate a message | I can communicate with people in different languages |
| US-10 | User | See a notification badge for unread messages | I never miss an important message |
| US-11 | User | Update my profile picture and bio | My contacts can identify me easily |
| US-12 | Admin (group) | Remove a member from a group | I can manage group membership appropriately |
