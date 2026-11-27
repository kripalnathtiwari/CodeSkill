import axios, { AxiosError } from "axios";
import logger from "../lib/logger";
import { PermanentJobError, RateLimitError, RetryableServiceError } from "../lib/errors";

export interface SendBrevoEmailInput {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  tags?: string[];
}

/**
 * Brevo HTTP API v3 client.
 * Classifies client config/payload errors (400/401/403) as PermanentJobError
 * and rate limits / server errors (429/5xx/timeouts) as retryable errors for BullMQ.
 */
export class BrevoService {
  private readonly apiKey: string | null;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY?.trim() || null;
    this.senderEmail =
      process.env.BREVO_SENDER_EMAIL ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      "no-reply@codeskill.in";
    this.senderName = process.env.BREVO_SENDER_NAME || "CodeSkill LMS";
  }

  public async sendEmail(input: SendBrevoEmailInput): Promise<{ messageId: string }> {
    if (!input.to || !input.to.includes("@")) {
      throw new PermanentJobError(`Invalid recipient email address: ${input.to}`, "INVALID_EMAIL");
    }

    if (!this.apiKey) {
      if (process.env.NODE_ENV === "production") {
        throw new PermanentJobError("BREVO_API_KEY is missing in production", "MISSING_BREVO_KEY");
      }
      logger.warn("[BrevoService] Mock email dispatched (no BREVO_API_KEY configured)", {
        to: input.to,
        subject: input.subject,
        tags: input.tags,
      });
      return { messageId: `mock-${Date.now()}` };
    }

    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: input.to, ...(input.toName ? { name: input.toName } : {}) }],
          subject: input.subject,
          htmlContent: input.htmlContent,
          ...(input.tags?.length ? { tags: input.tags } : {}),
        },
        {
          timeout: 10_000,
          headers: {
            "api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return { messageId: String(response.data?.messageId || "sent") };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        const status = axiosErr.response?.status;
        const message = axiosErr.response?.data?.message || axiosErr.message;

        if (status === 429) {
          throw new RateLimitError(`Brevo rate limit exceeded: ${message}`);
        }
        if (status && status >= 400 && status < 500) {
          throw new PermanentJobError(`Brevo rejected email (${status}): ${message}`, `BREVO_${status}`);
        }
        throw new RetryableServiceError(`Brevo transient failure (${status || "NETWORK"}): ${message}`, status);
      }

      throw new RetryableServiceError(`Unexpected Brevo error: ${(error as Error).message}`);
    }
  }
}

export const brevoService = new BrevoService();
export default brevoService;
