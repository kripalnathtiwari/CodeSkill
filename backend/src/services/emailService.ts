import logger from "../config/logger";
import axios from "axios";

export class EmailService {
  private brevoApiKey: string | null = null;

  constructor() {
    this.brevoApiKey = process.env.BREVO_API_KEY || null;

    if (this.brevoApiKey) {
       logger.info("EmailService initialized with Brevo HTTP API Key.");
    } else {
      logger.info("EmailService initialized without Brevo API Key (MOCK MODE).");
    }
  }

  public async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    try {
      if (this.brevoApiKey) {
        // Railway blocks SMTP ports, so we use the HTTP API which is also much faster
        const response = await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: {
              name: "CodeSklii Security",
              email: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@codesklii.com"
            },
            to: [{ email: to }],
            subject: "Your Password Reset OTP",
            htmlContent: `<p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`
          },
          {
            headers: {
              "api-key": this.brevoApiKey,
              "Content-Type": "application/json"
            }
          }
        );
        logger.info(`OTP email sent via Brevo HTTP API to ${to}`);
        return true;
      } else {
        // MOCK MODE: Just log to console
        logger.warn(`[MOCK EMAIL] To: ${to} | Subject: Your Password Reset OTP`);
        logger.warn(`[MOCK EMAIL] Content: Your One-Time Password (OTP) is: ${otp}`);
        return true;
      }
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

export default new EmailService();
