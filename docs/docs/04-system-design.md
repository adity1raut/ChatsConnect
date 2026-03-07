---
sidebar_position: 4
title: System Design & Diagrams
---

# System Design & Diagrams

## 1. Architecture Diagram

ChatsConnect follows a **three-tier client-server architecture** augmented with an AI microservice:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│   React 19 + Vite 7 SPA  (Vercel CDN)                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Auth    │  │  Chat    │  │  Video   │  │  AI      │  │
│   │  Pages   │  │  Pages   │  │  Call    │  │  Panel   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────┬───────────────────────┘
                  │ HTTPS REST        │ WebSocket (Socket.io)
                  │                   │
┌─────────────────▼───────────────────▼───────────────────────┐
│                      SERVER TIER                             │
│   Node.js + Express 5  (Vercel Serverless / Node server)    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Auth    │  │ Message  │  │  Group   │  │  AI      │  │
│   │ Routes   │  │ Routes   │  │  Routes  │  │  Proxy   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────┬───┘  │
│                  ┌──────────┐                        │       │
│                  │Socket.io │                        │       │
│                  │ Server   │                        │       │
│                  └──────────┘                        │       │
└───────────────────────┬──────────────────────────────┼───────┘
                        │ Mongoose ODM                  │ HTTP
                        │                               │
┌───────────────────────▼───────┐  ┌────────────────────▼──────┐
│         DATA TIER             │  │     AI MICROSERVICE        │
│   MongoDB Atlas               │  │   FastAPI + Uvicorn        │
│   ┌──────────────────────┐    │  │   (Python, Port 8000)      │
│   │ users  messages      │    │  │   ┌──────────────────────┐ │
│   │ convos groups        │    │  │   │ Groq API (LLaMA-3)   │ │
│   └──────────────────────┘    │  │   └──────────────────────┘ │
└───────────────────────────────┘  └────────────────────────────┘
         │ Cloudinary SDK                │ Gmail SMTP
         ▼                               ▼
   [Image Storage]                [OTP Email Delivery]
```

---

## 2. UML Diagrams

### 2.1 Use Case Diagram

```mermaid
graph TD
    Guest([Guest User])
    RegUser([Registered User])
    GroupAdmin([Group Admin])
    AIService([AI Microservice])

    Guest --> UC1[Register with OTP]
    Guest --> UC2[Login with Email/Password]
    Guest --> UC3[Login with GitHub OAuth]

    RegUser --> UC4[Send Direct Message]
    RegUser --> UC5[View Message History]
    RegUser --> UC6[See Typing Indicator]
    RegUser --> UC7[Start Video Call]
    RegUser --> UC8[Accept / Reject Call]
    RegUser --> UC9[Create Group Chat]
    RegUser --> UC10[Send Group Message]
    RegUser --> UC11[Update Profile]
    RegUser --> UC12[Search Users]
    RegUser --> UC13[View Notifications]
    RegUser --> UC14[Request Smart Reply]
    RegUser --> UC15[Summarise Conversation]
    RegUser --> UC16[Translate Message]
    RegUser --> UC17[Analyse Sentiment]
    RegUser --> UC18[Logout]

    GroupAdmin --> UC19[Add Member to Group]
    GroupAdmin --> UC20[Remove Member from Group]

    UC14 --> AIService
    UC15 --> AIService
    UC16 --> AIService
    UC17 --> AIService
```

---

### 2.2 Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String avatar
        +String bio
        +Boolean isOnline
        +String githubId
        +String refreshToken
        +Date createdAt
        +register()
        +login()
        +logout()
        +updateProfile()
        +changePassword()
    }

    class Conversation {
        +ObjectId _id
        +ObjectId[] participants
        +ObjectId lastMessage
        +Date updatedAt
        +getHistory()
    }

    class Message {
        +ObjectId _id
        +ObjectId sender
        +ObjectId conversation
        +String content
        +String type
        +Date createdAt
        +send()
        +getByConversation()
    }

    class Group {
        +ObjectId _id
        +String name
        +String description
        +ObjectId admin
        +ObjectId[] members
        +ObjectId[] messages
        +Date createdAt
        +create()
        +addMember()
        +removeMember()
        +delete()
    }

    class GroupMessage {
        +ObjectId _id
        +ObjectId sender
        +ObjectId group
        +String content
        +Date createdAt
        +send()
        +getByGroup()
    }

    class AIService {
        +smartReply(messages)
        +summarise(messages)
        +translate(text, targetLang)
        +sentiment(text)
        +chat(userMessage)
    }

    User "1" --> "many" Message : sends
    User "1" --> "many" GroupMessage : sends
    User "many" --> "many" Conversation : participates in
    Conversation "1" --> "many" Message : contains
    Group "1" --> "many" GroupMessage : contains
    Group "many" --> "many" User : has members
    User --> AIService : requests
```

---

### 2.3 Sequence Diagram — User Login and Send Message

```mermaid
sequenceDiagram
    actor U as User
    participant C as React Client
    participant B as Node.js Backend
    participant DB as MongoDB
    participant S as Socket.io Server

    Note over U,S: Authentication Flow
    U->>C: Enter email + password
    C->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User document
    B->>B: bcrypt.compare(password, hash)
    B-->>C: Set JWT cookie + user data
    C->>C: Store auth state (AuthContext)

    Note over U,S: WebSocket Connection
    C->>S: socket.connect() with JWT token
    S->>S: Verify JWT, store socket.userId
    S-->>C: connection confirmed
    S->>S: Add userId to onlineUsers map
    S-->>C: emit onlineUsers list

    Note over U,S: Send a Message
    U->>C: Type message, press Send
    C->>B: POST /api/messages (REST — persist)
    B->>DB: Save Message document
    DB-->>B: Saved message
    B-->>C: 201 Created (message object)
    C->>S: emit sendMessage {to, message}
    S->>S: Find recipient socket
    S-->>C: emit newMessage to recipient (real-time)
    C->>C: Update chat UI with new message
```

---

### 2.4 Activity Diagram — OTP Registration Flow

```mermaid
flowchart TD
    A([Start]) --> B[User enters name, email, password]
    B --> C{Email already\nregistered?}
    C -- Yes --> D[Return 409 Conflict error]
    D --> B
    C -- No --> E[Generate 6-digit OTP]
    E --> F[Store OTP + expiry in DB]
    F --> G[Send OTP email via Nodemailer]
    G --> H[User enters OTP]
    H --> I{OTP valid\n& not expired?}
    I -- No --> J{Max retries\nreached?}
    J -- No --> K[Show error, allow retry]
    K --> H
    J -- Yes --> L[Invalidate OTP, block for 10 min]
    L --> M([End — Registration Failed])
    I -- Yes --> N[Create User in MongoDB]
    N --> O[Issue JWT access + refresh tokens]
    O --> P[Set HttpOnly cookie]
    P --> Q([End — Registration Success])
```

---

### 2.5 Activity Diagram — AI Smart Reply Flow

```mermaid
flowchart TD
    A([New message received]) --> B{AI features\nenabled?}
    B -- No --> Z([End])
    B -- Yes --> C[Extract last N messages from context]
    C --> D[POST /api/ai/smart-reply]
    D --> E[Node.js proxy forwards to FastAPI]
    E --> F[FastAPI calls Groq LLaMA-3 API]
    F --> G{API response\nsuccessful?}
    G -- No --> H[Return empty suggestions]
    H --> Z
    G -- Yes --> I[Parse 3 reply suggestions]
    I --> J[Send suggestions to React client]
    J --> K[Display as pill buttons above input]
    K --> L{User clicks\na suggestion?}
    L -- No --> Z
    L -- Yes --> M[Populate message input with suggestion]
    M --> N[User edits or sends]
    N --> Z([End])
```
