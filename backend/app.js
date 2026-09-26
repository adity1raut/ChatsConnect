import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import messageRoutes from "./routes/message.routes.js";
import groupRoutes from "./routes/group.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import passport from "./config/passport.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Builds the HTTP app without connecting to anything, so tests can use it directly
export function createApp() {
  const app = express();
  // Azure App Service sits behind one proxy — trust it so req.ip is the client
  app.set("trust proxy", 1);

  // Middleware
  app.use(helmet());
  app.use(passport.initialize());
  // Avatar uploads arrive as base64 data URLs (client caps files at 5 MB ≈ 6.7 MB encoded)
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ extended: true, limit: "8mb" }));
  app.use(cookieParser());

  // CORS configuration — allow production frontend + localhost in dev
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://www.chatsconnect.tech",
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
  ].filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/friends", friendRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
  });

  // Unmatched routes, then every error as consistent JSON
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
