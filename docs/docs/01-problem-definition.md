---
sidebar_position: 1
title: Problem Definition
---

# Problem Definition

## 1. Identifying the Problem

In today's fast-paced digital world, effective real-time communication is a cornerstone of both professional and social life. Despite the availability of numerous messaging platforms, several critical pain points persist for modern users:

- **Fragmented communication channels** — users switch between separate apps for text chat, video calls, and AI assistance, breaking workflow and productivity.
- **Privacy and security concerns** — many popular platforms monetise user data, raising trust issues in sensitive conversations.
- **Lack of intelligent assistance** — existing tools do not integrate contextual AI that can summarise conversations, suggest replies, or translate messages on the fly.
- **Limited group collaboration** — most platforms provide basic group chats without intelligent moderation or real-time sentiment awareness.
- **Accessibility barriers** — language differences hinder communication across global teams and communities.

These problems are especially acute in academic institutions, remote-first startups, and cross-border teams where lightweight yet feature-rich communication tools are needed without enterprise-grade pricing.

---

## 2. Problem Scope (Definition)

**ChatsConnect** is a full-stack, real-time chat and collaboration platform that integrates instant messaging, group conversations, video calling, and an AI assistant into a single unified interface.

### Scope Boundaries

| In Scope | Out of Scope |
|---|---|
| One-to-one direct messaging | End-to-end encrypted storage (future) |
| Group chat creation and management | Mobile native apps (iOS/Android) |
| Real-time video/audio calls via WebRTC | Enterprise SSO / LDAP integration |
| AI smart replies, summarisation, translation | Payment processing or subscriptions |
| User authentication with OTP + GitHub OAuth | Compliance certifications (SOC 2, HIPAA) |
| Profile management and online status | Federated / distributed messaging |

The project is intentionally scoped to be buildable by a small development team within an academic semester while still demonstrating industry-grade architecture patterns (REST API, WebSockets, microservices).

---

## 3. Objective

> **What exactly will ChatsConnect solve?**

ChatsConnect aims to deliver a **single, cohesive platform** that solves the fragmentation problem by providing:

1. **Secure, real-time messaging** — authenticated users can exchange instant messages in DMs and group channels with live delivery status (typing indicators, online presence).

2. **Seamless video calling** — peer-to-peer WebRTC video/audio calls initiated directly from within the chat interface, eliminating the need for a third-party video tool.

3. **AI-augmented communication** — an embedded AI assistant (powered by Groq / LLaMA-3) that offers:
   - Smart reply suggestions based on conversation context
   - Automatic message summarisation for long threads
   - On-demand language translation
   - Sentiment analysis to understand conversation tone

4. **Scalable group collaboration** — users can create, manage, and participate in named group chats with role-based membership controls.

5. **Accessible and open** — deployed as a web application with GitHub OAuth for frictionless sign-in, requiring no downloads or proprietary accounts.

### Success Criteria

| Goal | Metric |
|---|---|
| Real-time message delivery | < 200 ms latency on local network |
| AI response time | < 3 s for smart reply generation |
| Concurrent WebSocket connections | Supports 50+ simultaneous users |
| Authentication security | JWT + HttpOnly cookie, OTP verification |
| Uptime during demo | 99% availability on Vercel deployment |
