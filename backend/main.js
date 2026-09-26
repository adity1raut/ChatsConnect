// Must be the first import: ES modules evaluate imports before this file's
// body, so later modules would otherwise read process.env before .env loads.
import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app.js";
import ConnectDB from "./db/ConnectDB.js";
import { initSocket } from "./socket/socket.js";
import { initRedis } from "./cache/redis.js";
import logger from "./utils/logger.js";

// Refuse to start without the secrets that protect every session
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length) {
  logger.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = createApp();
const httpServer = createServer(app);

ConnectDB();
initRedis();
initSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
