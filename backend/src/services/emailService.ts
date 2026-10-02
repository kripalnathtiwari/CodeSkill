import logger from "../config/logger";
import axios, { AxiosError } from "axios";

export class EmailService {
  private brevoApiKey: string | null = null;
  private senderEmail: string;

  constructor() {
    this.brevoApiKey = process.env.BREVO_API_KEY || null;
    this.senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@codesklii.com";

    if (this.brevoApiKey) {
       logger.info("EmailService initialized with Brevo HTTP API Key.");
    } else {
       logger.info("EmailService initialized without Brevo API Key (MOCK MODE).");
    }
  }

  public async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    try {
      if (this.brevoApiKey) {
        // Railway and many modern PaaS providers block SMTP ports (e.g., 25), 
        // and outbound IPs are dynamic, making static IP whitelisting impractical.
        // We use the HTTP API as it is faster and bypasses SMTP port blocking.
        const response = await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: {
              name: "CodeSklii Security",
              email: this.senderEmail
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
        logger.info(`OTP email successfully sent via Brevo HTTP API to ${to}`);
        return true;
      } else {
        // MOCK MODE: Just log to console, used for local development
        logger.warn(`[MOCK EMAIL] To: ${to} | Subject: Your Password Reset OTP`);
        logger.warn(`[MOCK EMAIL] Content: Your One-Time Password (OTP) is: ${otp}`);
        return true;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        // Safely extract the error message without logging headers or config which contain the API key
        const errorMessage = (axiosError.response?.data as any)?.message || axiosError.message;
        const statusCode = axiosError.response?.status || 'Unknown Status';
        
        logger.error(`Brevo API Error (${statusCode}) when sending email to ${to}: ${errorMessage}`);
      } else {
        const err = error as Error;
        logger.error(`Unexpected error sending email to ${to}: ${err.message}`);
      }
      return false;
    }
  }
}

export default new EmailService();
