import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error(
    "❌ Email credentials missing. Set EMAIL_USER and EMAIL_PASSWORD in .env\n" +
    "   For Gmail: enable 2-Step Verification → generate an App Password at\n" +
    "   https://myaccount.google.com/apppasswords"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "araut7798@gmail.com",
    pass: "igmv poco lozo bsyn",
  },
});

export default transporter;
