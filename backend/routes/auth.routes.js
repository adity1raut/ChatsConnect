import express from "express";
import passport from "../config/passport.js";
import {
  requestOTP,
  verifyOTPAndRegister,
  login,
  logout,
  refreshToken,
  githubCallback,
} from "../controllers/auth.controller.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Local auth routes
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTPAndRegister);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

// GitHub OAuth routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=Authentication failed`,
    session: false 
  }),
  githubCallback
);

export default router;