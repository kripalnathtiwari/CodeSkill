import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import GlobalLoader from './components/GlobalLoader';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import DashboardLayout from './components/dashboard/DashboardLayout';
import GuestRoute from './components/GuestRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Sandbox = lazy(() => import('./pages/Sandbox'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Problems = lazy(() => import('./pages/Problems'));
const TagProblems = lazy(() => import('./pages/TagProblems'));
const CompanyProblems = lazy(() => import('./pages/CompanyProblems'));
const CoursesTraining = lazy(() => import('./pages/CoursesTraining'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const CourseRegistration = lazy(() => import('./pages/CourseRegistration'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const Payment = lazy(() => import('./pages/Payment'));
const Admin = lazy(() => import('./pages/Admin'));
const Contests = lazy(() => import('./pages/Contests'));
const TakeTest = lazy(() => import('./pages/TakeTest'));
const SolveProblem = lazy(() => import('./pages/SolveProblem'));
const Notes = lazy(() => import('./pages/Notes'));
const Aptitude = lazy(() => import('./pages/Aptitude'));
const AptitudeTopic = lazy(() => import('./pages/AptitudeTopic'));
const SolveAptitude = lazy(() => import('./pages/SolveAptitude'));
const OtherPractice = lazy(() => import('./pages/OtherPractice'));
const OtherPracticeTopic = lazy(() => import('./pages/OtherPracticeTopic'));
const SolveOtherPractice = lazy(() => import('./pages/SolveOtherPractice'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const CVTemplates = lazy(() => import('./pages/CVTemplates'));
const ATSChecker = lazy(() => import('./pages/ATSChecker'));
const Jobs = lazy(() => import('./pages/Jobs'));
const TestSeries = lazy(() => import('./pages/TestSeries'));
const OurProduct = lazy(() => import('./pages/OurProduct'));
const ProjectIdeas = lazy(() => import('./pages/ProjectIdeas'));
const ProjectIdeaDetail = lazy(() => import('./pages/ProjectIdeaDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = () => {
    const p = location.pathname;
    return p.startsWith('/dashboard') || p.startsWith('/take-test');
  };
  const isDashboard = isDashboardRoute();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/forgot-password';
  const hideNavbar = isDashboard || isAuthPage || location.pathname.startsWith('/admin');
  const hideFooter = isDashboard || isAuthPage || location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col ${isDashboard ? 'bg-background' : 'bg-background dark:bg-background text-slate-950 dark:text-text-inverse'}`}>
      {!hideNavbar && <Navbar />}
      <main className="flex-grow flex flex-col">
        <ErrorBoundary>
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
              <Route path="/about" element={<GuestRoute><About /></GuestRoute>} />
              <Route path="/contact" element={<GuestRoute><Contact /></GuestRoute>} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="/change-password" element={<GuestRoute><ChangePassword /></GuestRoute>} />
              <Route path="/sandbox" element={<GuestRoute><Sandbox /></GuestRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/courses" element={<ProtectedRoute><DashboardLayout><CoursesTraining /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/practice" element={<ProtectedRoute><DashboardLayout><Problems /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/practice/:tag" element={<ProtectedRoute><DashboardLayout><TagProblems /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/practice/company-problems" element={<ProtectedRoute><DashboardLayout><CompanyProblems /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/practice/aptitude" element={<ProtectedRoute><DashboardLayout><Aptitude /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/practice/other" element={<ProtectedRoute><DashboardLayout><OtherPractice /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/tests" element={<ProtectedRoute><DashboardLayout><Contests /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/compiler" element={<ProtectedRoute><DashboardLayout><Sandbox /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/notes" element={<ProtectedRoute><DashboardLayout><Notes /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/career" element={<ProtectedRoute><DashboardLayout><Jobs /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/career/resume-maker" element={<ProtectedRoute><DashboardLayout><CVBuilder /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/career/resume-analysis" element={<ProtectedRoute><DashboardLayout><ATSChecker /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/projects" element={<ProtectedRoute><DashboardLayout><ProjectIdeas /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/projects/:id" element={<ProtectedRoute><DashboardLayout><ProjectIdeaDetail /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/dashboard/my-courses" element={<ProtectedRoute><DashboardLayout><MyCourses /></DashboardLayout></ProtectedRoute>} />
              <Route path="/problems" element={<GuestRoute><Problems /></GuestRoute>} />
              <Route path="/problems/:tag" element={<GuestRoute><TagProblems /></GuestRoute>} />
              <Route path="/aptitude" element={<GuestRoute><Aptitude /></GuestRoute>} />
              <Route path="/aptitude/topic/:topic" element={<GuestRoute><AptitudeTopic /></GuestRoute>} />
              <Route path="/company-problems" element={<GuestRoute><CompanyProblems /></GuestRoute>} />
              <Route path="/test-series" element={<GuestRoute><TestSeries /></GuestRoute>} />
              <Route path="/courses-training" element={<GuestRoute><CoursesTraining /></GuestRoute>} />
              <Route path="/course/:id" element={<GuestRoute><CourseDetails /></GuestRoute>} />
              <Route path="/dashboard/course/:id" element={<ProtectedRoute><DashboardLayout><CourseDetails /></DashboardLayout></ProtectedRoute>} />
              <Route path="/register/:id" element={<ProtectedRoute><CourseRegistration /></ProtectedRoute>} />
              <Route path="/dashboard/register/:id" element={<ProtectedRoute><DashboardLayout><CourseRegistration /></DashboardLayout></ProtectedRoute>} />
              <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/dashboard/payment/:id" element={<ProtectedRoute><DashboardLayout><Payment /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
              <Route path="/contests" element={<GuestRoute><Contests /></GuestRoute>} />
              <Route path="/take-test/:id" element={<ProtectedRoute><DashboardLayout><TakeTest /></DashboardLayout></ProtectedRoute>} />
              <Route path="/solve/:id" element={<ProtectedRoute><SolveProblem /></ProtectedRoute>} />
              <Route path="/dashboard/solve/:id" element={<ProtectedRoute><DashboardLayout><SolveProblem /></DashboardLayout></ProtectedRoute>} />
              <Route path="/aptitude/:id" element={<ProtectedRoute><SolveAptitude /></ProtectedRoute>} />
              <Route path="/dashboard/aptitude/:id" element={<ProtectedRoute><DashboardLayout><SolveAptitude /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/aptitude/topic/:topic" element={<ProtectedRoute><DashboardLayout><AptitudeTopic /></DashboardLayout></ProtectedRoute>} />
              <Route path="/other-practice" element={<GuestRoute><OtherPractice /></GuestRoute>} />
              <Route path="/other-practice/topic/:topic" element={<GuestRoute><OtherPracticeTopic /></GuestRoute>} />
              <Route path="/dashboard/other-practice/topic/:topic" element={<ProtectedRoute><DashboardLayout><OtherPracticeTopic /></DashboardLayout></ProtectedRoute>} />
              <Route path="/other-practice/solve/:id" element={<ProtectedRoute><SolveOtherPractice /></ProtectedRoute>} />
              <Route path="/dashboard/other-practice/solve/:id" element={<ProtectedRoute><DashboardLayout><SolveOtherPractice /></DashboardLayout></ProtectedRoute>} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/cv-builder" element={<GuestRoute><CVBuilder /></GuestRoute>} />
              <Route path="/cv-templates" element={<GuestRoute><CVTemplates /></GuestRoute>} />
              <Route path="/dashboard/career/cv-templates" element={<ProtectedRoute><DashboardLayout><CVTemplates /></DashboardLayout></ProtectedRoute>} />
              <Route path="/ats-checker" element={<GuestRoute><ATSChecker /></GuestRoute>} />
              <Route path="/jobs" element={<GuestRoute><Jobs /></GuestRoute>} />
              <Route path="/our-product" element={<GuestRoute><OurProduct /></GuestRoute>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* ✅ Universal Footer — appears on every public page automatically */}
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <NetworkStatus />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
