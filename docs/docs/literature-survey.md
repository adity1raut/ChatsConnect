---
sidebar_position: 2
title: Literature Survey
---

# Literature Survey & Existing System Study

## 1. Overview of Existing Systems

Before designing ChatsConnect, a survey of widely-used real-time communication platforms was conducted to understand the current state of the art, identify common patterns, and locate gaps worth addressing.

### 1.1 WhatsApp

**Type:** Mobile-first instant messaging
**Technology:** Custom binary protocol over XMPP (Erlang backend)

| Feature | Detail |
|---------|--------|
| Messaging | End-to-end encrypted (Signal Protocol) |
| Media | Images, video, documents, audio |
| Groups | Up to 1,024 members |
| Calling | Voice + video (P2P + relay) |
| Auth | Phone number + OTP |
| Platform | iOS, Android (web via bridge) |

**Gaps relevant to this project:**
- Closed source — no extensibility or AI plug-in points
- No browser-native SPA; the web app proxies the mobile app
- No developer API for custom integrations
- Requires a phone number — no email-based registration

---

### 1.2 Slack

**Type:** Team collaboration platform
**Technology:** WebSocket (Socket.io-inspired), Electron desktop client

| Feature | Detail |
|---------|--------|
| Messaging | Channels (public/private) + DMs |
| Integrations | 2,400+ third-party app bots |
| Search | Full-text across all history |
| Calling | Huddles (audio/video) |
| Auth | Email/password + SSO/OAuth |
| AI | Slack AI (summarisation, search) — paid tier |

**Gaps relevant to this project:**
- Workspace-centric (not friend-graph-centric)
- AI features locked behind paid tier
- Heavyweight Electron client; no mobile-native feel for casual use
- Complex admin model overkill for small user groups

---

### 1.3 Discord

**Type:** Community/gaming chat platform
**Technology:** WebSocket + WebRTC, React frontend

| Feature | Detail |
|---------|--------|
| Messaging | Servers → channels + DMs |
| Voice/Video | Persistent voice channels (WebRTC) |
| Presence | Rich presence API |
| Auth | Email + OAuth (Google, Apple) |
| AI | Clyde AI bot (discontinued) |

**Gaps relevant to this project:**
- Server/channel hierarchy is complex for 1-to-1 use
- No OTP email verification — easier to create throwaway accounts
- AI integration was experimental and removed
- No friend-request gating (anyone can DM if sharing a server)

---

### 1.4 Telegram

**Type:** Cloud-based messaging
**Technology:** MTProto custom protocol, open-source clients

| Feature | Detail |
|---------|--------|
| Messaging | Encrypted cloud messages + optional E2E "secret chats" |
| Bots | Full HTTP Bot API (NLP, payments, games) |
| Groups | Up to 200,000 members |
| Channels | Broadcast to unlimited subscribers |
| Auth | Phone number + OTP |

**Gaps relevant to this project:**
- Phone-number-only registration (no email)
- Bot API is powerful but requires a separate Telegram Bot account
- No built-in AI assistance in the native UI
- Not open-source server-side

---

### 1.5 Comparison Matrix

| Feature | WhatsApp | Slack | Discord | Telegram | **ChatsConnect** |
|---------|----------|-------|---------|----------|------------------|
| Email registration | ✗ | ✓ | ✓ | ✗ | **✓ + OTP gate** |
| OTP verification | ✓ (phone) | ✗ | ✗ | ✓ (phone) | **✓ (email)** |
| GitHub OAuth | ✗ | ✓ | ✗ | ✗ | **✓** |
| Real-time DM | ✓ | ✓ | ✓ | ✓ | **✓** |
| Group chat | ✓ | ✓ | ✓ | ✓ | **✓** |
| Friend-request graph | ✗ | ✗ | ✓ | ✗ | **✓** |
| WebRTC video call | ✓ | ✓ | ✓ | ✓ | **✓** |
| Built-in AI (native UI) | ✗ | Paid | Removed | ✗ | **Planned** |
| Open-source & extensible | ✗ | ✗ | ✗ | Partial | **✓ (MIT)** |
| Glassmorphic SPA (browser) | ✗ | ✗ | ✗ | ✗ | **✓** |

---

## 2. Survey of Underlying Technologies

### 2.1 Real-Time Transport Protocols

#### HTTP Long Polling
The traditional technique before WebSockets: the client sends a request and the server holds it open until data is available, then responds. Simple to implement but introduces high latency and server resource waste.

#### Server-Sent Events (SSE)
Unidirectional push from server to client over HTTP. Suitable for notifications but cannot carry client-to-server messages on the same channel.

#### WebSocket (RFC 6455)
A full-duplex, persistent TCP-based protocol initiated via an HTTP upgrade handshake. Once established, either side can send frames at any time with minimal overhead.

> **ChatsConnect uses Socket.io**, which wraps WebSocket with automatic reconnection, room-based broadcasting, and a fallback to HTTP long-polling for environments that block WebSocket.

**Reference:** Pimentel, V., & Nickerson, B. G. (2012). *Communicating and Displaying Real-Time Data with WebSocket*. IEEE Internet Computing, 16(4), 45–53.

#### MQTT
A publish/subscribe binary protocol designed for IoT devices. Lightweight but requires a separate broker (e.g., Mosquitto) and is not natively supported in browsers without a WebSocket bridge. Overkill for a chat app with complex room semantics.

#### XMPP (Extensible Messaging and Presence Protocol)
The protocol underlying WhatsApp and Google Talk. Standards-based and extensible, but verbose (XML), and requires a dedicated XMPP server. Socket.io provides equivalent room/presence semantics with far less setup.

---

### 2.2 Authentication Approaches

#### Session-Based Authentication
The server stores session state in memory or a database. Works well for single-server deployments but requires sticky sessions or a shared session store (Redis) for horizontal scaling.

#### JSON Web Tokens (JWT) — RFC 7519
Self-contained, stateless tokens signed with a secret. The server can verify a token without a database lookup. ChatsConnect issues JWTs stored in **HttpOnly cookies** (not localStorage) to prevent XSS-based token theft.

**Reference:** Jones, M., Bradley, J., & Sakimura, N. (2015). *RFC 7519: JSON Web Token (JWT)*. IETF.

#### OAuth 2.0 — RFC 6749
A delegated authorisation framework. ChatsConnect implements GitHub OAuth 2.0 via Passport.js, allowing users to authenticate without creating a separate password.

---

### 2.3 Peer-to-Peer Video: WebRTC

WebRTC (Web Real-Time Communication) is a W3C/IETF standard enabling audio, video, and data streams directly between browsers without a plugin. Key components:

| Component | Role |
|-----------|------|
| **RTCPeerConnection** | Manages the peer-to-peer media session |
| **ICE (Interactive Connectivity Establishment)** | Finds the best network path between peers |
| **STUN** | Discovers public IP addresses behind NAT |
| **TURN** | Relays media when direct P2P is blocked |
| **SDP (Session Description Protocol)** | Describes the media capabilities exchanged during offer/answer |

ChatsConnect uses Socket.io as the **signaling channel** (to exchange SDP offers, answers, and ICE candidates) before handing off to the browser's native WebRTC API.

**Reference:** W3C. (2023). *WebRTC 1.0: Real-Time Communication Between Browsers*. https://www.w3.org/TR/webrtc/

---

### 2.4 Database: Document vs Relational for Chat

| Concern | Relational (PostgreSQL) | Document (MongoDB) |
|---------|-------------------------|--------------------|
| Message schema | Fixed columns | Flexible — can add `reactions`, `attachments` fields without migration |
| Conversation participants | Join table | Embedded array in Conversation document |
| Horizontal scaling | Complex sharding | Native Atlas sharding |
| Aggregation for history | SQL `JOIN` | `$lookup` pipeline |
| Real-time change streams | Triggers / polling | Native Change Streams |

ChatsConnect uses **MongoDB Atlas** for its schema flexibility (useful during rapid feature iteration) and native cloud horizontal scaling.

---

### 2.5 Cloud Media Storage: Cloudinary vs AWS S3

| Factor | Cloudinary | AWS S3 |
|--------|-----------|--------|
| Setup complexity | Low (SDK, single API key) | Higher (IAM, bucket policy, ACL) |
| Automatic optimisation | ✓ (resize, compress, CDN) | ✗ (requires Lambda) |
| Free tier | 25 credits/month | 5 GB / 20k requests |
| URL-based transformations | ✓ | ✗ |

ChatsConnect chose **Cloudinary** for its free tier suitability and zero-config CDN delivery of avatar images.

---

## 3. Gap Analysis

Based on the survey above, the following gaps in existing solutions motivate ChatsConnect:

| Gap | How ChatsConnect Addresses It |
|-----|-------------------------------|
| No email-OTP registration in popular apps | Two-step OTP gate before account creation |
| AI features are absent or paywalled | Planned AI microservice (smart replies, moderation) as a first-class architectural component |
| Closed-source platforms block extension | Full open-source MERN stack — every layer is customisable |
| Heavy desktop clients | Lightweight React SPA deployable to any CDN |
| Friend-graph missing in team tools | Explicit friend-request model with real-time notifications |
| Phone-number-only auth in many apps | Email + GitHub OAuth — no phone required |
| AI is an afterthought bolt-on | Python microservice with a defined HTTP contract designed in from the start |
