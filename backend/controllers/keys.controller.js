import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getIO } from "../socket/io.js";
import { fingerprintOf, publicPart } from "../service/e2ee.service.js";

const MAX_KEY_HISTORY = 10;

const publicView = (e2ee) =>
  e2ee?.fingerprint
    ? {
        hasKey: true,
        publicKey: publicPart(e2ee.publicKey),
        fingerprint: e2ee.fingerprint,
        history: (e2ee.history ?? []).map((h) => ({
          publicKey: publicPart(h.publicKey),
          fingerprint: h.fingerprint,
        })),
      }
    : { hasKey: false };

// GET /api/keys/me — my public key plus my passphrase-encrypted private key backup
export const getMyKeys = async (req, res) => {
  const user = await User.findById(req.user._id).select("+e2ee.backup").lean();
  if (!user) throw ApiError.notFound("User not found");
  res.json({ ...publicView(user.e2ee), backup: user.e2ee?.backup ?? null });
};

// PUT /api/keys/me — publish a new key (or re-wrap the same key with a new passphrase)
export const publishMyKey = async (req, res) => {
  const { publicKey, backup, password } = req.body;
  const user = await User.findById(req.user._id).select("+password +e2ee.backup");
  if (!user) throw ApiError.notFound("User not found");

  const current = user.e2ee?.fingerprint ? user.e2ee : null;

  // Replacing keys changes who can read future messages — confirm it's really the owner
  if (current && user.authProvider === "LOCAL") {
    const ok =
      typeof password === "string" &&
      user.password &&
      (await bcrypt.compare(password, user.password));
    if (!ok) throw ApiError.unauthorized("Password is incorrect");
  }

  const fingerprint = fingerprintOf(publicKey);
  const keyChanged = Boolean(current) && current.fingerprint !== fingerprint;
  const history = [...(current?.history ?? [])];
  if (keyChanged) {
    history.unshift({
      publicKey: publicPart(current.publicKey),
      fingerprint: current.fingerprint,
      retiredAt: new Date(),
    });
  }

  user.e2ee = {
    publicKey: publicPart(publicKey),
    fingerprint,
    backup,
    updatedAt: new Date(),
    history: history.slice(0, MAX_KEY_HISTORY),
  };
  await user.save();

  // Everyone's cached copy of this user's key is now stale
  if (keyChanged || !current) {
    getIO()?.emit("keysChanged", { userId: String(user._id), fingerprint });
  }

  res.json(publicView(user.e2ee));
};

// GET /api/keys/:userId — someone's public keys (current + earlier ones)
export const getUserKeys = async (req, res) => {
  const { userId } = req.validated.params;
  const user = await User.findById(userId).select("e2ee.publicKey e2ee.fingerprint e2ee.history").lean();
  if (!user) throw ApiError.notFound("User not found");
  res.json(publicView(user.e2ee));
};
