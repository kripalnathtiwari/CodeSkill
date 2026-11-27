import prisma from "../config/db";
import { PermanentJobError } from "../lib/errors";

export interface AutoSubmitResult {
  attemptId: string;
  userId: string;
  testId: string;
  autoSubmitted: boolean;
  status: string;
}

export interface GradeExamResult {
  attemptId: string;
  userId: string;
  testId: string;
  score: number;
  maxScore: number;
  mcqScore: number;
  codingScore: number;
  alreadyGraded?: boolean;
}

export interface PublishResultOutput {
  attemptId: string;
  userId: string;
  testId: string;
  testTitle: string;
  userEmail: string;
  userName: string;
  score: number;
  maxScore: number;
  alreadyPublished?: boolean;
}

const parseJsonSafe = <T>(raw: unknown, fallback: T): T => {
  if (typeof raw !== "string") return (raw as T) ?? fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/**
 * Pure logic: auto-submits an exam attempt when timer expires.
 * Idempotent: ignores attempts already manually submitted, graded, or published.
 */
export const processAutoSubmitExamJob = async (attemptId: string): Promise<AutoSubmitResult> => {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, testId: true, status: true },
  });

  if (!attempt) {
    throw new PermanentJobError(`TestAttempt ${attemptId} not found`, "ATTEMPT_NOT_FOUND");
  }

  if (attempt.status !== "STARTED") {
    return {
      attemptId: attempt.id,
      userId: attempt.userId,
      testId: attempt.testId,
      autoSubmitted: false,
      status: attempt.status,
    };
  }

  // Optimistic concurrency: only transition if still STARTED (avoids race with manual submit)
  const { count } = await prisma.testAttempt.updateMany({
    where: { id: attemptId, status: "STARTED" },
    data: { status: "SUBMITTED", endTime: new Date() },
  });

  return {
    attemptId: attempt.id,
    userId: attempt.userId,
    testId: attempt.testId,
    autoSubmitted: count > 0,
    status: count > 0 ? "SUBMITTED" : attempt.status,
  };
};

/**
 * Pure logic: grades MCQs + aggregates best coding submission scores for an exam attempt.
 */
export const processGradeExamJob = async (attemptId: string): Promise<GradeExamResult> => {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: {
        include: {
          questions: {
            include: {
              question: {
                include: { mcqOptions: true },
              },
            },
          },
        },
      },
      submissions: true,
    },
  });

  if (!attempt) {
    throw new PermanentJobError(`TestAttempt ${attemptId} not found`, "ATTEMPT_NOT_FOUND");
  }

  if (attempt.status === "GRADED" || attempt.status === "PUBLISHED") {
    return {
      attemptId: attempt.id,
      userId: attempt.userId,
      testId: attempt.testId,
      score: attempt.score,
      maxScore: attempt.maxScore,
      mcqScore: attempt.mcqScore,
      codingScore: attempt.codingScore,
      alreadyGraded: true,
    };
  }

  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: { status: "GRADING", gradingError: null },
  });

  const mcqAnswersMap = parseJsonSafe<Record<string, string | string[]>>(attempt.mcqAnswers, {});

  // Keep highest pass ratio per coding questionId within this attempt
  const bestCodingByQuestion = new Map<string, { passed: number; total: number }>();
  for (const sub of attempt.submissions) {
    const prev = bestCodingByQuestion.get(sub.questionId);
    const ratio = sub.totalCount > 0 ? sub.passedCount / sub.totalCount : sub.status === "ACCEPTED" ? 1 : 0;
    const prevRatio = prev ? (prev.total > 0 ? prev.passed / prev.total : 0) : -1;
    if (ratio > prevRatio) {
      bestCodingByQuestion.set(sub.questionId, { passed: sub.passedCount, total: sub.totalCount });
    }
  }

  let mcqScore = 0;
  let codingScore = 0;
  let maxScore = 0;
  const breakdown: Array<Record<string, unknown>> = [];

  for (const tq of attempt.test.questions) {
    const q = tq.question;
    if (q.type === "MCQ") {
      const points = 4;
      maxScore += points;
      const mcq = q.mcqOptions[0];
      const expected = mcq ? parseJsonSafe<string[]>(mcq.correctAnswers, []) : [];
      const givenRaw = mcqAnswersMap[q.id];
      const given = Array.isArray(givenRaw) ? givenRaw : givenRaw ? [String(givenRaw)] : [];

      const isCorrect =
        expected.length > 0 &&
        expected.length === given.length &&
        expected.every((ans) => given.includes(ans));

      const earned = isCorrect ? points : 0;
      mcqScore += earned;
      breakdown.push({ questionId: q.id, type: "MCQ", earned, max: points });
    } else {
      const points = 10;
      maxScore += points;
      const best = bestCodingByQuestion.get(q.id);
      const earned =
        best && best.total > 0 ? Math.round((best.passed / best.total) * points) : 0;
      codingScore += earned;
      breakdown.push({ questionId: q.id, type: "CODING", earned, max: points });
    }
  }

  const totalScore = mcqScore + codingScore;

  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: {
      status: "GRADED",
      score: totalScore,
      maxScore,
      mcqScore,
      codingScore,
      resultBreakdown: breakdown as any,
    },
  });

  return {
    attemptId: attempt.id,
    userId: attempt.userId,
    testId: attempt.testId,
    score: totalScore,
    maxScore,
    mcqScore,
    codingScore,
  };
};

/**
 * Pure logic: publishes an exam result once and creates the student's notification record.
 */
export const processPublishExamResultJob = async (
  attemptId: string
): Promise<PublishResultOutput> => {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: { select: { id: true, title: true } },
      user: { select: { id: true, email: true, profile: { select: { firstName: true } } } },
    },
  });

  if (!attempt) {
    throw new PermanentJobError(`TestAttempt ${attemptId} not found`, "ATTEMPT_NOT_FOUND");
  }

  const userName = attempt.user.profile?.firstName || attempt.user.email.split("@")[0];

  if (attempt.status === "PUBLISHED" && attempt.publishedAt) {
    return {
      attemptId: attempt.id,
      userId: attempt.userId,
      testId: attempt.testId,
      testTitle: attempt.test.title,
      userEmail: attempt.user.email,
      userName,
      score: attempt.score,
      maxScore: attempt.maxScore,
      alreadyPublished: true,
    };
  }

  await prisma.$transaction([
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: attempt.userId,
        type: "EXAM_RESULT_PUBLISHED",
        title: `Result Published: ${attempt.test.title}`,
        message: `You scored ${attempt.score}/${attempt.maxScore} in ${attempt.test.title}.`,
      },
    }),
  ]);

  return {
    attemptId: attempt.id,
    userId: attempt.userId,
    testId: attempt.testId,
    testTitle: attempt.test.title,
    userEmail: attempt.user.email,
    userName,
    score: attempt.score,
    maxScore: attempt.maxScore,
  };
};
