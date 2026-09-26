import transporter from "./Nodemailer.js";

// User-supplied values (names) must never be interpreted as HTML in emails
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch],
  );

const layout = (body) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    ${body}
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #6b7280; font-size: 12px;">This is an automated message, please do not reply.</p>
  </div>`;

export async function sendOtpEmail(email, otp, name) {
  await transporter.sendMail({
    from: `"ChatsConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code - ChatsConnect",
    html: layout(`
      <h2 style="color: #8b5cf6;">Welcome to ChatsConnect!</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for signing up. Use this code to verify your email address:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #8b5cf6; font-size: 32px; letter-spacing: 5px; margin: 0;">${escapeHtml(otp)}</h1>
      </div>
      <p><strong>This code expires in 10 minutes.</strong></p>
      <p>If you didn't request this, you can ignore this email.</p>`),
  });
}

export async function sendTwoFactorEmail(email, name, verificationUrl) {
  const url = escapeHtml(verificationUrl);
  await transporter.sendMail({
    from: `"ChatsConnect Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your sign-in link - ChatsConnect",
    html: layout(`
      <h2 style="color: #8b5cf6;">Confirm it's you</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Someone is signing in to your ChatsConnect account. If it's you, confirm below to finish signing in.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}"
          style="background-color: #8b5cf6; color: #ffffff; padding: 14px 28px;
                 text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
          Verify and sign in
        </a>
      </div>
      <p><strong>This link expires in 10 minutes and works once.</strong></p>
      <p>If this wasn't you, change your password immediately.</p>
      <p style="color: #6b7280; font-size: 12px;">
        If the button doesn't work, paste this URL into your browser:<br>
        <span style="color: #8b5cf6;">${url}</span>
      </p>`),
  });
}
