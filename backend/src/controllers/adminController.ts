import { Request, Response } from "express";
import prisma from "../config/db";
import logger from "../config/logger";
import { getOrSetCache } from "../middlewares/cacheMiddleware";

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    res.setHeader("Cache-Control", "private, max-age=60");

    const { value: data, source } = await getOrSetCache(
      "cache:/api/v1/admin/dashboard-stats",
      300,
      async () => {
        const activeCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const currentYearStart = new Date(new Date().getFullYear(), 0, 1);

        // Execute all 8 independent DB queries concurrently instead of 9 sequential round-trips,
        // and aggregate monthly revenue directly in PostgreSQL instead of fetching all Payment rows.
        const [
          revenueAgg,
          enrollments,
          users,
          active,
          colleges,
          instructors,
          monthlyRevenueRows,
          recentEnrollments,
          recentUsers,
        ] = await Promise.all([
          prisma.payment.aggregate({ _sum: { amount: true } }),
          prisma.enrollment.count(),
          prisma.user.count(),
          prisma.deviceSession.count({
            where: { lastActive: { gte: activeCutoff } },
          }),
          prisma.collegeInstitution.count(),
          prisma.user.count({ where: { role: "INSTRUCTOR" } }),
          prisma.$queryRaw<Array<{ month: number; revenue: number }>>`
            SELECT
              EXTRACT(MONTH FROM "createdAt")::int AS month,
              COALESCE(SUM(amount), 0)::double precision AS revenue
            FROM "Payment"
            WHERE "createdAt" >= ${currentYearStart}
            GROUP BY 1
          `,
          prisma.enrollment.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              createdAt: true,
              student: {
                select: {
                  email: true,
                  profile: { select: { firstName: true, lastName: true } },
                },
              },
              course: { select: { title: true } },
            },
          }),
          prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
              createdAt: true,
            },
          }),
        ]);

        const totalRevenue = revenueAgg._sum.amount || 0;

        const monthlyRevenue = Array(7).fill(0);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
        monthlyRevenueRows.forEach((row) => {
          const idx = Number(row.month) - 1;
          if (idx >= 0 && idx < 7) {
            monthlyRevenue[idx] = Number(row.revenue) || 0;
          }
        });

        const chartData = months.map((name, i) => ({
          name,
          revenue: monthlyRevenue[i],
        }));

        const activities = [
          ...recentEnrollments.map((e) => ({
            type: "ENROLLMENT",
            title: "New Enrollment",
            description: `${e.student?.profile?.firstName || e.student.email.split("@")[0]} enrolled in "${e.course?.title || "a course"}"`,
            timestamp: e.createdAt,
          })),
          ...recentUsers.map((u) => ({
            type: "USER",
            title: "New User Registration",
            description: `${u.profile?.firstName || u.email.split("@")[0]} registered on the platform`,
            timestamp: u.createdAt,
          })),
        ];

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const recentActivities = activities.slice(0, 10);

        return {
          revenue: totalRevenue,
          enrollments,
          users,
          active,
          colleges,
          instructors,
          chartData,
          recentActivities,
        };
      }
    );

    res.setHeader("X-Cache", source);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    logger.error(`Error fetching dashboard stats: ${error.message}`);
    return res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
};

export const getUserActivities = async (req: Request, res: Response): Promise<any> => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 500) : 200;
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        submissions: {
          where: { status: 'ACCEPTED' },
          select: {
            question: {
              select: { 
                id: true,
                difficulty: true 
              }
            }
          }
        },
        enrollments: {
          select: {
            id: true,
            status: true,
            progressPercentage: true,
            completedAt: true
          }
        },
        activityLogs: {
          where: { action: { startsWith: 'APTITUDE_SOLVED_' } },
          select: { action: true }
        }
      }
    });

    const activityData = users.map(user => {
      let dsaEasy = 0;
      let dsaMedium = 0;
      let dsaHard = 0;

      const solvedQuestions = new Set<string>();

      user.submissions.forEach(sub => {
        if (sub.question?.id && !solvedQuestions.has(sub.question.id)) {
          solvedQuestions.add(sub.question.id);
          const diff = sub.question.difficulty?.toUpperCase();
          if (diff === 'EASY') dsaEasy++;
          else if (diff === 'MEDIUM') dsaMedium++;
          else if (diff === 'HARD') dsaHard++;
        }
      });
      const dsaTotal = dsaEasy + dsaMedium + dsaHard;

      const coursesRegistered = user.enrollments.length;
      const coursesCompleted = user.enrollments.filter(e => 
        e.completedAt != null || e.progressPercentage === 100 || e.status === 'COMPLETED'
      ).length;

      const uniqueAptitude = new Set(user.activityLogs?.map(log => log.action));

      return {
        id: user.id,
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
        email: user.email,
        dsa: {
          total: dsaTotal,
          easy: dsaEasy,
          medium: dsaMedium,
          hard: dsaHard
        },
        aptitude: {
          total: uniqueAptitude.size
        },
        courses: {
          registered: coursesRegistered,
          completed: coursesCompleted
        }
      };
    });

    return res.status(200).json({ success: true, data: activityData });
  } catch (error: any) {
    logger.error(`Error fetching user activities: ${error.message}`);
    return res.status(500).json({ success: false, error: "Failed to fetch user activities" });
  }
};
