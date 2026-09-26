import { z } from "zod";

// Caps keep a single request from sending unbounded text to paid model calls
const MAX_TEXT = 5000;
const MAX_MESSAGES = 50;

const chatTurn = z.object({
  role: z.string().max(20),
  content: z.string().max(MAX_TEXT),
});

export const smartReplySchema = z.object({
  messages: z.array(chatTurn).max(MAX_MESSAGES).default([]),
});

export const summarizeSchema = z.object({
  messages: z.array(chatTurn).min(1, "Nothing to summarize").max(200),
});

export const translateSchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(MAX_TEXT),
  target_language: z.string().trim().min(1).max(40),
  source_language: z.string().trim().max(40).default("auto"),
});

export const sentimentSchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(MAX_TEXT),
});

// History and system prompt now live on the server
export const chatSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000),
});

export const assistantSchema = z
  .object({
    name: z.string().trim().min(1, "Give your assistant a name").max(30),
    avatar: z.string().trim().min(1).max(16),
    tone: z.enum(["friendly", "professional", "casual", "witty", "teacher"]),
    length: z.enum(["short", "medium", "long"]),
    language: z.string().trim().min(1).max(40),
    instructions: z.string().max(1500),
  })
  .partial();
