import test from "node:test";
import assert from "node:assert/strict";
import brevoService from "../services/brevoService";
import { processOtpEmailJob, processTransactionalEmailJob } from "../jobs/emailJob";
import { PermanentJobError } from "../lib/errors";

test("processOtpEmailJob drops stale OTP emails older than TTL without calling Brevo", async () => {
  let called = false;
  const originalSend = brevoService.sendEmail.bind(brevoService);

  brevoService.sendEmail = async () => {
    called = true;
    return { messageId: "unexpected" };
  };

  try {
    const result = await processOtpEmailJob({
      to: "student@example.com",
      otp: "123456",
      createdAt: Date.now() - 10 * 60 * 1000, // 10 minutes old
      ttlMs: 5 * 60 * 1000,
    });

    assert.equal(called, false);
    assert.equal(result.sent, false);
    assert.equal(result.dropped, true);
    assert.equal(result.reason, "OTP_EXPIRED");
  } finally {
    brevoService.sendEmail = originalSend;
  }
});

test("processOtpEmailJob dispatches fresh OTP emails through BrevoService", async () => {
  const sentPayloads: Array<{ to: string; subject: string; tags?: string[] }> = [];
  const originalSend = brevoService.sendEmail.bind(brevoService);

  brevoService.sendEmail = async (input) => {
    sentPayloads.push({ to: input.to, subject: input.subject, tags: input.tags });
    return { messageId: "msg-otp-1" };
  };

  try {
    const result = await processOtpEmailJob({
      to: "student@example.com",
      otp: "654321",
      createdAt: Date.now() - 10_000,
      ttlMs: 5 * 60 * 1000,
    });

    assert.equal(result.sent, true);
    assert.equal(result.messageId, "msg-otp-1");
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].to, "student@example.com");
    assert.deepEqual(sentPayloads[0].tags, ["otp"]);
  } finally {
    brevoService.sendEmail = originalSend;
  }
});

test("processTransactionalEmailJob sends welcome email and throws PermanentJobError on bad email", async () => {
  const originalSend = brevoService.sendEmail.bind(brevoService);

  brevoService.sendEmail = async (input) => {
    if (!input.to.includes("@")) {
      throw new PermanentJobError("Invalid email", "INVALID_EMAIL");
    }
    return { messageId: "msg-welcome-1" };
  };

  try {
    const ok = await processTransactionalEmailJob({
      type: "welcome",
      to: "newuser@example.com",
      userName: "Alex",
      data: {},
    });
    assert.equal(ok.sent, true);

    await assert.rejects(
      () =>
        processTransactionalEmailJob({
          type: "welcome",
          to: "not-an-email",
          data: {},
        }),
      (err: unknown) => err instanceof PermanentJobError
    );
  } finally {
    brevoService.sendEmail = originalSend;
  }
});
