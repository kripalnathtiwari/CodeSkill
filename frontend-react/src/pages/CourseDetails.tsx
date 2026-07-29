import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, TrendingUp, BarChart, Clock, Users, ChevronRight, Award, FileText, Settings, Database, Brain, Rocket, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCourseById } from "../data/coursesData";
import RatingModal from "../components/RatingModal";
import { useAuth } from "../context/AuthContext";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { user } = useAuth();
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  useEffect(() => {
    setEnrollmentStatus(null);
    if (user) {
      const existingStr = localStorage.getItem("enrolledCourses");
      if (existingStr) {
        try {
          const parsed = JSON.parse(existingStr);
          const enrollment = parsed.find((e: any) => e.courseId === (id || "c-1") && e.email === user.email);
          if (enrollment) {
            setEnrollmentStatus(enrollment.status);
          }
        } catch (e) {}
      }
    }
  }, [user, id]);

  // Scroll to top on mount and handle scroll for sticky bar
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      // Show sticky bar when scrolled past the hero section (~400px)
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const course = getCourseById(id || "");

  if (!course) {
    return (
      <div className="flex-1 bg-[#0a1128] text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Course Not Found</h1>
          <p className="text-slate-400 mb-8">The course you are looking for does not exist.</p>
          <Link to="/courses-training" className="bg-emerald-600 px-6 py-3 rounded-lg font-bold">Browse Courses</Link>
        </div>
      </div>
    );
  }

  // Map the new data structure
  const courseData = {
    id: course.id,
    title: course.title,
    subtitle: course.description,
    type: course.category === "summer" ? "Summer Bootcamp" : "Self-Paced",
    rating: "4.8/5 ratings",
    interested: `${course.students} interested Geeks`,
    level: course.level,
    duration: course.duration,
    seats: course.seats,
    partner: course.partner,
    price: course.price,
    bullets: course.bullets,
    overview: course.modules.map((m: any, idx: number) => ({
      icon: [FileText, Database, Brain, BarChart, Settings, Shield, Rocket][idx % 7],
      title: m.title,
      desc: m.desc
    })),
    skills: course.skills,
    techStack: course.skills,
    image: course.image || "/images/video_thumbnail.png"
  };

  const renderActionButton = (className: string) => {
    if (enrollmentStatus === "PAID" || enrollmentStatus === "active" || enrollmentStatus === "completed") {
      return (
        <Link to="/dashboard">
          <button className={className}>Go to Course</button>
        </Link>
      );
    } else if (enrollmentStatus === "UNPAID") {
      // Need the saved enrollment to pass via state for the payment page if possible, 
      // but Payment page just needs the enrollment object in state.
      // Wait, Payment page expects `newEnrollment` in state. If it's not there, it redirects back!
      // Let's pass the locally saved enrollment object via state.
      let savedEnrollment = null;
      if (user) {
        try {
          const parsed = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
          savedEnrollment = parsed.find((e: any) => e.courseId === (id || "c-1") && e.email === user.email);
        } catch(e) {}
      }
      return (
        <Link to={`/payment/${id || 'c-1'}`} state={{ newEnrollment: savedEnrollment }}>
          <button className={className}>Make Payment</button>
        </Link>
      );
    } else {
      return (
        <Link to={`/register/${id || 'c-1'}`}>
          <button className={className}>Register Now</button>
        </Link>
      );
    }
  };

  return (
    <div className="flex-1 bg-[#0a1128] text-slate-200 w-full min-h-screen pb-20 relative">
      
      {/* Sticky Top Bar (appears on scroll) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#111827] border-b border-slate-800 shadow-xl py-3 px-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <h2 className="text-white font-bold text-lg md:text-xl truncate mr-4">
                {courseData.title}
              </h2>
              {renderActionButton("whitespace-nowrap px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-6 text-sm text-slate-400 font-medium">
        <Link to="/courses-training" className="hover:text-white transition-colors">All Courses</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-white">Live</span>
      </div>

      {/* Header Info */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{courseData.title}</h1>
          <div className="flex items-center space-x-4 text-sm font-medium">
            <span className="bg-slate-800 text-white px-2 py-1 rounded">{courseData.type}</span>
            <span className="text-yellow-400 flex items-center tracking-widest text-lg">★★★★<span className="text-yellow-400/50">★</span></span>
            <span 
              onClick={() => setShowRatingModal(true)}
              className="text-blue-300 underline underline-offset-2 decoration-blue-300/50 hover:decoration-blue-300 cursor-pointer transition-colors"
            >
              {courseData.rating}
            </span>
          </div>
        </div>
        <div className="text-left md:text-right bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl inline-block">
          <div className="text-sm text-emerald-400 font-bold tracking-wider uppercase mb-1">Course Price</div>
          <div className="text-3xl font-extrabold text-white">{courseData.price}</div>
        </div>
      </div>

      {/* Hero Box Layout */}
      <div className="max-w-7xl mx-auto px-6 mt-4 mb-16">
        <div className="flex flex-col lg:flex-row bg-[#111827] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          
          {/* Left: Image Thumbnail */}
          <div className="w-full lg:w-[45%] relative min-h-[300px] lg:min-h-full bg-black group">
            <img 
              src={courseData.image} 
              alt="Course Thumbnail" 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
            />
          </div>

          {/* Right: Details */}
          <div className="w-full lg:w-[55%] p-8 md:p-10 flex flex-col justify-center">
            
            <div className="flex items-center text-emerald-400 text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>{courseData.interested}</span>
            </div>

            <h2 className="text-lg md:text-xl text-slate-300 font-medium mb-6">
              {courseData.subtitle}
            </h2>

            <ul className="space-y-3 mb-8">
              {courseData.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 mr-3 flex-shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 font-medium mb-8">
              <div className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <BarChart className="w-4 h-4 mr-2 text-slate-400" />
                <span>{courseData.level}</span>
              </div>
              <div className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-lg border border-orange-500/20">
                <Users className="w-4 h-4 mr-2" />
                <span>{courseData.seats}</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Certification Exam by:</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{courseData.partner}</h3>
            </div>

            {renderActionButton("w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors text-lg shadow-lg")}

          </div>
        </div>
      </div>

      {/* Course Overview Section */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-bold text-center text-white mb-10">Course Overview</h2>
        
        <div className="space-y-4">
          {courseData.overview.map((module, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden flex items-stretch shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Green Icon Box */}
              <div className="w-20 md:w-28 bg-emerald-100/60 border-l-4 border-emerald-600 flex items-center justify-center flex-shrink-0">
                <module.icon className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
              </div>
              {/* Text Content */}
              <div className="p-5 md:p-6 flex-1">
                <h3 className="text-lg font-bold text-slate-600 mb-1">{module.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{module.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skills & Tech Stack Section */}
      <div className="max-w-5xl mx-auto px-6 mb-20 space-y-12">
        
        {/* Skills */}
        <div>
          <h2 className="text-xl font-bold text-slate-300 mb-6">Skills You Will Learn</h2>
          <div className="bg-white rounded-xl p-8 border-l-4 border-emerald-600 shadow-md">
            <div className="flex flex-wrap gap-3">
              {courseData.skills.map((skill, idx) => (
                <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-semibold px-4 py-2 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="text-xl font-bold text-slate-300 mb-6">Tech Stack You Will Learn</h2>
          <div className="bg-white rounded-xl p-8 border-l-4 border-emerald-600 shadow-md">
            <div className="flex flex-wrap gap-3">
              {courseData.techStack.map((tech, idx) => (
                <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-semibold px-4 py-2 rounded-lg text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* IBM Certification Exams Section */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="bg-[#1e2330] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col md:flex-row">
          
          {/* Left Text */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{courseData.partner} Certification Exams</h2>
            <p className="text-lg text-slate-300 font-medium mb-10">Add More Value To Your Course</p>

            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">{courseData.partner}-Certified Exams</h4>
                <p className="text-sm text-slate-400">Put your skills to the test with exclusive {courseData.partner} exams.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Global Recognition</h4>
                <p className="text-sm text-slate-400">Gain recognition from top employers worldwide.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Boost Your Career</h4>
                <p className="text-sm text-slate-400">Gain a certification that sets you apart from the competition.</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 bg-[#171b26] p-8 flex items-center justify-center border-l border-slate-800/50">
            <img 
              src="/images/certificate.png" 
              alt="IBM Certification" 
              className="w-full h-auto object-contain rounded-sm shadow-2xl border border-white/10"
            />
          </div>

        </div>
      </div>

      {/* Dynamic Rating Modal */}
      <RatingModal 
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        courseId={courseData.id}
        courseName={courseData.title}
        ratingValue={courseData.rating}
      />
    </div>
  );
}
