import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER || "araut7798@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "igmv poco lozo bsyn",
  },
});

export default transporter; 