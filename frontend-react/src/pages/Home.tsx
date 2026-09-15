import React, { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import letsGoImg from "../assets/lets-go.png";
import Footer from "../components/Footer";

const FeaturedCourses = lazy(() => import("../components/home/FeaturedCourses"));
const CampusDrives = lazy(() => import("../components/home/CampusDrives"));
const EngineSection = lazy(() => import("../components/home/EngineSection"));
const TrainerReviews = lazy(() => import("../components/home/TrainerReviews"));
const CareerTools = lazy(() => import("../components/home/CareerTools"));
const CompilerSection = lazy(() => import("../components/home/CompilerSection"));
const FeaturesGrid = lazy(() => import("../components/home/FeaturesGrid"));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// A simple fallback skeleton for lazy loaded sections
const SectionSkeleton = () => (
  <div className="py-20 px-6 w-full flex flex-col items-center justify-center space-y-6 animate-pulse opacity-50">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-2xl"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
  </div>
);

// Course Ticker Component
const CourseTicker = () => {
  const courses = [
    { name: "Python", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Java", color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "JavaScript", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { name: "TypeScript", color: "text-blue-600", bg: "bg-blue-600/10" },
    { name: "C++", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "React", color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { name: "Django", color: "text-green-700", bg: "bg-green-700/10" },
    { name: "Web Dev", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "ADSA", color: "text-pink-500", bg: "bg-pink-500/10" },
    { name: "Data Science", color: "text-teal-500", bg: "bg-teal-500/10" },
    { name: "Machine Learning", color: "text-violet-500", bg: "bg-violet-500/10" },
    { name: "Cyber Security", color: "text-red-500", bg: "bg-red-500/10" },
    { name: "DevOps", color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Cloud Computing", color: "text-sky-500", bg: "bg-sky-500/10" },
    { name: "System Design", color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const duplicatedCourses = [...courses, ...courses, ...courses, ...courses];

  return (
    <div className="w-full overflow-hidden py-4 z-20 relative">
      <motion.div
        className="flex whitespace-nowrap gap-6 items-center w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {duplicatedCourses.map((course, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-5 py-2 rounded-full ${course.bg} ${course.color} font-semibold text-sm border border-current/20`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {course.name}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleActionClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (user) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center relative overflow-hidden bg-background dark:bg-background w-full">
      {/* Dynamic Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/20 rounded-full blur-[120px]"
      />

      {/* Course Ticker */}
      <CourseTicker />

      {/* Hero section */}
      <section className="pt-8 pb-20 px-3 sm:px-5 lg:px-8 w-full max-w-[1400px] mx-auto z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 flex flex-col items-start text-left lg:col-span-5"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full text-sm font-semibold text-primary dark:text-primary backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.15)]"
            >
              <Award className="h-4 w-4" />
              <span>CodeSkill Assessment Suite v2.0</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-text-primary dark:text-text-primary"
            >
              One Platform for Training, <br />
              <span className="text-primary drop-shadow-sm">
                Certifications & Career Growth.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-text-secondary dark:text-text-secondary max-w-2xl leading-relaxed font-medium"
            >
              Create, edit, compile, and execute code solutions dynamically in 10+ programming languages. Backed by highly scalable, interactive environments.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto"
            >
              <div onClick={(e) => handleActionClick(e, "/dashboard/practice")} className="w-full sm:w-auto cursor-pointer">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-text-inverse font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 w-full justify-center border border-primary/50"
                >
                  <span>Practice Playground</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>

              <div onClick={(e) => handleActionClick(e, "/dashboard")} className="w-full sm:w-auto cursor-pointer">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center space-x-2 bg-surface dark:bg-background/80 backdrop-blur-md border border-border dark:border-border text-text-primary dark:text-text-inverse hover:bg-background dark:hover:bg-slate-800 font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-colors w-full justify-center shadow-sm dark:shadow-none"
                >
                  <span>View Dashboard</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative w-full aspect-[4/3] lg:col-span-7 cursor-pointer group lg:max-w-2xl lg:ml-auto xl:max-w-3xl"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: 1000 }}
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

            <motion.div
              className="absolute inset-0 z-10 drop-shadow-2xl rounded-2xl border border-white/10 transition-shadow group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front side */}
              <div
                className="absolute inset-0 w-full h-full bg-surface dark:bg-slate-900 rounded-2xl overflow-hidden"
                style={{
                  transform: "rotateY(0deg)",
                  opacity: isFlipped ? 0 : 1,
                  transition: "opacity 0.3s",
                  zIndex: isFlipped ? 0 : 10,
                }}
              >
                <img
                  src="/assets/hero-illustration.png"
                  alt="CodeSkill Platform Illustration"
                  className="w-full h-full object-cover rounded-2xl bg-surface dark:bg-slate-900"
                />
              </div>

              {/* Back side */}
              <div
                className="absolute inset-0 w-full h-full bg-surface dark:bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  transform: "rotateY(180deg)",
                  opacity: isFlipped ? 1 : 0,
                  transition: "opacity 0.3s",
                  zIndex: isFlipped ? 10 : 0,
                }}
              >
                <img
                  src={letsGoImg}
                  alt="Let's Go"
                  className="w-full h-full object-cover rounded-2xl bg-surface dark:bg-slate-900"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Lazy Loaded Sections */}
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 pb-24">
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedCourses />
          <CampusDrives />
          <EngineSection />
          <TrainerReviews />
          <CareerTools />
          <CompilerSection />
          <FeaturesGrid />
        </Suspense>
      </div>

      {/* Floating Chat Button */}
      <Link to="/contact">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 bg-primary text-text-inverse p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-bold">
            Chat with us
          </span>
        </motion.div>
      </Link>

      {/* Footer */}
      <Footer />
    </div>
  );
}
