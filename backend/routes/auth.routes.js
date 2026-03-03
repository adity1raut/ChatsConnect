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
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Local auth routes
router.post("/request-otp", requestOTP);
router.post("/resend-otp", resendOTP);
router.post("/verify-otp", verifyOTPAndRegister);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.put("/change-password", protect, changePassword);

// GitHub OAuth routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=Authentication failed`,
    session: false,
  }),
  githubCallback
);

export default router;
