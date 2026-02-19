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
  const inviteUrl = `${env.FRONTEND_URL}/signup?token=${inviteToken}`;

  await transporter.verify();
  console.log("SMTP READY");

  await transporter.sendMail({
    from: `"${companyName}" <${env.SMTP_USER}>`,
    to: email,
    subject: `Official Invitation to Join ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invitation</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
          <tr>
            <td align="center">
              
              <table width="600" cellpadding="0" cellspacing="0" 
                style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background:#4f46e5;padding:30px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;">
                      ${companyName}
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    
                    <h2 style="margin-top:0;color:#111827;">
                      You're Invited to Join Our Team
                    </h2>

                    <p style="color:#4b5563;font-size:15px;line-height:1.6;">
                      We are pleased to inform you that you have been officially invited 
                      to join <strong>${companyName}</strong>. 
                      This invitation grants you access to our platform where you can 
                      collaborate, manage tasks, and be part of our growing organization.
                    </p>

                    <p style="color:#4b5563;font-size:15px;line-height:1.6;">
                      To accept this invitation and activate your account, please click 
                      the button below:
                    </p>

                    <div style="text-align:center;margin:30px 0;">
                      <a href="${inviteUrl}"
                        style="display:inline-block;padding:14px 28px;
                               background:#4f46e5;color:#ffffff;
                               text-decoration:none;font-weight:bold;
                               border-radius:6px;font-size:14px;">
                        Accept Invitation
                      </a>
                    </div>

                    <p style="color:#6b7280;font-size:13px;line-height:1.6;">
                      If the button above does not work, copy and paste the following link 
                      into your browser:
                    </p>

                    <p style="word-break:break-all;color:#4f46e5;font-size:13px;">
                      ${inviteUrl}
                    </p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

                    <p style="color:#9ca3af;font-size:12px;line-height:1.6;">
                      This invitation link may expire for security reasons. 
                      If you did not expect this invitation, please ignore this email.
                    </p>

                    <p style="color:#9ca3af;font-size:12px;">
                      For assistance, please contact the administrator of ${companyName}.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:20px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      © ${new Date().getFullYear()} ${companyName}. 
                      All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
    `,
  });
};
