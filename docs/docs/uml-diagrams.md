---
sidebar_position: 5
title: UML Diagrams
---

# UML Diagrams

Formal UML diagrams for **ChatsConnect** — covering system scope, data structure, runtime flows, and process logic.

---

## Architecture Diagram

High-level view of all system components and how they connect.

![Architecture Diagram](/img/diagrams/arch.svg)

---

## 1. Use Case Diagram

Shows all actors (Guest, Authenticated User, Group Admin) and the features they can interact with.

![Use Case Diagram](/img/diagrams/usecase.svg)

---

## 2. Class Diagram

Core data models with attributes, methods, and relationships.

![Class Diagram](/img/diagrams/class.svg)

---

## 3. Sequence Diagrams

### 3a. User Registration (OTP Flow)

Step-by-step interaction between the user, client, backend, database, and email service during registration.

![Sequence Diagram — Registration](/img/diagrams/seq-register.svg)

---

### 3b. Real-Time Direct Message

How a message travels from sender to recipient via Socket.io and MongoDB.

![Sequence Diagram — Direct Message](/img/diagrams/seq-message.svg)

---

### 3c. WebRTC Video Call

Signalling flow through Socket.io to establish a peer-to-peer video call.

![Sequence Diagram — Video Call](/img/diagrams/seq-videocall.svg)

---

## 4. Activity Diagrams

### 4a. Login Flow

All decision branches in the login process from form submission to dashboard redirect.

![Activity Diagram — Login](/img/diagrams/act-login.svg)

---

### 4b. Send Message Flow

Full lifecycle of sending a message, from typing to persistence and delivery.

![Activity Diagram — Send Message](/img/diagrams/act-message.svg)

---

### 4c. Friend Request Flow

The complete friend request process including accept and reject branches.

![Activity Diagram — Friend Request](/img/diagrams/act-friend.svg)
