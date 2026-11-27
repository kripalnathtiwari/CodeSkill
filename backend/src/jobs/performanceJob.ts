import prisma from "../config/db";
import { getCacheRedis } from "../lib/redis";
import { PermanentJobError } from "../lib/errors";

export interface RecomputeStatsOutput {
  userId: string;
  totalSolved: number;
  xp: number;
  level: number;
  codingRating: number;
}

/**
 * Pure business logic: recomputes student performance stats, XP, level,
 * sync record, and optional Cache Redis leaderboard score.
 */
export const processRecomputeStudentStatsJob = async (
  userId: string
): Promise<RecomputeStatsOutput> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new PermanentJobError(`User ${userId} not found`, "USER_NOT_FOUND");
  }

  const [acceptedCoding, acceptedMcq, gradedAttempts] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, status: "ACCEPTED", question: { type: { not: "MCQ" } } },
      distinct: ["questionId"],
      select: { questionId: true },
    }),
    prisma.submission.findMany({
      where: { userId, status: "ACCEPTED", question: { type: "MCQ" } },
      distinct: ["questionId"],
      select: { questionId: true },
    }),
    prisma.testAttempt.findMany({
      where: { userId, status: { in: ["GRADED", "PUBLISHED"] } },
      select: { score: true },
    }),
  ]);

  const totalSolved = acceptedCoding.length;
  const examBonusXp = gradedAttempts.reduce((sum, a) => sum + a.score, 0);
  const xp = totalSolved * 20 + acceptedMcq.length * 5 + examBonusXp;
  const level = Math.floor(xp / 100) + 1;
  const codingRating = 1500 + totalSolved * 10 + Math.round(examBonusXp / 2);

  await prisma.profile.updateMany({
    where: { userId },
    data: { totalSolved, xp, level, codingRating },
  });

  await prisma.userProgressSync.upsert({
    where: { userId },
    create: {
      userId,
      dsaSolved: acceptedCoding.map((item) => item.questionId),
    },
    update: {
      dsaSolved: acceptedCoding.map((item) => item.questionId),
    },
  });

  // Update leaderboard cache sorted set without coupling Postgres correctness to Redis
  const cacheRedis = getCacheRedis();
  if (cacheRedis) {
    await cacheRedis.zadd("cache:leaderboard:xp", xp, userId).catch(() => {});
    await cacheRedis.del(`cache:user-progress:${userId}`).catch(() => {});
  }

  return { userId, totalSolved, xp, level, codingRating };
};

/**
 * Pure logic for scheduled daily/weekly performance summary snapshots.
 */
export const processPerformanceReportJob = async (
  period: "DAILY" | "WEEKLY"
): Promise<{ reportId: string; period: string; summary: Record<string, unknown> }> => {
  const lookbackMs = period === "DAILY" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - lookbackMs);

  const [totalSubmissions, acceptedSubmissions, completedAttempts, newUsers] = await Promise.all([
    prisma.submission.count({ where: { createdAt: { gte: since } } }),
    prisma.submission.count({ where: { createdAt: { gte: since }, status: "ACCEPTED" } }),
    prisma.testAttempt.count({ where: { endTime: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
  ]);

  const acceptanceRate =
    totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

  const summary = {
    period,
    windowStart: since.toISOString(),
    windowEnd: new Date().toISOString(),
    totalSubmissions,
    acceptedSubmissions,
    acceptanceRate,
    completedAttempts,
    newUsers,
  };

  const record = await prisma.backgroundJob.create({
    data: {
      type: period === "DAILY" ? "DAILY_REPORT" : "WEEKLY_REPORT",
      status: "DONE",
      progress: 100,
      completedAt: new Date(),
      metadata: summary as any,
    },
  });

  return { reportId: record.id, period, summary };
};
