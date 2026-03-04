---
sidebar_position: 4
---

# AI Microservice

The AI Microservice is a dedicated backend service designed to handle all natural language processing (NLP) and machine learning workloads. Moving these computationally intense requirements away from the primary Node.js backend guarantees high performance and scalability.

## Core Technologies

- **Python**: Primary language for AI workloads.
- **FastAPI**: Extremely fast and lightweight web framework for Python, used to expose REST APIs for the Node.js backend to consume.
- **HuggingFace Transformers**: Used to load and execute pre-trained AI models locally.
- **OpenAI API (Optional)**: Can be integrated for advanced conversational features or high-quality summarization processing.

## Key Capabilities

### 1. Real-Time Sentiment Analysis
As messages flow through the system, the AI Microservice analyzes text for its underlying sentiment (Positive, Negative, Neutral). This can be used to warn users or provide community sentiment dashboards.

### 2. Smart Reply & Rewriting
Based on the context of the recent chat history, the microservice can suggest short, relevant replies, similar to features found in enterprise email and chat clients. It also provides "rewrite" functionality to improve tone or professionalism.

### 3. Automated Summarization
For long group conversations or video transcripts (if implemented), the microservice processes the extensive text blocks and extracts:
- A brief abstract/summary of the discussion.
- Key action items or bullet points.

### 4. Toxicity Moderation
Before finalizing messages, or asynchronously, the AI checks for offensive language, hate speech, or harassment. Configurable rules allow group admins to block the message entirely, hide it behind a warning, or mute the offending user.

## Communication with Main Backend

The main backend interacts with the AI Microservice solely via internal HTTP/REST endpoints.
For example:

- `POST /api/v1/analyze-sentiment` -> Returns polarity scores.
- `POST /api/v1/moderate` -> Returns boolean `isSafe` and reason.
- `POST /api/v1/summarize` -> Returns text summary.
