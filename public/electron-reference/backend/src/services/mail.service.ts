import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendInvitationEmail = async (
  email: string,
  inviteToken: string,
  companyName: string
) => {
  const inviteUrl = `${env.FRONTEND_URL}/invite/${inviteToken}`;

  await transporter.sendMail({
    from: `"${companyName}" <${env.SMTP_USER}>`,
    to: email,
    subject: `You're Invited to Join ${companyName}`,
    html: `
      <h2>You're Invited 🎉</h2>
      <p>You have been invited to join <b>${companyName}</b></p>
      <a href="${inviteUrl}"
         style="padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:5px;">
         Accept Invitation
      </a>
    `,
  });
};
