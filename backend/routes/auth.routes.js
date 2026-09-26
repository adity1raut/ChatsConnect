import express from "express";
import passport from "../config/passport.js";
import {
  requestOTP,
  verifyOTPAndRegister,
  login,
  verify2FA,
  logout,
  refreshToken,
  githubCallback,
  resendOTP,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// Local auth routes — rate limited against brute force and email spam
router.post("/request-otp", otpLimiter, requestOTP);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/verify-otp", authLimiter, verifyOTPAndRegister);
router.post("/login", authLimiter, login);
router.post("/verify-2fa", authLimiter, verify2FA);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.put("/change-password", protect, changePassword);

// GitHub OAuth routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Authentication failed")}`,
    session: false,
  }),
  githubCallback,
);

export default router;
