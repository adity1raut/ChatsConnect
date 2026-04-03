import crypto from "crypto";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../service/Nodemailer.js";

// Temporary store for OTPs (use Redis in production)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration - ChatConnect",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Welcome to ChatConnect!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #8b5cf6; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const send2FAEmail = async (email, name, verificationUrl) => {
  const mailOptions = {
    from: `"ChatConnect Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Login Verification Link - ChatConnect",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Two-Factor Authentication</h2>
        <p>Hi ${name},</p>
        <p>A login attempt was made on your ChatConnect account. Click the button below to verify it was you and complete sign-in.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
            style="background-color: #8b5cf6; color: #ffffff; padding: 14px 28px;
                   text-decoration: none; border-radius: 6px; font-size: 16px;
                   display: inline-block;">
            Verify and Sign In
          </a>
        </div>
        <p><strong>This link expires in 10 minutes and can only be used once.</strong></p>
        <p>If you did not attempt to log in, your password may be compromised. Change it immediately.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          If the button above does not work, copy and paste this URL into your browser:<br>
          <span style="color: #8b5cf6;">${verificationUrl}</span>
        </p>
        <p style="color: #6b7280; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Step 1: Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    // Validation
    if (!email || !username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, username, email, password)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be 3-20 characters (letters, numbers, underscore only)",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with user data (expires in 10 minutes)
    otpStore.set(email, {
      otp,
      name: name.trim(),
      username: username.toLowerCase().trim(),
      password,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP via email
    await sendOTP(email, otp, name);

    console.log(`OTP sent to ${email}: ${otp}`); // For development - remove in production

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP. Please try again.",
    });
  }
};

// Step 2: Verify OTP and Create Account
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Get stored OTP data
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP",
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Check if user was created in the meantime
    const existingUser = await User.findOne({
      $or: [{ email }, { username: storedData.username }],
    });

    if (existingUser) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(storedData.password, 10);

    // Generate default avatar (using UI Avatars)
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(storedData.name)}&background=8b5cf6&color=fff&size=200`;

    // Create user
    const newUser = await User.create({
      name: storedData.name,
      username: storedData.username,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: "LOCAL",
      avatar: defaultAvatar,
      isOnline: true,
      lastSeen: new Date(),
    });

    // Remove OTP from store
    otpStore.delete(email);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Save refresh token
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Remove sensitive data
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      bio: newUser.bio,
      isOnline: newUser.isOnline,
      lastSeen: newUser.lastSeen,
      authProvider: newUser.authProvider,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to ChatConnect.",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error in verifyOTPAndRegister:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.authProvider !== "LOCAL") {
      return res.status(401).json({
        success: false,
        message: `This account was created using ${user.authProvider}. Please use ${user.authProvider} to login.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 2FA: generate a verification link instead of issuing JWT
    if (user.twoFactorEnabled) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.twoFactorToken = hashedToken;
      user.twoFactorTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-2fa?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      await send2FAEmail(user.email, user.name, verificationUrl);

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        message:
          "A verification link has been sent to your email. It expires in 10 minutes.",
      });
    }

    // No 2FA — issue tokens directly
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    user.refreshToken = refreshToken;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed. Please try again.",
    });
  }
};

// Verify 2FA link and issue JWT
export const verify2FA = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+twoFactorToken +twoFactorTokenExpiry +refreshToken");

    if (!user || !user.twoFactorToken || !user.twoFactorTokenExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has already been used",
      });
    }

    // Check expiry before doing any crypto work
    if (user.twoFactorTokenExpiry < new Date()) {
      user.twoFactorToken = undefined;
      user.twoFactorTokenExpiry = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Verification link has expired. Please log in again.",
      });
    }

    // Hash the incoming raw token and compare with the stored hash
    const incomingHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const storedHash = user.twoFactorToken;

    // Constant-time comparison to prevent timing attacks
    const incomingBuf = Buffer.from(incomingHash, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");
    const isValid =
      incomingBuf.length === storedBuf.length &&
      crypto.timingSafeEqual(incomingBuf, storedBuf);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid",
      });
    }

    // Token is valid — clear it (single-use)
    user.twoFactorToken = undefined;
    user.twoFactorTokenExpiry = undefined;

    // Issue JWT
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    user.refreshToken = refreshToken;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      authProvider: user.authProvider,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Two-factor authentication successful!",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error in verify2FA:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

// GitHub OAuth Callback Handler
export const githubCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=Authentication failed`,
      );
    }

    // Generate tokens
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Update user status
    user.refreshToken = refreshToken;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  } catch (error) {
    console.error("Error in githubCallback:", error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
      refreshToken: null,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

// Change password controller
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.authProvider !== "LOCAL") {
      return res.status(400).json({
        success: false,
        message: "Cannot change password for OAuth accounts",
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to change password" });
  }
};

// Resend OTP (optional - for better UX)
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get stored data
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No registration in progress for this email",
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update stored data with new OTP and expiry
    otpStore.set(email, {
      ...storedData,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send new OTP via email
    await sendOTP(email, otp, storedData.name);

    console.log(`New OTP sent to ${email}: ${otp}`); // For development - remove in production

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again.",
    });
  }
};
