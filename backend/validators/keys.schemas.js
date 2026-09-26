import mongoose from "mongoose";
import { z } from "zod";

const b64 = z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/, "must be base64");

export const publishKeySchema = z.object({
  publicKey: z.object({
    kty: z.literal("EC"),
    crv: z.literal("P-256"),
    x: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    y: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  }),
  backup: z.object({
    v: z.literal(1),
    ciphertext: b64.max(2000),
    iv: b64.length(16),
    salt: b64.length(24),
    iterations: z.number().int().min(100_000).max(5_000_000),
  }),
  // Required to replace an existing key on email/password accounts
  password: z.string().max(200).optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().refine((v) => mongoose.isValidObjectId(v), "must be a valid id"),
});
