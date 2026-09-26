import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Validate configuration
const validateCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary configuration is incomplete. Please check your environment variables.",
    );
  }

  return true;
};

// Test connection
const testCloudinaryConnection = async () => {
  try {
    await cloudinary.api.ping();
    logger.info("✅ Cloudinary connection successful");
    return true;
  } catch (error) {
    logger.error("❌ Cloudinary connection failed:", error.message);
    return false;
  }
};

export { cloudinary, validateCloudinaryConfig, testCloudinaryConnection };
