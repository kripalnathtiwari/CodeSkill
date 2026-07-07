import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, PlayCircle, BookOpen } from "lucide-react";
import CertificateModal from "../components/CertificateModal";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<{name: string, course: string, id: string} | null>(null);
  const [generatingCertIdx, setGeneratingCertIdx] = useState<number | null>(null);
  const [certNameInput, setCertNameInput] = useState("");

  useEffect(() => {
    // Load enrollments
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr && user?.email) {
      try {
        const parsed = JSON.parse(existingStr);
        
        // Deduplicate by courseId
        const uniqueEnrollments: any[] = [];
        const seen = new Set();
        
        for (const e of parsed) {
          if (e.email === user.email && !seen.has(e.courseId)) {
            seen.add(e.courseId);
            uniqueEnrollments.push(e);
          }
        }
        
        setEnrollments(uniqueEnrollments);
        
      } catch (e) {}
    }
  }, [user]);

  const markCompleted = (index: number) => {
    const updated = [...enrollments];
    updated[index].status = "completed";
    setEnrollments(updated);
    
    // Also update global store
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      const parsed = JSON.parse(existingStr);
      const globalIndex = parsed.findIndex((e: any) => e.courseId === updated[index].courseId && e.email === user?.email);
      if (globalIndex > -1) {
        parsed[globalIndex].status = "completed";
        localStorage.setItem("enrolledCourses", JSON.stringify(parsed));
      }
    }
  };

  const cancelRegistration = (index: number) => {
    if (window.confirm("Are you sure you want to cancel this registration?")) {
      const updated = [...enrollments];
      const canceled = updated.splice(index, 1)[0];
      setEnrollments(updated);

      // Update global store
      const existingStr = localStorage.getItem("enrolledCourses");
      if (existingStr) {
        const parsed = JSON.parse(existingStr);
        const newParsed = parsed.filter((e: any) => !(e.courseId === canceled.courseId && e.email === user?.email));
        localStorage.setItem("enrolledCourses", JSON.stringify(newParsed));
      }
    }
  };

  const handleGenerateSubmit = () => {
    if (!certNameInput.trim()) return;
    const idx = generatingCertIdx;
    if (idx === null) return;

    // Generate unique ID like CS-YYYY-MMDD-XXXX
    const datePart = new Date().toISOString().slice(2,10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCertId = `CS-${datePart}-${randomPart}`;

    const updated = [...enrollments];
    updated[idx].certificateName = certNameInput;
    updated[idx].certificateId = newCertId;
    setEnrollments(updated);
    
    // Update global store
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      const parsed = JSON.parse(existingStr);
      const globalIndex = parsed.findIndex((e: any) => e.courseId === updated[idx].courseId && e.email === user?.email);
      if (globalIndex > -1) {
        parsed[globalIndex].certificateName = certNameInput;
        parsed[globalIndex].certificateId = newCertId;
        localStorage.setItem("enrolledCourses", JSON.stringify(parsed));
      }
    }
    setGeneratingCertIdx(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-12 px-6">
      <motion.div 
        className="max-w-6xl mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent inline-block">My Courses</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">View and manage all the courses you have purchased.</p>
        </div>

        {enrollments.length === 0 ? (
          <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">you haven't purchesed any course</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto text-lg">visite course secction</p>
            <Link to="/courses-training">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-1">
                Explore Courses Now
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrollments.map((course, idx) => (
              <div key={idx} className="group glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col shadow-xl shadow-slate-200/30 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{course.courseName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Registered on: {new Date(course.dateRegistered).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Student: <span className="font-semibold text-slate-700 dark:text-slate-300">{course.fullName}</span></p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    course.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : course.status === 'UNPAID'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {course.status === 'completed' ? 'Completed' : course.status === 'UNPAID' ? 'Pending Payment' : 'In Progress'}
                  </span>
                </div>

                <div className="flex-1"></div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                  {course.status === 'completed' ? (
                    <>
                      <Link to={`/course/${course.courseId}`} className="mr-2">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Go to Course
                        </button>
                      </Link>
                      {course.certificateName ? (
                        <button 
                          onClick={() => setSelectedCert({ name: course.certificateName, course: course.courseName, id: course.certificateId })}
                          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          View Certificate
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setGeneratingCertIdx(idx); setCertNameInput(course.fullName); }}
                          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </button>
                      )}
                    </>
                  ) : course.status === 'UNPAID' ? (
                    <>
                      <button 
                        onClick={() => cancelRegistration(idx)}
                        className="flex items-center px-4 py-2 bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:hover:bg-red-500 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <Link to={`/payment/${course.courseId}`} state={{ newEnrollment: course }}>
                        <button className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-colors shadow-lg">
                          Make Payment
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to={`/course/${course.courseId}`} className="mr-2">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Go to Course
                        </button>
                      </Link>
                      <button 
                        onClick={() => markCompleted(idx)}
                        className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        Complete Course
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal 
          studentName={selectedCert.name} 
          courseName={selectedCert.course} 
          certificateId={selectedCert.id}
          onClose={() => setSelectedCert(null)} 
        />
      )}

      {/* Generate Certificate Prompt Modal */}
      {generatingCertIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Generate Your Certificate</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Please enter your exact name as you want it to appear on your certificate. 
              <strong className="text-rose-500 block mt-2">Note: You can only generate this once!</strong>
            </p>
            <input 
              type="text" 
              value={certNameInput}
              onChange={(e) => setCertNameInput(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 mb-6"
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setGeneratingCertIdx(null)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSubmit}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/30"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
