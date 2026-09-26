import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Credentials must come from the environment — never commit them to source.
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "EMAIL_USER / EMAIL_PASSWORD are not set — outgoing emails (OTP, security alerts) will fail.",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter;
