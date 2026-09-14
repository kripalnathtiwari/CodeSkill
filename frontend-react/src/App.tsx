import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import GlobalLoader from './components/GlobalLoader';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import DashboardLayout from './components/dashboard/DashboardLayout';

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

import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = () => {
    const p = location.pathname;
    return p.startsWith('/dashboard') || p.startsWith('/take-test');
  };
  const isDashboard = isDashboardRoute();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/forgot-password';
  const hideNavbar = isDashboard || isAuthPage;

  return (
    <div className={`min-h-screen flex flex-col ${isDashboard ? 'bg-background' : 'bg-background dark:bg-background text-slate-950 dark:text-text-inverse'}`}>
      {!hideNavbar && <Navbar />}
      <main className="flex-grow flex flex-col">
        <ErrorBoundary>
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/sandbox" element={<Sandbox />} />
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
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/dashboard/my-courses" element={<ProtectedRoute><DashboardLayout><MyCourses /></DashboardLayout></ProtectedRoute>} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:tag" element={<TagProblems />} />
              <Route path="/aptitude" element={<Aptitude />} />
              <Route path="/aptitude/topic/:topic" element={<AptitudeTopic />} />
              <Route path="/company-problems" element={<CompanyProblems />} />
              <Route path="/test-series" element={<TestSeries />} />
              <Route path="/courses-training" element={<CoursesTraining />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              <Route path="/dashboard/course/:id" element={<ProtectedRoute><DashboardLayout><CourseDetails /></DashboardLayout></ProtectedRoute>} />
              <Route path="/register/:id" element={<ProtectedRoute><CourseRegistration /></ProtectedRoute>} />
              <Route path="/dashboard/register/:id" element={<ProtectedRoute><DashboardLayout><CourseRegistration /></DashboardLayout></ProtectedRoute>} />
              <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/dashboard/payment/:id" element={<ProtectedRoute><DashboardLayout><Payment /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/take-test/:id" element={<ProtectedRoute><DashboardLayout><TakeTest /></DashboardLayout></ProtectedRoute>} />
              <Route path="/solve/:id" element={<ProtectedRoute><SolveProblem /></ProtectedRoute>} />
              <Route path="/aptitude/:id" element={<ProtectedRoute><SolveAptitude /></ProtectedRoute>} />
              <Route path="/other-practice" element={<OtherPractice />} />
              <Route path="/other-practice/topic/:topic" element={<OtherPracticeTopic />} />
              <Route path="/other-practice/solve/:id" element={<ProtectedRoute><SolveOtherPractice /></ProtectedRoute>} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/cv-builder" element={<CVBuilder />} />
              <Route path="/cv-templates" element={<CVTemplates />} />
              <Route path="/ats-checker" element={<ATSChecker />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/our-product" element={<OurProduct />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
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
