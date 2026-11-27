import axios from 'axios';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { getApiUrl } from './apiConfig';

export interface PracticeAnalyticsItem {
  id?: string | number;
  _id?: string | number;
  topic?: string;
  difficulty?: string;
  correct?: boolean;
  attemptedAt?: string;
}

export interface TestScoreRecord {
  id?: string | number;
  testId?: string | number;
  testTitle?: string;
  topic?: string;
  studentEmail?: string;
  score?: number;
  totalQuestions?: number;
  timestamp?: string;
  date?: string;
}

export interface EnrolledCourseRecord {
  id?: string | number;
  courseId?: string | number;
  title?: string;
  courseTitle?: string;
  email?: string;
  accountEmail?: string;
}

export interface DailyProgressEntry {
  questionsSolved: number;
  pointsEarned: number;
  loggedIn?: boolean;
}

export interface UserProgressData {
  dsaSolved: string[];
  codingAnalytics?: PracticeAnalyticsItem[];
  aptitudeAnalytics: PracticeAnalyticsItem[];
  otherAnalytics: PracticeAnalyticsItem[];
  testScores: TestScoreRecord[];
  enrolledCourses: EnrolledCourseRecord[];
  dailyProgress: Record<string, DailyProgressEntry>;
}

// In-flight request deduplication map to prevent multiple simultaneous progress requests
let activeFetchPromise: Promise<UserProgressData | null> | null = null;
let registeredQueryClient: QueryClient | null = null;

export function registerProgressQueryClient(client: QueryClient) {
  registeredQueryClient = client;
}

export function invalidateUserProgressQueries() {
  if (!registeredQueryClient) return;
  registeredQueryClient.invalidateQueries({ queryKey: ['userProgress'] });
  registeredQueryClient.invalidateQueries({ queryKey: ['dsaStats'] });
  registeredQueryClient.invalidateQueries({ queryKey: ['mcqStats'] });
}

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

        if (Array.isArray(data.dailyProgress) || (data.dailyProgress && typeof data.dailyProgress === 'object')) {
          localStorage.setItem(`daily_progress_${emailLower}`, JSON.stringify(data.dailyProgress));
        }

        // Merge test scores
        if (Array.isArray(data.testScores)) {
          try {
            const localScores: TestScoreRecord[] = JSON.parse(localStorage.getItem('all_student_scores') || '[]');
            const scoreMap = new Map<string, TestScoreRecord>();
            localScores.forEach((s) => {
              const key = String(s.id || `${s.testId}_${s.studentEmail || ''}_${s.timestamp || ''}`);
              scoreMap.set(key, s);
            });
            data.testScores.forEach((s) => {
              const key = String(s.id || `${s.testId}_${s.studentEmail || ''}_${s.timestamp || ''}`);
              scoreMap.set(key, s);
            });
            localStorage.setItem('all_student_scores', JSON.stringify(Array.from(scoreMap.values())));
          } catch {
            localStorage.setItem('all_student_scores', JSON.stringify(data.testScores));
          }
        }

        // Merge enrolled courses
        if (Array.isArray(data.enrolledCourses)) {
          try {
            const localCourses: EnrolledCourseRecord[] = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
            const courseMap = new Map<string, EnrolledCourseRecord>();
            localCourses.forEach((c) => {
              const key = String(c.courseId || c.id || c.title || c.courseTitle);
              if (key) courseMap.set(key, c);
            });
            data.enrolledCourses.forEach((c) => {
              const key = String(c.courseId || c.id || c.title || c.courseTitle);
              if (key) courseMap.set(key, c);
            });
            localStorage.setItem('enrolledCourses', JSON.stringify(Array.from(courseMap.values())));
          } catch {
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
 * Refetches on mount so YourPerformance and Dashboard always show updated backend metrics.
 */
export function useUserProgress(userEmail?: string) {
  const emailKey = userEmail ? userEmail.toLowerCase().trim() : null;
  return useQuery({
    queryKey: ['userProgress', emailKey],
    enabled: Boolean(emailKey && localStorage.getItem('accessToken')),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
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

  let dsaSolved: string[] = [];
  try {
    const raw =
      localStorage.getItem(`codeskill_dsa_solved_${emailLower}`) ||
      localStorage.getItem(`codeskill_dsa_solved_${userEmail}`);
    if (raw) dsaSolved = JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }

  let aptitudeAnalytics: PracticeAnalyticsItem[] = [];
  try {
    const raw =
      localStorage.getItem(`aptitude_analytics_${emailLower}`) ||
      localStorage.getItem(`aptitude_analytics_${userEmail}`);
    if (raw) aptitudeAnalytics = JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }

  let otherAnalytics: PracticeAnalyticsItem[] = [];
  try {
    const raw =
      localStorage.getItem(`other_practice_analytics_${emailLower}`) ||
      localStorage.getItem(`other_practice_analytics_${userEmail}`);
    if (raw) otherAnalytics = JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }

  let testScores: TestScoreRecord[] = [];
  try {
    const raw = localStorage.getItem('all_student_scores');
    if (raw) {
      const all: TestScoreRecord[] = JSON.parse(raw);
      testScores = all.filter(
        (s) =>
          s.studentEmail?.toLowerCase().trim() === emailLower ||
          s.studentEmail?.toLowerCase().trim() === userEmail.toLowerCase().trim()
      );
    }
  } catch {
    /* ignore malformed storage */
  }

  let enrolledCourses: EnrolledCourseRecord[] = [];
  try {
    const raw = localStorage.getItem('enrolledCourses');
    if (raw) {
      const all: EnrolledCourseRecord[] = JSON.parse(raw);
      enrolledCourses = all.filter(
        (c) =>
          c.email?.toLowerCase().trim() === emailLower ||
          c.accountEmail?.toLowerCase().trim() === emailLower
      );
    }
  } catch {
    /* ignore malformed storage */
  }

  let dailyProgress: Record<string, DailyProgressEntry> = {};
  try {
    const raw = localStorage.getItem(`daily_progress_${emailLower}`);
    if (raw) dailyProgress = JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }

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
    invalidateUserProgressQueries();
    return res.data;
  } catch (error) {
    console.warn('Could not sync local progress to DB', error);
    return null;
  }
}

export async function saveSolvedProblemToDB(userEmail: string, questionId: string) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !questionId) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { dsaSolved: [String(questionId)] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    invalidateUserProgressQueries();
  } catch {
    /* ignore transient network errors */
  }
}

export async function saveAptitudeAnalyticsToDB(userEmail: string, items: PracticeAnalyticsItem[]) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !items || items.length === 0) return;

  const emailKey = userEmail.toLowerCase().trim();
  const retryKey = `pending_aptitude_sync_${emailKey}`;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { aptitudeAnalytics: items },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    localStorage.removeItem(retryKey);
    invalidateUserProgressQueries();
  } catch {
    try {
      const existingQueue: PracticeAnalyticsItem[] = JSON.parse(localStorage.getItem(retryKey) || '[]');
      const mergedMap = new Map<string, PracticeAnalyticsItem>();
      [...existingQueue, ...items].forEach((item) => {
        if (item?.id) mergedMap.set(String(item.id), item);
      });
      localStorage.setItem(retryKey, JSON.stringify(Array.from(mergedMap.values())));
    } catch (storeErr) {
      console.warn('Failed to update offline aptitude queue', storeErr);
    }
  }
}

export async function saveOtherAnalyticsToDB(userEmail: string, items: PracticeAnalyticsItem[]) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !items || items.length === 0) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { otherAnalytics: items },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    invalidateUserProgressQueries();
  } catch {
    /* ignore transient network errors */
  }
}

export async function saveDailyProgressToDB(
  userEmail: string,
  dailyProgress: Record<string, DailyProgressEntry>
) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !dailyProgress) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { dailyProgress },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    invalidateUserProgressQueries();
  } catch {
    /* ignore transient network errors */
  }
}

export function flushPendingAptitudeSync(userEmail: string) {
  if (!userEmail) return;
  const emailKey = userEmail.toLowerCase().trim();
  const retryKey = `pending_aptitude_sync_${emailKey}`;
  try {
    const raw = localStorage.getItem(retryKey);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) {
        void saveAptitudeAnalyticsToDB(userEmail, items);
      }
    }
  } catch {
    /* ignore malformed queue */
  }
}

export async function saveTestScoreToDB(userEmail: string, scoreRecord: TestScoreRecord) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !scoreRecord) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { testScores: [scoreRecord] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    invalidateUserProgressQueries();
  } catch {
    /* ignore transient network errors */
  }
}

export async function saveCourseEnrollmentToDB(userEmail: string, courseRecord: EnrolledCourseRecord) {
  const token = localStorage.getItem('accessToken');
  if (!token || !userEmail || !courseRecord) return;

  try {
    await axios.post(
      getApiUrl('/api/v1/auth/user-progress'),
      { enrolledCourses: [courseRecord] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    invalidateUserProgressQueries();
  } catch {
    /* ignore transient network errors */
  }
}
