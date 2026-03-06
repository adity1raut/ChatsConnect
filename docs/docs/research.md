---
sidebar_position: 10
title: Research & Evaluation
---

# Research & Evaluation

## Novelty of the Project

ChatsConnect is not a re-implementation of a single chat primitive — it is an **integrated, full-stack communication platform** that combines several subsystems rarely found together in student/open-source projects:

### 1. Dual-Mode Authentication with OTP Gate
Most chat apps use either password login or OAuth. ChatsConnect implements **both** in a unified auth flow, and adds a **two-step OTP email verification** before an account is created — blocking disposable/fake registrations before they touch the database.

### 2. Unified Signaling Layer for Chat + Video
The same Socket.io connection handles:
- Real-time direct messages
- Group messaging with typing indicators
- WebRTC video call signaling (offer / answer / ICE candidates)
- Online presence broadcasting

Using a **single persistent socket connection** for all real-time features removes the need for a separate signaling server and reduces client-side connection overhead.

### 3. Friend-Graph + Group Model
ChatsConnect maintains an explicit **friend-request graph** (`FriendRequest` model with `pending → accepted/rejected` status) separate from the conversation model. This mirrors production social apps and is absent from most tutorial-level chat projects.

### 4. AI-Ready Microservice Architecture
The Python `server/` stub is architected as a **standalone FastAPI service** with a defined HTTP contract (sentiment, smart replies, summarisation, moderation). Plugging in any HuggingFace or OpenAI model requires only implementing the endpoints — no changes to the Node.js backend. This separation of concerns is a deliberate architectural decision for long-term extensibility.

### 5. Context-API State Machine without Redux
The frontend manages six independent global contexts (Auth, Socket, Friend, Notification, Call, Theme) using **React Context + useReducer only** — no third-party state management library. The `CallContext` in particular implements a finite-state machine for call lifecycle (idle → calling → in-call → ended).

### 6. Glassmorphic Responsive UI with TailwindCSS 4
The entire UI is built with **Tailwind 4 utility classes** — no component library (no MUI, no Shadcn). The glassmorphic dark theme is implemented with `backdrop-blur`, `bg-opacity`, and layered `ring` utilities, keeping the bundle small while achieving a modern look.

---

## Gaps & Limitations

### Scalability

| Limitation | Impact |
|-----------|--------|
| Online user map is **in-memory** (`Map` in `socket.js`) | Breaks in multi-instance / serverless deployments; a Redis pub/sub adapter is needed |
| Deployed on **Vercel serverless functions** | Persistent Socket.io connections are incompatible with stateless function invocations; a dedicated server (Railway, Fly.io) is required for production |
| No horizontal scaling strategy | A single Node process becomes a bottleneck under load |

### Security

| Limitation | Impact |
|-----------|--------|
| **No end-to-end encryption** of messages | Messages are stored in plaintext in MongoDB; a breach exposes all chat history |
| No **rate limiting** on auth endpoints | Brute-force / credential-stuffing attacks are possible |
| No **CAPTCHA** on registration | Automated account creation is not prevented |
| WebRTC without **TURN server** | Calls may fail behind strict NATs/firewalls where direct peer connections are blocked |

### Feature Completeness

| Limitation | Detail |
|-----------|--------|
| **AI microservice is a stub** | Smart replies, sentiment analysis, and moderation are designed but not implemented |
| **No file / media sharing** | Only text messages are supported; image/document transfer requires future work |
| **No message pagination** | All messages in a conversation are fetched at once; large histories will degrade performance |
| **No read receipts** | Delivered / read status is not tracked per message |
| **No push notifications** | Notifications require the app to be open (no FCM / Web Push integration) |
| **Settings & VideoRoom pages are stubs** | `/settings` and `/video-room` routes render placeholder UIs |
| **OAuth limited to GitHub** | Google, Discord, and other providers are not yet integrated |

### Testing

| Limitation | Detail |
|-----------|--------|
| Unit tests cover auth and profile controllers only | Message, group, friend, and socket event handlers lack automated test coverage |
| No integration or end-to-end tests | Cypress / Playwright test suite not yet written |

---

## References & Sources

### Standards & Specifications

| Source | Relevance |
|--------|-----------|
| [RFC 6455 — The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455) (IETF, 2011) | Foundation of Socket.io transport; defines the WebSocket handshake and framing |
| [RFC 7519 — JSON Web Tokens (JWT)](https://datatracker.ietf.org/doc/html/rfc7519) (IETF, 2015) | Stateless auth token structure used throughout the backend |
| [WebRTC 1.0: Real-Time Communication Between Browsers](https://www.w3.org/TR/webrtc/) (W3C) | Peer-to-peer video/audio call API implemented in `CallContext` and socket signaling |
| [RFC 6749 — OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749) (IETF, 2012) | Basis of the GitHub OAuth flow via Passport.js |

### Research Papers (IEEE / ACM)

| Paper | Relevance |
|-------|-----------|
| Pimentel, V., & Nickerson, B. G. (2012). **Communicating and Displaying Real-Time Data with WebSocket**. *IEEE Internet Computing*, 16(4), 45–53. | WebSocket vs. HTTP long-polling performance analysis; supports the Socket.io choice |
| Grigorik, I. (2013). **High Performance Browser Networking** (Chapter 17 — WebRTC). O'Reilly / Google. | WebRTC architecture, ICE/STUN/TURN negotiation — referenced for the video call design |
| Rescorla, E. (2018). **The Transport Layer Security (TLS) Protocol Version 1.3** — RFC 8446. IETF. | HTTPS/WSS encryption layer that secures all traffic in production |
| Wang, Y., et al. (2020). **A Survey of Real-Time Messaging Systems**. *ACM Computing Surveys*, 53(2). | Comparative analysis of XMPP, MQTT, and WebSocket for chat applications |

### Official Documentation

| Resource | URL |
|----------|-----|
| Socket.io Documentation | https://socket.io/docs/v4/ |
| React 19 Docs | https://react.dev |
| MongoDB Atlas Docs | https://www.mongodb.com/docs/atlas/ |
| Cloudinary Node SDK | https://cloudinary.com/documentation/node_integration |
| Passport.js Documentation | https://www.passportjs.org/docs/ |
| Mongoose ODM Docs | https://mongoosejs.com/docs/ |
| Vite Documentation | https://vitejs.dev/guide/ |
| TailwindCSS v4 Docs | https://tailwindcss.com/docs |
| jsonwebtoken (npm) | https://github.com/auth0/node-jsonwebtoken |
| bcryptjs (npm) | https://github.com/dcodeIO/bcrypt.js |
| Nodemailer Docs | https://nodemailer.com/about/ |
| FastAPI (Python AI server) | https://fastapi.tiangolo.com/ |

### Open-Source Projects Referenced

| Repository | Relevance |
|-----------|-----------|
| [socketio/socket.io](https://github.com/socketio/socket.io) | Real-time engine; studied internals for room management and auth middleware |
| [expressjs/express](https://github.com/expressjs/express) | Express 5 async error handling patterns |
| [jaredhanson/passport](https://github.com/jaredhanson/passport) | GitHub OAuth strategy integration pattern |
| [Automattic/mongoose](https://github.com/Automattic/mongoose) | Schema design patterns for embedded vs. referenced documents |
| [peers/peerjs](https://github.com/peers/peerjs) | WebRTC abstraction patterns studied for the custom `CallContext` implementation |

### Tutorials & Learning Resources

| Resource | Relevance |
|----------|-----------|
| Traversy Media — MERN Stack Chat App (YouTube) | Baseline patterns for Socket.io + React integration |
| As a Programmer — WebRTC Video Chat (YouTube) | WebRTC signaling flow adapted for the video call feature |
| Auth0 Blog — JWT Best Practices | HttpOnly cookie storage and refresh token rotation strategy |
| DigitalOcean — Building a Real-Time Chat App with Node.js | Socket.io room management reference |
