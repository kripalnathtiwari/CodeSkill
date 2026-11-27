import brevoService from "../services/brevoService";
import logger from "../lib/logger";

export const DEFAULT_OTP_TTL_MS = 5 * 60 * 1000;

export interface OtpEmailJobInput {
  to: string;
  otp: string;
  createdAt: number;
  ttlMs?: number;
}

export interface TransactionalEmailJobInput {
  type: "welcome" | "enrollment" | "result-published";
  to: string;
  userName?: string;
  data: Record<string, string>;
}

/**
 * Pure business logic for sending OTP emails.
 * Enforces strict OTP TTL inside the worker: stale jobs are dropped instead of
 * spamming the user with an expired code.
 */
export const processOtpEmailJob = async (
  input: OtpEmailJobInput
): Promise<{ sent: boolean; dropped?: boolean; reason?: string; messageId?: string }> => {
  const ttlMs = input.ttlMs ?? DEFAULT_OTP_TTL_MS;
  const ageMs = Date.now() - input.createdAt;

  if (ageMs > ttlMs) {
    logger.warn("Dropping expired OTP email job", {
      to: input.to,
      ageMs,
      ttlMs,
    });
    return { sent: false, dropped: true, reason: "OTP_EXPIRED" };
  }

  const minutesValid = Math.max(1, Math.round(ttlMs / 60_000));
  const { messageId } = await brevoService.sendEmail({
    to: input.to,
    subject: "Your CodeSkill Verification OTP",
    tags: ["otp"],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #059669; margin-bottom: 12px;">CodeSkill Verification Code</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827;">${input.otp}</p>
        <p style="color: #6b7280; font-size: 13px;">This code expires in ${minutesValid} minutes. Do not share it with anyone.</p>
      </div>
    `,
  });

  return { sent: true, messageId };
};

/**
 * Pure business logic for transactional emails (welcome, enrollment, result published).
 */
export const processTransactionalEmailJob = async (
  input: TransactionalEmailJobInput
): Promise<{ sent: boolean; messageId: string }> => {
  const greetingName = input.userName || input.data.name || "Learner";

  let subject = "CodeSkill Notification";
  let htmlContent = "";

  switch (input.type) {
    case "welcome":
      subject = "Welcome to CodeSkill!";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #059669;">Welcome to CodeSkill, ${greetingName}!</h2>
          <p>Your account is ready. Start practicing coding problems, taking assessments, and tracking your progress.</p>
        </div>
      `;
      break;

    case "enrollment":
      subject = `Enrollment Confirmed: ${input.data.courseTitle || "CodeSkill Course"}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #059669;">Enrollment Confirmed</h2>
          <p>Hi ${greetingName}, you are now enrolled in <strong>${input.data.courseTitle || "your course"}</strong>.</p>
        </div>
      `;
      break;

    case "result-published":
      subject = `Results Published: ${input.data.testTitle || "CodeSkill Exam"}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #059669;">Exam Results Published</h2>
          <p>Hi ${greetingName}, your results for <strong>${input.data.testTitle || "your assessment"}</strong> are now available.</p>
          <p><strong>Score:</strong> ${input.data.score ?? "0"} / ${input.data.maxScore ?? "0"}</p>
        </div>
      `;
      break;
  }

  const { messageId } = await brevoService.sendEmail({
    to: input.to,
    toName: input.userName,
    subject,
    htmlContent,
    tags: [input.type],
  });

  return { sent: true, messageId };
};
