import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Play, TrendingUp, BarChart, Clock, Users, ChevronRight, Award, FileText, Settings, Database, Brain, Rocket, Shield, Sparkles, Star, Briefcase, CheckCircle2, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCourseById } from "../data/coursesData";
import RatingModal from "../components/RatingModal";
import { useAuth } from "../context/AuthContext";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
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
          const enrollment = parsed.find((e: any) => 
            e.courseId === (id || "c-1") && 
            (e.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() || 
             e.accountEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim())
          );
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
      <div className="flex-1 bg-background text-text-primary flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Course Not Found</h1>
          <p className="text-text-muted mb-8">The course you are looking for does not exist.</p>
          <Link to={isDashboard ? "/dashboard/courses" : "/courses-training"} className="bg-primary px-6 py-3 rounded-lg font-bold text-text-inverse">Browse Courses</Link>
        </div>
      </div>
    );
  }

  // Trainer details resolution
  const trainerData = course.trainer || (course.trainerName ? {
    name: course.trainerName,
    role: course.trainerRole || "Senior Industry Mentor",
    company: course.trainerCompany || "CodeSkill",
    bio: course.trainerBio || "Experienced instructor dedicated to hands-on learning, real-world architecture, and career readiness.",
    image: course.trainerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    rating: "4.9",
    students: "10,000+",
    experience: "8+ Years"
  } : {
    name: "CodeSkill Expert Trainer",
    role: "Senior Industry Mentor",
    company: "CodeSkill",
    bio: "Experienced technology practitioner dedicated to student success and modern real-world engineering.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    rating: "4.9",
    students: "12,000+",
    experience: "8+ Years"
  });

  const rawModules = Array.isArray(course.modules) && course.modules.length > 0
    ? course.modules
    : [
        { title: "Course Introduction & Setup", desc: course.overview || "Overview of essential toolchains, workflow foundations, and setup." },
        { title: "Core Architecture & Concepts", desc: course.description || "In-depth modules covering production patterns and best practices." },
        { title: "Real-World Projects & Deployment", desc: "Build industry-grade projects with portfolio review and guidance." }
      ];

  const rawBullets = Array.isArray(course.bullets) && course.bullets.length > 0
    ? course.bullets
    : [
        "Master industry-standard technologies and architecture patterns.",
        "Interactive live sessions and practical guided mentorship.",
        "Hands-on real-world capstone projects for your portfolio.",
        "Industry-recognized certification upon completion."
      ];

  const rawSkills = Array.isArray(course.skills) && course.skills.length > 0
    ? course.skills
    : Array.isArray(course.skillsYouWillLearn) && course.skillsYouWillLearn.length > 0
      ? course.skillsYouWillLearn
      : Array.isArray(course.tags) && course.tags.length > 0
        ? course.tags
        : ["Full Stack Engineering", "System Design", "Problem Solving"];

  // Map the new data structure
  const courseData = {
    id: course.id,
    title: course.title,
    subtitle: course.description,
    type: course.category === "summer" ? "Summer Bootcamp" : "Self-Paced",
    rating: course.rating ? `${course.rating}/5 ratings` : "4.8/5 ratings",
    interested: course.students ? `${course.students} interested Geeks` : "1.5k+ interested Geeks",
    level: course.level || "Beginner to Advanced",
    duration: course.duration || "Self-Paced",
    seats: course.seats || "Open Enrollment",
    partner: course.partner || "CodeSkill",
    price: course.price,
    bullets: rawBullets,
    overview: rawModules.map((m: any, idx: number) => ({
      icon: [FileText, Database, Brain, BarChart, Settings, Shield, Rocket][idx % 7],
      title: m.title,
      desc: m.desc
    })),
    skills: rawSkills,
    techStack: rawSkills,
    image: course.image || "/images/video_thumbnail.png",
    trainer: trainerData
  };

  const renderActionButton = (className: string) => {
    if (enrollmentStatus === "PAID" || enrollmentStatus === "active" || enrollmentStatus === "completed") {
      return (
        <button 
          className={className}
          onClick={() => document.getElementById('course-overview')?.scrollIntoView({ behavior: 'smooth' })}
        >
          View Course
        </button>
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
          savedEnrollment = parsed.find((e: any) => 
            e.courseId === (id || "c-1") && 
            (e.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() || 
             e.accountEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim())
          );
        } catch(e) {}
      }
      return (
        <Link to={isDashboard ? `/dashboard/payment/${id || 'c-1'}` : `/payment/${id || 'c-1'}`} state={{ newEnrollment: savedEnrollment }}>
          <button className={className}>Make Payment</button>
        </Link>
      );
    } else {
      return (
        <Link to={isDashboard ? `/dashboard/register/${id || 'c-1'}` : `/register/${id || 'c-1'}`}>
          <button className={className}>Register Now</button>
        </Link>
      );
    }
  };

  return (
    <div className="flex-1 bg-background text-text-secondary w-full min-h-screen pb-20 relative">
      
      {/* Sticky Top Bar (appears on scroll) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-surface border-b border-border shadow-xl py-3 px-6"
          >
            <div className="w-full flex items-center justify-between">
              <h2 className="text-text-primary font-bold text-xl md:text-2xl truncate mr-4">
                {courseData.title}
              </h2>
              {renderActionButton("whitespace-nowrap px-6 py-2.5 bg-primary hover:bg-primary text-text-inverse font-bold rounded-lg transition-colors shadow-lg")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <div className="w-full px-6 pt-6 text-sm text-text-muted font-medium">
        <Link to={isDashboard ? "/dashboard/courses" : "/courses-training"} className="hover:text-text-primary transition-colors">All Courses</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-text-primary">Live</span>
      </div>

      {/* Header Info */}
      <div className="w-full px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">{courseData.title}</h1>
          <div className="flex items-center space-x-4 text-base font-medium">
            <span className="bg-slate-200 dark:bg-slate-800 text-text-primary px-2 py-1 rounded">{courseData.type}</span>
            <span className="text-yellow-400 flex items-center tracking-widest text-lg">★★★★<span className="text-yellow-400/50">★</span></span>
            <span 
              onClick={() => setShowRatingModal(true)}
              className="text-blue-300 underline underline-offset-2 decoration-blue-300/50 hover:decoration-blue-300 cursor-pointer transition-colors"
            >
              {courseData.rating}
            </span>
          </div>
        </div>
        <div className="text-left md:text-right bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl inline-block">
          <div className="text-sm text-primary font-bold tracking-wider uppercase mb-1">Course Price</div>
          <div className="text-3xl font-extrabold text-text-primary">{courseData.price}</div>
        </div>
      </div>

      {/* Hero Box Layout */}
      <div className="w-full px-6 mt-4 mb-16">
        <div className="flex flex-col lg:flex-row bg-surface rounded-3xl overflow-hidden border border-border shadow-2xl">
          
          {/* Left: Image Thumbnail */}
          <div className="w-full lg:w-[45%] relative min-h-[300px] lg:min-h-full bg-slate-100 dark:bg-black group">
            <img 
              src={courseData.image} 
              alt="Course Thumbnail" 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
            />
          </div>

          {/* Right: Details */}
          <div className="w-full lg:w-[55%] p-8 md:p-10 flex flex-col justify-center">
            
            <div className="flex items-center text-primary text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>{courseData.interested}</span>
            </div>

            <h2 className="text-2xl lg:text-3xl text-text-secondary font-medium mb-6 leading-snug">
              {courseData.subtitle}
            </h2>

            <ul className="space-y-4 mb-8">
              {courseData.bullets.map((bullet: string, idx: number) => (
                <li key={idx} className="flex items-start text-lg text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-2 mr-3 flex-shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4 text-base text-text-secondary font-medium mb-8">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-border/50">
                <BarChart className="w-4 h-4 mr-2 text-text-muted" />
                <span>{courseData.level}</span>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-border/50">
                <Clock className="w-4 h-4 mr-2 text-text-muted" />
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-lg border border-orange-500/20">
                <Users className="w-4 h-4 mr-2" />
                <span>{courseData.seats}</span>
              </div>
            </div>

            {courseData.trainer && (
              <div className="flex items-center space-x-3.5 mb-6 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-border/60">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/40 shrink-0 bg-primary/10">
                  <img
                    src={courseData.trainer.image}
                    alt={courseData.trainer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-xs uppercase tracking-wider text-text-muted font-bold">Trainer</p>
                    {courseData.trainer.company && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {courseData.trainer.company}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-bold text-text-primary truncate">{courseData.trainer.name}</p>
                  <p className="text-xs text-primary font-medium truncate">{courseData.trainer.role}</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Certification Exam by:</p>
              <h3 className="text-3xl font-extrabold text-text-primary tracking-tight">{courseData.partner}</h3>
            </div>

            {renderActionButton("w-full py-4 bg-primary text-text-inverse hover:brightness-110 font-bold rounded-xl transition-all hover:scale-[1.02] text-lg shadow-xl shadow-primary/20 ring-4 ring-primary/10")}

          </div>
        </div>
      </div>

      {/* Course Overview Section */}
      <div id="course-overview" className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-4xl font-bold text-center text-text-primary mb-10">Course Overview</h2>
        
        <div className="space-y-4">
          {courseData.overview.map((module: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface rounded-xl overflow-hidden flex items-stretch shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Green Icon Box */}
              <div className="w-20 md:w-28 bg-blue-100/60 border-l-4 border-primary flex items-center justify-center flex-shrink-0">
                <module.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              {/* Text Content */}
              <div className="p-5 md:p-6 flex-1">
                <h3 className="text-2xl font-bold text-text-secondary mb-1">{module.title}</h3>
                <p className="text-base md:text-lg text-text-muted font-medium leading-relaxed">{module.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Meet Your Trainer / Instructor Section */}
      {courseData.trainer && (
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="h-4 w-4" />
              <span>Mentorship by Industry Leaders</span>
            </div>
            <h2 className="text-4xl font-bold text-text-primary">Meet Your Trainer</h2>
            <p className="text-text-muted mt-2 max-w-xl text-base">Learn directly from seasoned practitioners with proven industry track records.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface rounded-3xl p-8 md:p-10 border border-border shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Trainer Photo & Badge */}
              <div className="relative shrink-0 text-center md:text-left">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-2xl mx-auto bg-slate-100 dark:bg-slate-800">
                  <img
                    src={courseData.trainer.image}
                    alt={courseData.trainer.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Trainer</span>
                </div>
              </div>

              {/* Trainer Details */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary">
                      {courseData.trainer.name}
                    </h3>
                    <p className="text-base md:text-lg text-primary font-semibold mt-0.5">
                      {courseData.trainer.role}
                    </p>
                  </div>

                  {courseData.trainer.company && (
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border text-sm font-bold text-text-primary self-center md:self-auto">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>{courseData.trainer.company}</span>
                    </div>
                  )}
                </div>

                <p className="text-base md:text-lg text-text-secondary leading-relaxed">
                  {courseData.trainer.bio}
                </p>

                {/* Trainer Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
                  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border/50">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
                    <div>
                      <div className="text-base font-bold text-text-primary">{courseData.trainer.rating || "4.9"} / 5.0</div>
                      <div className="text-xs text-text-muted">Instructor Rating</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border/50">
                    <Users className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-base font-bold text-text-primary">{courseData.trainer.students || "10,000+"}</div>
                      <div className="text-xs text-text-muted">Students Trained</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border/50">
                    <Award className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-base font-bold text-text-primary">{courseData.trainer.experience || "8+ Years"}</div>
                      <div className="text-xs text-text-muted">Industry Experience</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Skills & Tech Stack Section */}
      <div className="max-w-5xl mx-auto px-6 mb-20 space-y-12">
        
        {/* Skills */}
        <div>
          <h2 className="text-3xl font-bold text-text-secondary mb-6">Skills You Will Learn</h2>
          <div className="bg-surface rounded-xl p-8 border-l-4 border-primary shadow-md">
            <div className="flex flex-wrap gap-3">
              {courseData.skills.map((skill: string, idx: number) => (
                <span key={idx} className="bg-blue-50 border border-blue-100 text-primary font-semibold px-4 py-2 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="text-3xl font-bold text-text-secondary mb-6">Tech Stack You Will Learn</h2>
          <div className="bg-surface rounded-xl p-8 border-l-4 border-primary shadow-md">
            <div className="flex flex-wrap gap-3">
              {courseData.techStack.map((tech: string, idx: number) => (
                <span key={idx} className="bg-blue-50 border border-blue-100 text-primary font-semibold px-4 py-2 rounded-lg text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* IBM Certification Exams Section */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col md:flex-row">
          
          {/* Left Text */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">{courseData.partner} Certification Exams</h2>
            <p className="text-xl md:text-2xl text-text-secondary font-medium mb-10">Add More Value To Your Course</p>

            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-text-primary mb-1">{courseData.partner}-Certified Exams</h4>
                <p className="text-base md:text-lg text-text-muted">Put your skills to the test with exclusive {courseData.partner} exams.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary mb-1">Global Recognition</h4>
                <p className="text-base md:text-lg text-text-muted">Gain recognition from top employers worldwide.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary mb-1">Boost Your Career</h4>
                <p className="text-base md:text-lg text-text-muted">Gain a certification that sets you apart from the competition.</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 bg-slate-50 dark:bg-background p-8 flex items-center justify-center border-l border-border/50">
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
