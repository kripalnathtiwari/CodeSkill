import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import GlobalLoader from './components/GlobalLoader';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

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

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/forgot-password';
  const hideNavbar = isDashboard || isAuthPage;

  return (
    <div className={`min-h-screen flex flex-col ${isDashboard ? 'bg-background' : 'bg-background dark:bg-background text-slate-950 dark:text-text-inverse'}`}>
      {!hideNavbar && <Navbar />}
      <main className="flex-grow flex flex-col">
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
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:tag" element={<TagProblems />} />
            <Route path="/aptitude" element={<Aptitude />} />
            <Route path="/aptitude/topic/:topic" element={<AptitudeTopic />} />
            <Route path="/company-problems" element={<CompanyProblems />} />
            <Route path="/company-preparation" element={<CompanyProblems />} />
            <Route path="/courses-training" element={<CoursesTraining />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/register/:id" element={<ProtectedRoute><CourseRegistration /></ProtectedRoute>} />
            <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/take-test/:id" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
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
          </Routes>
        </Suspense>
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
