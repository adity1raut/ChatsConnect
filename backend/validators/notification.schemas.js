import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), "must be a valid id");

export const listQuerySchema = z.object({
  before: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unread: z.enum(["true", "false"]).optional(),
});

export const idParamSchema = z.object({ id: objectId });

// Exactly one way of choosing what to mark read
export const markReadSchema = z
  .object({
    ids: z.array(objectId).min(1).max(100).optional(),
    all: z.literal(true).optional(),
    conversationId: objectId.optional(),
    groupId: objectId.optional(),
  })
  .refine(
    (b) => [b.ids, b.all, b.conversationId, b.groupId].filter(Boolean).length === 1,
    "Provide exactly one of ids, all, conversationId or groupId",
  );

export const preferencesSchema = z
  .object({
    messages: z.boolean(),
    groupMessages: z.boolean(),
    friendRequests: z.boolean(),
    groups: z.boolean(),
    calls: z.boolean(),
  })
  .partial()
  .refine((b) => Object.keys(b).length > 0, "No preferences given");
