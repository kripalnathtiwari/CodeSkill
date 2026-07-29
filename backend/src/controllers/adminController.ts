import { Request, Response } from "express";
import prisma from "../config/db";
import logger from "../config/logger";

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Total Revenue
    const revenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true }
    });
    const totalRevenue = revenueAgg._sum.amount || 0;

    // 2. Course Enrollments
    const enrollments = await prisma.enrollment.count();

    // 3. Registered Users
    const users = await prisma.user.count();

    // 4. Active Sandbox Sessions (active in last 24 hours)
    const active = await prisma.deviceSession.count({
      where: {
        lastActive: {
          gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // 5. Total Colleges
    const colleges = await prisma.collegeInstitution.count();

    // 6. Total Instructors
    const instructors = await prisma.user.count({
      where: { role: "INSTRUCTOR" }
    });

    // 7. Revenue Chart Data
    const payments = await prisma.payment.findMany({
      select: { amount: true, createdAt: true }
    });

    // Basic aggregation for the last 7 months of the year
    const monthlyRevenue = Array(7).fill(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    
    payments.forEach(p => {
        const month = p.createdAt.getMonth();
        if (month < 7) {
            monthlyRevenue[month] += p.amount;
        }
    });

    const chartData = months.map((name, i) => ({
      name,
      revenue: monthlyRevenue[i]
    }));

    return res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        enrollments,
        users,
        active,
        colleges,
        instructors,
        chartData
      }
    });
  } catch (error: any) {
    logger.error(`Error fetching dashboard stats: ${error.message}`);
    return res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
};

export const getUserActivities = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
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
