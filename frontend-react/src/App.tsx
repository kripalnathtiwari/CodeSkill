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
const WhyUs = lazy(() => import('./pages/WhyUs'));
const Contact = lazy(() => import('./pages/Contact'));
const CollegeRequestSession = lazy(() => import('./pages/CollegeRequestSession'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const CVTemplates = lazy(() => import('./pages/CVTemplates'));
const ATSChecker = lazy(() => import('./pages/ATSChecker'));
const Jobs = lazy(() => import('./pages/Jobs'));
const TestSeries = lazy(() => import('./pages/TestSeries'));
const OurProduct = lazy(() => import('./pages/OurProduct'));
const ProjectIdeas = lazy(() => import('./pages/ProjectIdeas'));
const ProjectIdeaDetail = lazy(() => import('./pages/ProjectIdeaDetail'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const BeAMentor = lazy(() => import('./pages/BeAMentor'));
const YourPerformance = lazy(() => import('./pages/YourPerformance'));

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
      <ErrorBoundary>
        <Suspense fallback={<GlobalLoader />}>
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
              <Route path="/why-us" element={<GuestRoute><WhyUs /></GuestRoute>} />
              <Route path="/about" element={<GuestRoute><About /></GuestRoute>} />
              <Route path="/contact" element={<GuestRoute><Contact /></GuestRoute>} />
              <Route path="/college-request-session" element={<GuestRoute><CollegeRequestSession /></GuestRoute>} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="/change-password" element={<GuestRoute><ChangePassword /></GuestRoute>} />
              <Route path="/sandbox" element={<ProtectedRoute><Sandbox /></ProtectedRoute>} />
              
              {/* ✅ Unified Dashboard Layout Parent Route: preserves Sidebar & TopNav across all section switches */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="learning-path" element={<LearningPath />} />
                <Route path="courses" element={<CoursesTraining />} />
                <Route path="practice" element={<Problems />} />
                <Route path="practice/:tag" element={<TagProblems />} />
                <Route path="practice/company-problems" element={<CompanyProblems />} />
                <Route path="practice/aptitude" element={<Aptitude />} />
                <Route path="practice/other" element={<OtherPractice />} />
                <Route path="tests" element={<Contests />} />
                <Route path="compiler" element={<Sandbox />} />
                <Route path="notes" element={<Notes />} />
                <Route path="career" element={<Jobs />} />
                <Route path="career/mock-interview" element={<MockInterview />} />
                <Route path="career/resume-maker" element={<CVBuilder />} />
                <Route path="career/resume-analysis" element={<ATSChecker />} />
                <Route path="career/your-performance" element={<YourPerformance />} />
                <Route path="projects" element={<ProjectIdeas />} />
                <Route path="projects/:id" element={<ProjectIdeaDetail />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="course/:id" element={<CourseDetails />} />
                <Route path="register/:id" element={<CourseRegistration />} />
                <Route path="payment/:id" element={<Payment />} />
                <Route path="solve/:id" element={<SolveProblem />} />
                <Route path="solve-problem/:id" element={<SolveProblem />} />
                <Route path="aptitude/:id" element={<SolveAptitude />} />
                <Route path="aptitude/topic/:topic" element={<AptitudeTopic />} />
                <Route path="other-practice/topic/:topic" element={<OtherPracticeTopic />} />
                <Route path="other-practice/solve/:id" element={<SolveOtherPractice />} />
                <Route path="career/cv-templates" element={<CVTemplates />} />
              </Route>

              <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/problems" element={<GuestRoute><Problems /></GuestRoute>} />
              <Route path="/problems/:tag" element={<GuestRoute><TagProblems /></GuestRoute>} />
              <Route path="/aptitude" element={<GuestRoute><Aptitude /></GuestRoute>} />
              <Route path="/aptitude/topic/:topic" element={<GuestRoute><AptitudeTopic /></GuestRoute>} />
              <Route path="/company-problems" element={<GuestRoute><CompanyProblems /></GuestRoute>} />
              <Route path="/test-series" element={<ProtectedRoute><TestSeries /></ProtectedRoute>} />
              <Route path="/courses-training" element={<CoursesTraining />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              <Route path="/register/:id" element={<ProtectedRoute><CourseRegistration /></ProtectedRoute>} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
              <Route path="/contests" element={<GuestRoute><Contests /></GuestRoute>} />
              <Route path="/take-test/:id" element={<ProtectedRoute><DashboardLayout><TakeTest /></DashboardLayout></ProtectedRoute>} />
              <Route path="/solve/:id" element={<ProtectedRoute><SolveProblem /></ProtectedRoute>} />
              <Route path="/solve-problem/:id" element={<ProtectedRoute><SolveProblem /></ProtectedRoute>} />
              <Route path="/aptitude/:id" element={<ProtectedRoute><SolveAptitude /></ProtectedRoute>} />
              <Route path="/other-practice" element={<GuestRoute><OtherPractice /></GuestRoute>} />
              <Route path="/other-practice/topic/:topic" element={<GuestRoute><OtherPracticeTopic /></GuestRoute>} />
              <Route path="/other-practice/solve/:id" element={<ProtectedRoute><SolveOtherPractice /></ProtectedRoute>} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/ats-checker" element={<GuestRoute><ATSChecker /></GuestRoute>} />
              <Route path="/jobs" element={<GuestRoute><Jobs /></GuestRoute>} />
              <Route path="/our-product" element={<GuestRoute><OurProduct /></GuestRoute>} />
              <Route path="/be-a-mentor" element={<BeAMentor />} />
            </Routes>
          </main>

          {/* ✅ Universal Footer — appears on every public page automatically */}
          {!hideFooter && <Footer />}
        </Suspense>
      </ErrorBoundary>
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
