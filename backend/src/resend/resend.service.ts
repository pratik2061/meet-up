import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private resend: Resend;
    private fromEmail: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY')!;
        this.resend = new Resend(apiKey);
        this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL')!;
    }

    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
        try {
            const subject = 'MeetUp Account Security: Password Reset Request';
            const plainText = [
                'MeetUp Security Alert',
                '',
                'We received a request to reset the password for your MeetUp account.',
                '',
                'Click the link below to set a new password (valid for 15 minutes):',
                resetLink,
                '',
                'If you did not make this request, you can safely ignore this email.',
                'Your password will remain unchanged.',
                '',
                '© ' + new Date().getFullYear() + ' MeetUp Inc. All rights reserved.',
            ].join('\n');

            const { error } = await this.resend.emails.send({
                from: `MeetUp Security <${this.fromEmail}>`,
                to: [to],
                replyTo: this.fromEmail,
                subject: subject,
                text: plainText,
                html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <!-- Hidden preheader text to prevent spam snippet issues -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    Use this verification link to securely reset your MeetUp account password.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 700; color: #4f46e5; letter-spacing: -0.5px;">MeetUp</span>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; background-color: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 999px; margin-left: 8px; letter-spacing: 0.5px;">Security</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0; letter-spacing: -0.3px;">
                Password Reset Verification
              </h1>
              
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 20px 0;">
                Hello,
              </p>
              
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                We received a request to reset the password associated with your MeetUp account. To choose a new password, click the button below:
              </p>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #4f46e5;">
                    <a href="${resetLink}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 28px; display: inline-block; border-radius: 8px; letter-spacing: 0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
                <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0;">
                  ⏱ <strong>Time-sensitive:</strong> This security link will expire in <strong>15 minutes</strong>. After that, you will need to request a new one.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 24px 0 0 0;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 11px; line-height: 16px; color: #6366f1; word-break: break-all; margin: 4px 0 0 0;">
                <a href="${resetLink}" style="color: #4f46e5; text-decoration: underline;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0 0 8px 0;">
                If you did not request a password reset, you can safely disregard this email. Your password will remain unchanged and your account is secure.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0 0;">
                © ${new Date().getFullYear()} MeetUp Inc. • Automated security notification
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

            if (error) {
                throw new Error(error.message);
            }
        } catch (err: any) {
            console.error('Failed to send reset email:', err);
            throw new InternalServerErrorException('Failed to send reset password email');
        }
    }
}
