import logger from "../config/logger";
import nodemailer from "nodemailer";

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // If SMTP credentials are provided, setup real transporter
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.info("EmailService initialized with SMTP credentials.");
    } else {
      logger.info("EmailService initialized without SMTP credentials (MOCK MODE).");
    }
  }

  public async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"CodeSklii Security" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to,
          subject: "Your Password Reset OTP",
          text: `Your One-Time Password (OTP) for password reset is: ${otp}. It will expire in 5 minutes.`,
          html: `<p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`,
        });
        logger.info(`OTP email sent to ${to}`);
        return true;
      } else {
        // MOCK MODE: Just log to console
        logger.warn(`[MOCK EMAIL] To: ${to} | Subject: Your Password Reset OTP`);
        logger.warn(`[MOCK EMAIL] Content: Your One-Time Password (OTP) is: ${otp}`);
        return true;
      }
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }
}

export default new EmailService();
