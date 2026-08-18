import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../config/logger';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      logger.error("BREVO_API_KEY not configured in environment variables.");
      return res.status(500).json({ error: "Email service is not configured on the server." });
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: name,
          email: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@codesklii.com"
        },
        replyTo: { email: email },
        to: [{ email: 'saurabhtiwari08071999@gmail.com' }],
        subject: `New Contact Us Message from ${name}`,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #10b981;">New Contact Us Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr />
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `
      },
      {
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error: any) {
    logger.error("Error sending contact email:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
};
