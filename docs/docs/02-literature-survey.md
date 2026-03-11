---
sidebar_position: 2
title: Literature Survey
---

# Literature Survey

## 1. Study of Similar Systems

### 1.1 Slack

**Overview:** Slack is a channel-based workplace messaging platform used by millions of organisations globally.

| Feature | Slack |
|---|---|
| Real-time messaging | Yes (WebSocket) |
| Video calling | Yes (Huddles, up to 50 users) |
| AI features | Slack AI (summarisation, search) — paid add-on |
| Group chats | Yes (Channels, threads) |
| Open-source | No |
| Pricing | Freemium; AI features require paid plan |

**Gaps identified:**
- AI features locked behind expensive subscription tiers.
- Not suitable for personal/academic projects or small teams with limited budget.
- Closed ecosystem; no ability to self-host or customise.

**Source:** Slack Inc., *Slack Product Documentation*, https://slack.com/intl/en-in/resources/slack-101

---

### 1.2 Discord

**Overview:** Discord is a VoIP and messaging platform originally built for gaming communities, now widely adopted for developer communities and education.

| Feature | Discord |
|---|---|
| Real-time messaging | Yes |
| Video calling | Yes (Go Live, screen share) |
| AI features | Limited (bots via API, no native AI) |
| Group chats | Yes (Servers, Channels) |
| Open-source | No |
| Pricing | Free (Nitro for premium) |

**Gaps identified:**
- No built-in AI assistance for smart replies or summarisation.
- API-based bot ecosystem is powerful but requires separate development and hosting.
- Not oriented toward professional productivity or academic document sharing.

**Source:** Discord Inc., *Developer Documentation*, https://discord.com/developers/docs

---

### 1.3 Telegram

**Overview:** Telegram is a cloud-based instant messaging platform known for its speed, security, and bot API ecosystem.

| Feature | Telegram |
|---|---|
| Real-time messaging | Yes |
| Video calling | Yes (1:1 and group) |
| AI features | Via Bots (external); no native LLM |
| Group chats | Yes (up to 200,000 members) |
| Open-source | Partially (client is open, server is not) |
| Pricing | Free |

**Gaps identified:**
- Server-side code is proprietary; true end-to-end encryption only in "Secret Chats."
- AI integration requires third-party bots; no contextual conversation intelligence built in.
- Translation and summarisation features are absent natively.

**Source:** Telegram FZ-LLC, *Telegram API Documentation*, https://core.telegram.org/api

---

### 1.4 Matrix / Element

**Overview:** Matrix is an open standard for decentralised, real-time communication. Element is the flagship client.

| Feature | Matrix/Element |
|---|---|
| Real-time messaging | Yes (federated) |
| Video calling | Yes (Jitsi integration, WebRTC) |
| AI features | Experimental (via MSC proposals) |
| Group chats | Yes (Rooms) |
| Open-source | Yes (Apache 2.0) |
| Pricing | Free (self-hosted) |

**Gaps identified:**
- Steep learning curve for self-hosting and federation configuration.
- Performance can degrade with large federated room histories.
- No production-ready integrated AI layer; research-stage only.

**Source:** Matrix.org Foundation, *Matrix Specification*, https://spec.matrix.org/latest/

---

### 1.5 Microsoft Teams (Academic Use)

**Overview:** Microsoft Teams is an enterprise collaboration platform with deep Microsoft 365 integration, widely adopted in educational institutions.

| Feature | Teams |
|---|---|
| Real-time messaging | Yes |
| Video calling | Yes (up to 1000 participants) |
| AI features | Copilot (meeting transcription, summarisation) |
| Group chats | Yes (Teams, Channels) |
| Open-source | No |
| Pricing | Included with Microsoft 365 (institutional licence) |

**Gaps identified:**
- AI features (Copilot) require additional Microsoft 365 Copilot licence.
- Heavyweight application; significant resource usage on low-end devices.
- No developer-friendly environment for experimenting with or extending AI capabilities.

**Source:** Microsoft, *Teams Developer Documentation*, https://learn.microsoft.com/en-us/microsoftteams/platform/

---

## 2. Identified Gaps and Limitations

| Gap | Impact |
|---|---|
| AI assistance is paywalled or absent in most platforms | Users cannot benefit from smart replies or summarisation without paying |
| No unified platform combining DM + group + video + AI in one open-source stack | Developers and students cannot study or replicate the full architecture |
| Translation and sentiment analysis are niche, third-party add-ons | Cross-language teams lack seamless communication |
| Proprietary server code limits academic research and customisation | Cannot be used as a learning or research prototype |
| Heavy platforms are inaccessible on low-resource devices | Excludes users in bandwidth-constrained environments |

---

## 3. Novelty of ChatsConnect

ChatsConnect addresses these gaps through the following innovations:

1. **Integrated AI microservice** — a lightweight FastAPI server with Groq/LLaMA-3 provides smart replies, summarisation, translation, and sentiment analysis natively, with no third-party subscription required.

2. **Fully open-source MERN + Python stack** — every component (Node.js backend, React frontend, FastAPI AI server) is open-source and self-hostable, making it ideal for academic study and extension.

3. **Unified real-time experience** — WebSocket (Socket.io) messaging, WebRTC video calling, and AI assistance coexist in a single browser session without switching apps.

4. **Accessible authentication** — OTP-based email verification and GitHub OAuth eliminate barriers to onboarding for both technical and non-technical users.

5. **Lightweight and deployable** — the architecture is designed to run on free-tier hosting (Vercel + MongoDB Atlas + Cloudinary), making it feasible for student projects and startups.

---

## 4. Sources and References

| # | Source | Type | Relevance |
|---|---|---|---|
| 1 | Slack Inc. Product Documentation | Website | Real-time messaging architecture |
| 2 | Discord Developer Documentation | Website | VoIP + WebSocket patterns |
| 3 | Telegram API Documentation | Website | Messaging scalability |
| 4 | Matrix.org Specification (v1.x) | Open Standard | Federated chat, open-source patterns |
| 5 | Microsoft Teams Developer Docs | Website | Enterprise AI integration comparison |
| 6 | Fette, I. & Melnikov, A. (2011). *The WebSocket Protocol*. RFC 6455. IETF. | RFC / Standard | WebSocket protocol foundation |
| 7 | Rescorla, E. (2018). *The Transport Layer Security (TLS) Protocol Version 1.3*. RFC 8446. IETF. | RFC / Standard | Secure communication layer |
| 8 | Grigorik, I. (2013). *High Performance Browser Networking*. O'Reilly Media. | Book | WebRTC and WebSocket deep-dive |
| 9 | Touvron, H. et al. (2023). *Llama 2: Open Foundation and Fine-Tuned Chat Models*. arXiv:2307.09288. | Research Paper | LLM used in AI microservice |
| 10 | MongoDB Inc. *MongoDB Atlas Documentation*. | Website | Database architecture and Atlas usage |
