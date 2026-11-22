import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from './apiConfig';

export interface UserProgressData {
  dsaSolved: string[];
  aptitudeAnalytics: any[];
  otherAnalytics: any[];
  testScores: any[];
  enrolledCourses: any[];
  dailyProgress: Record<string, any>;
}

// In-flight request deduplication map to prevent multiple simultaneous progress requests
let activeFetchPromise: Promise<UserProgressData | null> | null = null;

/**
 * Fetch authoritative user progress directly from PostgreSQL database via API.
 * Deduplicates in-flight requests and synchronizes local device storage.
 */
export async function fetchUserProgressFromDB(userEmail?: string): Promise<UserProgressData | null> {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const res = await axios.get(getApiUrl('/api/v1/auth/user-progress'), {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });

      const data: UserProgressData = res.data;
      if (userEmail && data) {
        const emailLower = userEmail.toLowerCase().trim();

        // Synchronize local storage cache with database truth
        if (Array.isArray(data.dsaSolved)) {
          localStorage.setItem(`codeskill_dsa_solved_${emailLower}`, JSON.stringify(data.dsaSolved));
          localStorage.setItem(`solved_problems_progress_${emailLower}`, JSON.stringify(data.dsaSolved));
        }

        if (Array.isArray(data.aptitudeAnalytics)) {
          localStorage.setItem(`aptitude_analytics_${emailLower}`, JSON.stringify(data.aptitudeAnalytics));
        }

        if (Array.isArray(data.otherAnalytics)) {
          localStorage.setItem(`other_practice_analytics_${emailLower}`, JSON.stringify(data.otherAnalytics));
        }

        if (Array.isArray(data.dailyProgress)) {
          localStorage.setItem(`daily_progress_${emailLower}`, JSON.stringify(data.dailyProgress));
        } else if (data.dailyProgress && typeof data.dailyProgress === 'object') {
          localStorage.setItem(`daily_progress_${emailLower}`, JSON.stringify(data.dailyProgress));
        }

        // Merge test scores
        if (Array.isArray(data.testScores)) {
          try {
            const localScores = JSON.parse(localStorage.getItem('all_student_scores') || '[]');
            const scoreMap = new Map<string, any>();
            localScores.forEach((s: any) => {
              const key = String(s.id || `${s.testId}_${s.studentEmail || ''}_${s.timestamp || ''}`);
              scoreMap.set(key, s);
            });
            data.testScores.forEach((s: any) => {
              const key = String(s.id || `${s.testId}_${s.studentEmail || ''}_${s.timestamp || ''}`);
              scoreMap.set(key, s);
            });
            localStorage.setItem('all_student_scores', JSON.stringify(Array.from(scoreMap.values())));
          } catch (e) {
            localStorage.setItem('all_student_scores', JSON.stringify(data.testScores));
          }
        }

        // Merge enrolled courses
        if (Array.isArray(data.enrolledCourses)) {
          try {
            const localCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
            const courseMap = new Map<string, any>();
            localCourses.forEach((c: any) => {
              const key = String(c.courseId || c.id || c.title || c.courseTitle);
              if (key) courseMap.set(key, c);
            });
            data.enrolledCourses.forEach((c: any) => {
              const key = String(c.courseId || c.id || c.title || c.courseTitle);
              if (key) courseMap.set(key, c);
            });
            localStorage.setItem('enrolledCourses', JSON.stringify(Array.from(courseMap.values())));
          } catch (e) {
            localStorage.setItem('enrolledCourses', JSON.stringify(data.enrolledCourses));
          }
        }
      }

      return data;
    } catch (error) {
      console.warn('Could not fetch user progress from DB, falling back to local cache', error);
      return null;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

/**
 * Centralized TanStack React Query hook for user progress.
 * Caches progress across all sections (Dashboard, Problems, YourPerformance)
 * with a 3-minute staleTime and 10-minute gcTime to eliminate redundant API calls on navigation.
 */
export function useUserProgress(userEmail?: string) {
  const emailKey = userEmail ? userEmail.toLowerCase().trim() : null;
  return useQuery({
    queryKey: ['userProgress', emailKey],
    enabled: Boolean(emailKey && localStorage.getItem('accessToken')),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!userEmail) return null;
      return await fetchUserProgressFromDB(userEmail);
    },
  });
}

/**
 * Synchronize local device progress up to the PostgreSQL database.
 */
export async function syncLocalProgressToDB(userEmail: string): Promise<UserProgressData | null> {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail) return null;

  const emailLower = userEmail.toLowerCase().trim();

  // Gather whatever progress exists in local storage on this device
  let dsaSolved: string[] = [];
  try {
    const raw = localStorage.getItem(`codeskill_dsa_solved_${emailLower}`) ||
                localStorage.getItem(`codeskill_dsa_solved_${userEmail}`);
    if (raw) dsaSolved = JSON.parse(raw);
  } catch (e) {}

  let aptitudeAnalytics: any[] = [];
  try {
    const raw = localStorage.getItem(`aptitude_analytics_${emailLower}`) ||
                localStorage.getItem(`aptitude_analytics_${userEmail}`);
    if (raw) aptitudeAnalytics = JSON.parse(raw);
  } catch (e) {}

  let otherAnalytics: any[] = [];
  try {
    const raw = localStorage.getItem(`other_practice_analytics_${emailLower}`) ||
                localStorage.getItem(`other_practice_analytics_${userEmail}`);
    if (raw) otherAnalytics = JSON.parse(raw);
  } catch (e) {}

  let testScores: any[] = [];
  try {
    const raw = localStorage.getItem('all_student_scores');
    if (raw) {
      const all = JSON.parse(raw);
      testScores = all.filter((s: any) =>
        s.studentEmail?.toLowerCase().trim() === emailLower ||
        s.studentEmail?.toLowerCase().trim() === userEmail.toLowerCase().trim()
      );
    }
  } catch (e) {}

  let enrolledCourses: any[] = [];
  try {
    const raw = localStorage.getItem('enrolledCourses');
    if (raw) {
      const all = JSON.parse(raw);
      enrolledCourses = all.filter((c: any) =>
        c.email?.toLowerCase().trim() === emailLower ||
        c.accountEmail?.toLowerCase().trim() === emailLower
      );
    }
  } catch (e) {}

  let dailyProgress: Record<string, any> = {};
  try {
    const raw = localStorage.getItem(`daily_progress_${emailLower}`);
    if (raw) dailyProgress = JSON.parse(raw);
  } catch (e) {}

  try {
    const res = await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      {
        dsaSolved,
        aptitudeAnalytics,
        otherAnalytics,
        testScores,
        enrolledCourses,
        dailyProgress,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
  } catch (error) {
    console.warn('Could not sync local progress to DB', error);
    return null;
  }
}

/**
 * Save a newly solved DSA problem directly to DB
 */
export async function saveSolvedProblemToDB(userEmail: string, questionId: string) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !questionId) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { dsaSolved: [String(questionId)] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (e) {}
}

/**
 * Save aptitude question answers directly to DB
 */
export async function saveAptitudeAnalyticsToDB(userEmail: string, items: any[]) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !items || items.length === 0) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { aptitudeAnalytics: items },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (e) {}
}

/**
 * Save test score directly to DB
 */
export async function saveTestScoreToDB(userEmail: string, scoreRecord: any) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !scoreRecord) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { testScores: [scoreRecord] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (e) {}
}

/**
 * Save course enrollment directly to DB
 */
export async function saveCourseEnrollmentToDB(userEmail: string, courseRecord: any) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !courseRecord) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { enrolledCourses: [courseRecord] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (e) {}
}
