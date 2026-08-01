import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import GlobalLoader from './components/GlobalLoader';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Sandbox = lazy(() => import('./pages/Sandbox'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Problems = lazy(() => import('./pages/Problems'));
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
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const ATSChecker = lazy(() => import('./pages/ATSChecker'));
const Jobs = lazy(() => import('./pages/Jobs'));

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/aptitude" element={<Aptitude />} />
            <Route path="/aptitude/topic/:topic" element={<AptitudeTopic />} />
            <Route path="/company-problems" element={<CompanyProblems />} />
            <Route path="/courses-training" element={<CoursesTraining />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/register/:id" element={<ProtectedRoute><CourseRegistration /></ProtectedRoute>} />
            <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/take-test/:id" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
            <Route path="/solve/:id" element={<ProtectedRoute><SolveProblem /></ProtectedRoute>} />
            <Route path="/aptitude/:id" element={<ProtectedRoute><SolveAptitude /></ProtectedRoute>} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/cv-builder" element={<CVBuilder />} />
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
