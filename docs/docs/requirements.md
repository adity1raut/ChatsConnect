---
sidebar_position: 3
title: Requirements
---

# Requirements

## Functional Requirements

Functional requirements describe **what the system must do** — the specific behaviors and features it must provide.

### FR-1: User Registration & Authentication
| ID | Requirement |
|----|-------------|
| FR-1.1 | The system shall allow a user to register with a unique email address and password via a two-step OTP email verification flow. |
| FR-1.2 | The system shall allow a registered user to log in with their email and password. |
| FR-1.3 | The system shall allow a user to authenticate via GitHub OAuth 2.0. |
| FR-1.4 | The system shall issue a JWT access token (stored in an HttpOnly cookie) upon successful login. |
| FR-1.5 | The system shall support refresh token rotation to maintain sessions without re-login. |
| FR-1.6 | The system shall allow a logged-in user to log out, invalidating their session cookie. |
| FR-1.7 | The system shall allow a user to change their password while logged in. |
| FR-1.8 | The system shall allow a user to reset their password via an email link when forgotten. |

### FR-2: Profile Management
| ID | Requirement |
|----|-------------|
| FR-2.1 | The system shall allow a user to view and update their display name and bio. |
| FR-2.2 | The system shall allow a user to upload a profile avatar, stored on Cloudinary. |
| FR-2.3 | The system shall allow a user to change their registered email address. |
| FR-2.4 | The system shall allow a user to permanently delete their account. |
| FR-2.5 | The system shall allow a user to search for other users by username. |
| FR-2.6 | The system shall display online/offline presence status for users. |

### FR-3: Friend Management
| ID | Requirement |
|----|-------------|
| FR-3.1 | The system shall allow a user to send a friend request to another user. |
| FR-3.2 | The system shall allow a user to accept or reject an incoming friend request. |
| FR-3.3 | The system shall allow a user to view their current friends list. |
| FR-3.4 | The system shall allow a user to remove an existing friend. |
| FR-3.5 | The system shall notify a user in real time when they receive a friend request. |

### FR-4: Direct Messaging
| ID | Requirement |
|----|-------------|
| FR-4.1 | The system shall allow any two users to exchange direct (1-to-1) text messages. |
| FR-4.2 | The system shall deliver messages in real time via WebSocket without page refresh. |
| FR-4.3 | The system shall persist all messages in MongoDB for retrieval on reconnect. |
| FR-4.4 | The system shall display a typing indicator when the other party is composing a message. |
| FR-4.5 | The system shall show a chronological message history when a conversation is opened. |

### FR-5: Group Messaging
| ID | Requirement |
|----|-------------|
| FR-5.1 | The system shall allow a user to create a named group chat with multiple members. |
| FR-5.2 | The system shall allow the group admin to add or remove members. |
| FR-5.3 | The system shall broadcast group messages to all online members in real time. |
| FR-5.4 | The system shall store group messages for offline members to retrieve on next login. |
| FR-5.5 | The system shall display a list of all groups the user belongs to. |

### FR-6: Video Calling
| ID | Requirement |
|----|-------------|
| FR-6.1 | The system shall allow a user to initiate a 1-to-1 video call with a friend. |
| FR-6.2 | The system shall notify the recipient of an incoming call in real time. |
| FR-6.3 | The system shall allow the recipient to accept or decline the call. |
| FR-6.4 | The system shall establish a peer-to-peer media stream (WebRTC) between caller and callee. |
| FR-6.5 | The system shall allow either party to end the call at any time. |

### FR-7: Notifications
| ID | Requirement |
|----|-------------|
| FR-7.1 | The system shall display an unread message badge count in the navigation bar, updated in real time. |
| FR-7.2 | The system shall maintain a notification list that deep-links to the relevant chat on click. |
| FR-7.3 | The system shall mark notifications as read when the user opens the corresponding conversation. |

### FR-8: Dashboard
| ID | Requirement |
|----|-------------|
| FR-8.1 | The system shall present a dashboard showing total message count, friend count, and group count. |
| FR-8.2 | The system shall display the user's most recent conversations on the dashboard. |

### FR-9: AI Assistance (Planned)
| ID | Requirement |
|----|-------------|
| FR-9.1 | The system shall suggest contextual short replies above the chat input (smart replies). |
| FR-9.2 | The system shall provide an on-demand summary of long group conversations. |
| FR-9.3 | The system shall analyse message sentiment and display a community health indicator. |
| FR-9.4 | The system shall screen messages for toxic content before persisting or broadcasting. |

---

## Non-Functional Requirements

Non-functional requirements describe **how well** the system must perform — quality attributes and constraints.

### NFR-1: Performance
| ID | Requirement |
|----|-------------|
| NFR-1.1 | REST API responses (excluding media upload) shall complete within **500 ms** under normal load. |
| NFR-1.2 | Real-time message delivery latency shall be under **200 ms** on a standard broadband connection. |
| NFR-1.3 | The React SPA shall achieve a Lighthouse performance score of **≥ 80** on desktop. |
| NFR-1.4 | The system shall support at least **100 concurrent WebSocket connections** on a single Node process. |

### NFR-2: Security
| ID | Requirement |
|----|-------------|
| NFR-2.1 | All passwords shall be hashed with **bcryptjs** (salt rounds ≥ 10) before storage. |
| NFR-2.2 | JWT tokens shall be stored exclusively in **HttpOnly, Secure, SameSite=Strict** cookies. |
| NFR-2.3 | All client-server communication shall use **HTTPS / WSS** in production. |
| NFR-2.4 | The OTP for email verification shall expire within **10 minutes** of issuance. |
| NFR-2.5 | The system shall validate and sanitise all user input on the server side before persistence. |

### NFR-3: Reliability & Availability
| ID | Requirement |
|----|-------------|
| NFR-3.1 | The system shall target **99.5% uptime** in production (excluding planned maintenance). |
| NFR-3.2 | On WebSocket disconnection, the client shall automatically attempt reconnection with exponential back-off. |
| NFR-3.3 | Messages sent while a recipient is offline shall be delivered on their next connection. |

### NFR-4: Scalability
| ID | Requirement |
|----|-------------|
| NFR-4.1 | The database layer shall support horizontal scaling via **MongoDB Atlas** sharding. |
| NFR-4.2 | The architecture shall allow the Node.js backend to be scaled horizontally by replacing the in-memory socket store with a **Redis adapter** without changes to business logic. |

### NFR-5: Usability
| ID | Requirement |
|----|-------------|
| NFR-5.1 | The UI shall be fully responsive and usable on screen widths from **375 px** (mobile) to **2560 px** (4K desktop). |
| NFR-5.2 | Core user flows (register, login, send message) shall be completable in **under 3 clicks** from the landing screen. |
| NFR-5.3 | The application shall support both **dark and light themes**, togglable from the UI. |

### NFR-6: Maintainability
| ID | Requirement |
|----|-------------|
| NFR-6.1 | Backend code shall follow an **MVC-style separation** (models / controllers / routes / middleware). |
| NFR-6.2 | The codebase shall maintain **unit test coverage** for all authentication and profile controller functions. |
| NFR-6.3 | All environment-specific configuration (DB URI, JWT secret, API keys) shall be externalised via **`.env` files** and never committed to version control. |

### NFR-7: Compatibility
| ID | Requirement |
|----|-------------|
| NFR-7.1 | The frontend shall function correctly on the latest two major versions of Chrome, Firefox, Edge, and Safari. |
| NFR-7.2 | The backend shall run on **Node.js LTS (≥ 20)**. |

---

## Hardware & Software Requirements

### Development Environment

| Category | Requirement |
|----------|-------------|
| **CPU** | Dual-core 64-bit processor, 2 GHz or faster |
| **RAM** | Minimum 8 GB (16 GB recommended for running all services locally) |
| **Storage** | 5 GB free disk space (for dependencies, MongoDB data, and build artifacts) |
| **OS** | Windows 10/11, macOS 12+, or Ubuntu 20.04+ |
| **Network** | Stable internet connection (required for MongoDB Atlas, Cloudinary, email SMTP, and OAuth) |

### Software Dependencies

#### Runtime & Build Tools
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | LTS ≥ 20 | Backend runtime and frontend build toolchain |
| npm | ≥ 10 | Package management |
| Python | ≥ 3.10 | AI microservice (planned) |
| Git | Any recent | Version control |

#### Backend Packages
| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.x | HTTP server and REST routing |
| socket.io | 4.x | WebSocket real-time layer |
| mongoose | 9.x | MongoDB ODM |
| jsonwebtoken | 9.x | JWT issuance and verification |
| bcryptjs | 3.x | Password hashing |
| passport + passport-github2 | 0.7.x | GitHub OAuth 2.0 |
| cloudinary | 2.x | Cloud media storage SDK |
| nodemailer | 8.x | SMTP email dispatch |
| winston | 3.x | Structured logging |
| vitest | 4.x | Unit testing framework |

#### Frontend Packages
| Package | Version | Purpose |
|---------|---------|---------|
| react | 19 | UI component model |
| vite | 7 | Build tool and dev server |
| tailwindcss | 4 | Utility-first CSS framework |
| react-router-dom | 7 | Client-side routing |
| axios | Latest | HTTP REST client |
| socket.io-client | 4.x | WebSocket client |
| lucide-react | Latest | SVG icon library |

#### External Services
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Managed cloud database |
| Cloudinary | Profile image storage and CDN |
| Gmail SMTP (via Nodemailer) | OTP and password-reset emails |
| GitHub OAuth App | Social login provider |
| Vercel | Hosting for frontend and backend |

### Ports Used Locally

| Service | Default Port |
|---------|-------------|
| Node.js backend | 5000 |
| React dev server (Vite) | 5173 |
| Python AI microservice | 8000 |
| MongoDB (local) | 27017 |

---

## User Stories

User stories are written from the perspective of an end user in the format:
**"As a [role], I want to [goal], so that [benefit]."**

### Authentication
- As a **new user**, I want to register with my email and verify it via OTP, so that only real users can create accounts.
- As a **returning user**, I want to log in with my GitHub account, so that I don't need to remember a separate password.
- As a **logged-in user**, I want my session to persist across browser refreshes, so that I don't have to re-login every time.
- As a **forgetful user**, I want to reset my password via email, so that I can recover my account if I forget my credentials.

### Messaging
- As a **user**, I want to send text messages to a friend in real time, so that we can have a live conversation without delays.
- As a **user**, I want to see when my friend is typing, so that I know a reply is coming and don't send duplicate messages.
- As a **user**, I want to scroll through my full chat history, so that I can refer back to previous conversations.
- As a **group member**, I want to send a message to the whole group at once, so that I don't have to message everyone individually.

### Friends & Groups
- As a **user**, I want to search for people by username and send them a friend request, so that I can connect with people I know.
- As a **user**, I want to be notified when someone sends me a friend request, so that I can respond promptly.
- As a **group admin**, I want to add or remove members from my group, so that I can control who participates.

### Video Calling
- As a **user**, I want to start a video call with a friend directly from the chat window, so that I can switch to face-to-face communication instantly.
- As a **user**, I want to receive a visual notification of an incoming call, so that I don't miss it while browsing elsewhere in the app.

### Profile & Settings
- As a **user**, I want to upload a profile picture, so that my friends can recognise me easily.
- As a **user**, I want to toggle between dark and light themes, so that I can use the app comfortably in any lighting.
- As a **user**, I want to delete my account and all associated data, so that I have full control over my personal information.

### Notifications & Dashboard
- As a **user**, I want to see a badge count of unread messages on the navigation bar, so that I know when new messages arrive without being in the chat screen.
- As a **user**, I want a dashboard summary of my activity (message count, friends, groups), so that I get a quick overview when I log in.
