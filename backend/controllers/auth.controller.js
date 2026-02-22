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

// Step 1: Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, username, and password are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already taken" 
        });
      }
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Validate username
    if (username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: "Username must be at least 3 characters long" 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with user data (expires in 10 minutes)
    otpStore.set(email, {
      otp,
      username,
      password,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP via email
    await sendOTP(email, otp, username);

    res.status(200).json({ 
      success: true, 
      message: "OTP sent to your email. Please check your inbox." 
    });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send OTP. Please try again." 
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
        message: "Email and OTP are required" 
      });
    }

    // Get stored OTP data
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP expired or not found. Please request a new OTP" 
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please request a new OTP" 
      });
    }

    // Verify OTP
    if (storedData.otp !== otp.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP. Please try again." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(storedData.password, 10);

    // Generate default avatar (using UI Avatars)
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(storedData.username)}&background=8b5cf6&color=fff&size=200`;

    // Create user
    const newUser = await User.create({
      name: storedData.username,
      username: storedData.username,
      email,
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
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
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
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create account. Please try again." 
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
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    if (user.authProvider !== "LOCAL") {
      return res.status(401).json({ 
        success: false, 
        message: `This account was created using ${user.authProvider}. Please use ${user.authProvider} to login.` 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
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
      message: error.message || "Login failed. Please try again." 
    });
  }
};

// GitHub OAuth Callback Handler
export const githubCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=Authentication failed`
      );
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    console.error("Error in githubCallback:", error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=Authentication failed`
    );
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const { userId } = req.user;

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
      message: "Logout failed" 
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
        message: "Refresh token required" 
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid refresh token" 
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired refresh token" 
    });
  }
};