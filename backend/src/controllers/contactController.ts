import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import logger from '../config/logger';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.error("SMTP credentials not configured in environment variables.");
      return res.status(500).json({ error: "Email service is not configured on the server." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: email,
      to: 'saurabhtiwari08071999@gmail.com',
      subject: `New Contact Us Message from ${name}`,
      text: `You have received a new message from the CodeSkill Contact Us form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #10b981;">New Contact Us Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    logger.error("Error sending contact email:", error);
    res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
};
