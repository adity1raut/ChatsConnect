import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import { sendOtpEmail, sendTwoFactorEmail } from "../service/mail.service.js";
import {
  deletePendingRegistration,
  generateOTP,
  getPendingRegistration,
  recordFailedAttempt,
  savePendingRegistration,
} from "../service/otp.service.js";
import {
  issueSession,
  refreshTokenMatches,
  signAccessToken,
  verifyRefreshToken,
} from "../service/token.service.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_ROUNDS = 10;
const TWO_FACTOR_TTL_MS = 10 * 60 * 1000;

// Emails and usernames are stored lowercase, so compare them that way too
const normalizeEmail = (email) => String(email ?? "").toLowerCase().trim();
const normalizeUsername = (username) =>
  String(username ?? "").toLowerCase().trim();

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

// The signed-in user's own account details returned after any sign-in
const sessionUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  statusMessage: user.statusMessage,
  location: user.location,
  website: user.website,
  privacy: { showActivity: user.privacy?.showActivity !== false },
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
  authProvider: user.authProvider,
  twoFactorEnabled: user.twoFactorEnabled,
  createdAt: user.createdAt,
});

// Step 1: validate sign-up details and email a verification code
export const requestOTP = async (req, res) => {
  try {
    const { password } = req.body;
    const name = String(req.body.name ?? "").trim();
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);

    if (!email || !username || !password || !name) {
      return fail(res, 400, "All fields are required (name, username, email, password)");
    }
    if (!EMAIL_RE.test(email)) {
      return fail(res, 400, "Please provide a valid email address");
    }
    if (!USERNAME_RE.test(username)) {
      return fail(
        res,
        400,
        "Username must be 3-20 characters (letters, numbers, underscore only)",
      );
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return fail(res, 400, "Password must be at least 6 characters long");
    }
    if (name.length < 2) {
      return fail(res, 400, "Name must be at least 2 characters long");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return fail(
        res,
        400,
        existingUser.email === email ? "Email already exists" : "Username already taken",
      );
    }

    const otp = generateOTP();
    // Hash now so the plain password never sits in the pending-registration store
    const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
    await savePendingRegistration(email, { otp, name, username, passwordHash });

    await sendOtpEmail(email, otp, name);
    logger.info(`Verification code sent to ${email}`);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    logger.error("requestOTP failed", error);
    fail(res, 500, "Failed to send the verification code. Please try again.");
  }
};

// Step 2: confirm the code and create the account
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp ?? "").trim();

    if (!email || !otp) {
      return fail(res, 400, "Email and OTP are required");
    }

    const pending = await getPendingRegistration(email);
    if (!pending) {
      return fail(res, 400, "OTP expired or not found. Please request a new OTP");
    }
    if (Date.now() > pending.expiresAt) {
      await deletePendingRegistration(email);
      return fail(res, 400, "OTP has expired. Please request a new OTP");
    }

    if (pending.otp !== otp) {
      const lockedOut = await recordFailedAttempt(email, pending);
      return lockedOut
        ? fail(res, 429, "Too many incorrect attempts. Please request a new OTP.")
        : fail(res, 400, "Invalid OTP. Please try again.");
    }

    // Someone may have taken the email/username while the code was pending
    const existingUser = await User.findOne({
      $or: [{ email }, { username: pending.username }],
    });
    if (existingUser) {
      await deletePendingRegistration(email);
      return fail(res, 400, "User already exists with this email or username");
    }

    const newUser = await User.create({
      name: pending.name,
      username: pending.username,
      email,
      password: pending.passwordHash,
      authProvider: "LOCAL",
    });
    await deletePendingRegistration(email);

    const { accessToken, refreshToken } = issueSession(newUser);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to ChatsConnect.",
      user: sessionUser(newUser),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? { account: 1 })[0];
      return fail(res, 400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
    }
    logger.error("verifyOTPAndRegister failed", error);
    fail(res, 500, "Failed to create account. Please try again.");
  }
};

// Password sign-in (emails a one-time link instead when 2FA is on)
export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return fail(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user) {
      return fail(res, 401, "Invalid email or password");
    }
    if (user.authProvider !== "LOCAL") {
      return fail(
        res,
        401,
        `This account was created using ${user.authProvider}. Please use ${user.authProvider} to login.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
      return fail(res, 401, "Invalid email or password");
    }

    if (user.twoFactorEnabled) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.twoFactorToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.twoFactorTokenExpiry = new Date(Date.now() + TWO_FACTOR_TTL_MS);
      await user.save();

      const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-2fa?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
      await sendTwoFactorEmail(user.email, user.name, verificationUrl);

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        message:
          "A verification link has been sent to your email. It expires in 10 minutes.",
      });
    }

    const { accessToken, refreshToken } = issueSession(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: sessionUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("login failed", error);
    fail(res, 500, "Login failed. Please try again.");
  }
};

// Finish a 2FA sign-in from the emailed single-use link
export const verify2FA = async (req, res) => {
  try {
    const token = String(req.body.token ?? "");
    const email = normalizeEmail(req.body.email);

    if (!token || !email) {
      return fail(res, 400, "Token and email are required");
    }

    const user = await User.findOne({ email }).select(
      "+twoFactorToken +twoFactorTokenExpiry +refreshToken",
    );
    if (!user || !user.twoFactorToken || !user.twoFactorTokenExpiry) {
      return fail(res, 400, "Verification link is invalid or has already been used");
    }

    if (user.twoFactorTokenExpiry < new Date()) {
      user.twoFactorToken = undefined;
      user.twoFactorTokenExpiry = undefined;
      await user.save();
      return fail(res, 400, "Verification link has expired. Please log in again.");
    }

    // Constant-time comparison of the hashed tokens
    const incoming = crypto.createHash("sha256").update(token).digest();
    const stored = Buffer.from(user.twoFactorToken, "hex");
    const isValid =
      incoming.length === stored.length && crypto.timingSafeEqual(incoming, stored);
    if (!isValid) {
      return fail(res, 400, "Verification link is invalid");
    }

    // Single use
    user.twoFactorToken = undefined;
    user.twoFactorTokenExpiry = undefined;
    const { accessToken, refreshToken } = issueSession(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Two-factor authentication successful!",
      user: sessionUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("verify2FA failed", error);
    fail(res, 500, "Verification failed. Please try again.");
  }
};

// GitHub OAuth callback: start a session and hand the tokens to the client
export const githubCallback = async (req, res) => {
  const failureUrl = `${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Authentication failed")}`;
  try {
    const user = req.user;
    if (!user) return res.redirect(failureUrl);

    const { accessToken, refreshToken } = issueSession(user);
    await user.save();

    // Tokens go in the fragment — fragments are never sent to servers, so
    // they stay out of access logs and Referer headers
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback#accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  } catch (error) {
    logger.error("githubCallback failed", error);
    res.redirect(failureUrl);
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
      refreshToken: null,
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("logout failed", error);
    fail(res, 500, "Logout failed");
  }
};

// Exchange a refresh token for a new access token
export const refreshToken = async (req, res) => {
  try {
    const presented = req.body.refreshToken;
    if (!presented) {
      return fail(res, 401, "Refresh token required");
    }

    const decoded = verifyRefreshToken(presented);
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || !refreshTokenMatches(user.refreshToken, presented)) {
      return fail(res, 401, "Invalid refresh token");
    }

    res.status(200).json({ success: true, accessToken: signAccessToken(user._id) });
  } catch {
    fail(res, 401, "Invalid or expired refresh token");
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return fail(res, 400, "Both passwords are required");
    }
    if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return fail(res, 400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return fail(res, 404, "User not found");
    }
    if (user.authProvider !== "LOCAL") {
      return fail(res, 400, "Cannot change password for OAuth accounts");
    }

    const isValid = await bcrypt.compare(String(currentPassword), user.password);
    if (!isValid) {
      return fail(res, 401, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(String(newPassword), BCRYPT_ROUNDS);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    logger.error("changePassword failed", error);
    fail(res, 500, "Failed to change password");
  }
};

// Email a fresh code for a pending registration
export const resendOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return fail(res, 400, "Email is required");
    }

    const pending = await getPendingRegistration(email);
    if (!pending) {
      return fail(res, 400, "No registration in progress for this email");
    }

    const otp = generateOTP();
    await savePendingRegistration(email, { ...pending, otp, attempts: 0 });
    await sendOtpEmail(email, otp, pending.name);
    logger.info(`New verification code sent to ${email}`);

    res.status(200).json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    logger.error("resendOTP failed", error);
    fail(res, 500, "Failed to resend the code. Please try again.");
  }
};
