import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || "araut7798@gmail.com";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "dlopcaeamcjnzgyo";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter;
