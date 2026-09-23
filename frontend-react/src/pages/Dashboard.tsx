import React from "react";
import { useAuth } from "../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Award, Lock } from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatCards from "../components/dashboard/StatCards";
import MyProgress from "../components/dashboard/MyProgress";
import LearningStreak from "../components/dashboard/LearningStreak";
import QuickActions from "../components/dashboard/QuickActions";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import RecentActivity from "../components/dashboard/RecentActivity";
import Recommendations from "../components/dashboard/Recommendations";
import Achievements from "../components/dashboard/Achievements";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Reuse existing logic to fetch stats for the new UI
  const { data: dsaStats = { total: 0 } } = useQuery({
    queryKey: ['dsaStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return { total: 0 };
      const solvedStr = localStorage.getItem(`solved_problems_progress_${user.email}`);
      if (!solvedStr) return { total: 0 };
      return { total: JSON.parse(solvedStr).length };
    },
    enabled: !!user?.email
  });

  const { data: enrollmentsData = [] } = useQuery({
    queryKey: ['enrollmentsData', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const existingStr = localStorage.getItem("enrolledCourses");
      if (!existingStr) return [];
      const parsed = JSON.parse(existingStr);
      return parsed.filter((e: any) => 
        e.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() || 
        e.accountEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim()
      ).sort((a: any, b: any) => new Date(b.dateRegistered || 0).getTime() - new Date(a.dateRegistered || 0).getTime());
    },
    enabled: !!user?.email
  });

  const { data: testStats = { attempted: 0, scores: [] } } = useQuery({
    queryKey: ['testStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return { attempted: 0, scores: [] };
      const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
      const myScores = allScores.filter((s: { studentEmail?: string }) => s.studentEmail === user.email);
      return { attempted: myScores.length, scores: myScores.reverse() };
    },
    enabled: !!user?.email
  });

  const { data: weeklyProgress = [] } = useQuery({
    queryKey: ['weeklyProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { getWeeklyProgress } = await import('../utils/progressTracker');
      return getWeeklyProgress(user.email);
    },
    enabled: !!user?.email
  });

  const { data: tagsProgress = [] } = useQuery({
    queryKey: ['tagsProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const solvedStr = localStorage.getItem(`solved_problems_progress_${user.email}`);
      if (!solvedStr) return [];
      const solvedIds = JSON.parse(solvedStr);
      if (!solvedIds.length) return [];
      
      try {
        const { getApiUrl } = await import('../utils/apiConfig');
        const axios = (await import('axios')).default;
        const res = await axios.get(getApiUrl("/api/v1/questions?limit=100&type=CODING"));
        const questions = res.data?.questions || res.data || [];
        
        const tagCounts: Record<string, number> = {};
        questions.forEach((q: any) => {
          if (solvedIds.includes(q.id) || solvedIds.includes(q._id) || solvedIds.includes(q.slug)) {
            let tags: string[] = [];
            if (Array.isArray(q.tags)) tags = q.tags;
            else if (typeof q.tags === 'string') {
              try { tags = JSON.parse(q.tags); } catch { tags = []; }
            }
            if (tags.length === 0) tags = ["General"];
            tags.forEach((t: string) => {
              tagCounts[t] = (tagCounts[t] || 0) + 1;
            });
          }
        });
        
        return Object.entries(tagCounts)
          .map(([name, count]) => ({ name, value: count }))
          .sort((a, b) => b.value - a.value);
      } catch (e) {
         return [{ name: "Arrays", value: Math.floor(solvedIds.length/2) }, { name: "Strings", value: Math.ceil(solvedIds.length/2) }];
      }
    },
    enabled: !!user?.email
  });

  React.useEffect(() => {
    if (user?.email) {
      import('../utils/progressTracker').then(({ recordLogin }) => {
        recordLogin(user.email);
        queryClient.invalidateQueries({ queryKey: ['weeklyProgress', user.email] });
      });
    }
  }, [user?.email, queryClient]);

  const { data: userRank = null } = useQuery({
    queryKey: ['userRank', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
      const studentTotals: Record<string, { score: number }> = {};
      
      allScores.forEach((s: { studentEmail?: string, studentName?: string, score?: string | number }) => {
        const email = s.studentEmail || s.studentName;
        if (email) {
          if (!studentTotals[email]) studentTotals[email] = { score: 0 };
          studentTotals[email].score += (Number(s.score) || 0);
        }
      });
      
      if (!studentTotals[user.email]) studentTotals[user.email] = { score: 0 };
      const sortedEmails = Object.keys(studentTotals).sort((a, b) => studentTotals[b].score - studentTotals[a].score);
      const myRankIndex = sortedEmails.indexOf(user.email);
      
      return myRankIndex !== -1 ? myRankIndex + 1 : null;
    },
    enabled: !!user?.email
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
        
        {/* Top Banner */}
        <WelcomeBanner solvedCount={dsaStats.total} />

        {/* 5 Stat Cards */}
        <StatCards 
          enrolledCount={enrollmentsData.length}
          testsAttempted={testStats.attempted}
          problemsSolved={dsaStats.total}
          globalRank={userRank}
        />

        {/* Grid Layout for Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Row 1 */}
          <div className="lg:col-span-1">
            <MyProgress enrollments={enrollmentsData} practiceProgress={tagsProgress} />
          </div>
          
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="flex-1">
              <LearningStreak weeklyProgress={weeklyProgress} />
            </div>
            <div className="flex-1">
              <QuickActions />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <DashboardCalendar userEmail={user?.email || ''} />
          </div>

          {/* Row 2 */}
          <div className="lg:col-span-1">
            <RecentActivity enrollments={enrollmentsData} testScores={testStats.scores} />
          </div>
          
          <div className="lg:col-span-1">
            <Recommendations />
          </div>
          
          <div className="lg:col-span-1">
            <Achievements 
              dsaTotal={dsaStats.total} 
              enrollmentTotal={enrollmentsData.length}
              testTotal={testStats.attempted}
              weeklyProgress={weeklyProgress} 
            />
          </div>
          
        </div>

        {/* Instructor Profile & Account Settings (Restored from previous version) */}
        {user?.role === "INSTRUCTOR" && (
          <div className="space-y-6 mt-8">
            <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Instructor Profile</h2>
              </div>
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="w-24 h-24 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-4xl shadow-inner border border-primary/20">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-text-primary">
                    {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0]}
                  </p>
                  <p className="text-text-secondary">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Account Security</h2>
              </div>
              <p className="text-text-muted text-sm">Use the settings page to change your password.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
