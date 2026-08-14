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
  const [courseSettings, setCourseSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load enrollments
    const loadData = () => {
      const existingStr = localStorage.getItem("enrolledCourses");
      if (existingStr && user?.email) {
        try {
          const parsed = JSON.parse(existingStr);
          
          // Deduplicate by courseId, prioritizing PAID status
          const bestEnrollments = new Map();
          
          for (const e of parsed) {
            const matchEmail = e.email?.toLowerCase().trim() === user.email?.toLowerCase().trim();
            const matchAccountEmail = e.accountEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim();
            
            if (matchEmail || matchAccountEmail) {
              const existing = bestEnrollments.get(e.courseId);
              if (!existing) {
                bestEnrollments.set(e.courseId, e);
              } else {
                 const isPaid = (status: string) => ["PAID", "completed", "active", "Success"].includes(status);
                 const existingPaid = isPaid(existing.status);
                 const currentPaid = isPaid(e.status);
                 
                 // Upgrade to PAID if current is PAID and existing is UNPAID
                 if (currentPaid && !existingPaid) {
                   bestEnrollments.set(e.courseId, e);
                 } else if (currentPaid === existingPaid) {
                   // If both have the same status priority, keep the latest one
                   bestEnrollments.set(e.courseId, e);
                 }
              }
            }
          }
          
          const sortedEnrollments = Array.from(bestEnrollments.values()).sort((a: any, b: any) => 
            new Date(b.dateRegistered).getTime() - new Date(a.dateRegistered).getTime()
          );
          
          setEnrollments(sortedEnrollments);
          
          const settingsStr = localStorage.getItem("courseSettings");
          if (settingsStr) {
            try {
              setCourseSettings(JSON.parse(settingsStr));
            } catch (e) {}
          }
          
        } catch (e) {}
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, [user]);

  const markCompleted = (index: number) => {
    const updated = [...enrollments];
    updated[index].status = "completed";
    setEnrollments(updated);
    
    // Also update global store
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      const parsed = JSON.parse(existingStr);
      const globalIndex = parsed.findIndex((e: any) => 
        e.courseId === updated[index].courseId && 
        (e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim())
      );
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
        const newParsed = parsed.filter((e: any) => 
          !(e.courseId === canceled.courseId && 
           (e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim()))
        );
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
      const globalIndex = parsed.findIndex((e: any) => 
        e.courseId === updated[idx].courseId && 
        (e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim())
      );
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex-1 bg-background dark:bg-background text-text-primary dark:text-text-inverse min-h-screen py-12 px-6">
      <motion.div 
        className="max-w-6xl mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent inline-block">My Courses</h1>
          <p className="text-text-muted dark:text-text-muted text-lg">View and manage all the courses you have purchased.</p>
        </div>

        {enrollments.length === 0 ? (
          <motion.div variants={itemVariants} className="glass-card bg-surface/80 dark:bg-background/80 backdrop-blur-xl rounded-3xl border border-border dark:border-border p-16 text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="w-24 h-24 bg-surface-secondary dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-text-muted dark:text-text-muted" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-text-primary dark:text-text-primary">you haven't purchesed any course</h3>
            <p className="text-text-muted dark:text-text-muted mb-8 max-w-md mx-auto text-lg">visite course secction</p>
            <Link to="/courses-training">
              <button className="px-8 py-4 bg-primary hover:bg-primary text-text-inverse font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1">
                Explore Courses Now
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrollments.map((course, idx) => (
              <div key={idx} className="group glass-card bg-surface/80 dark:bg-background/80 backdrop-blur-xl rounded-3xl border border-border dark:border-border p-8 flex flex-col shadow-xl shadow-slate-200/30 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{course.courseName}</h3>
                    <p className="text-sm text-text-muted dark:text-text-muted">Registered on: {new Date(course.dateRegistered).toLocaleDateString()}</p>
                    <p className="text-sm text-text-muted dark:text-text-muted mt-1">Student: <span className="font-semibold text-text-primary dark:text-text-secondary">{course.fullName}</span></p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    (course.status === 'completed' || courseSettings[course.courseName]?.certificatePublished) 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-primary' 
                      : course.status === 'UNPAID'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-primary'
                  }`}>
                    {(course.status === 'completed' || courseSettings[course.courseName]?.certificatePublished) ? 'Completed' : course.status === 'UNPAID' ? 'Pending Payment' : 'In Progress'}
                  </span>
                </div>

                <div className="flex-1"></div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-border flex justify-end space-x-3">
                  {(course.status === 'completed' || courseSettings[course.courseName]?.certificatePublished) ? (
                    <>
                      <Link to={`/course/${course.courseId}`} className="mr-2">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-text-inverse font-bold rounded-lg transition-colors shadow-lg">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Go to Course
                        </button>
                      </Link>
                      {course.certificateName ? (
                        <button 
                          onClick={() => setSelectedCert({ name: course.certificateName, course: course.courseName, id: course.certificateId })}
                          className="flex items-center px-4 py-2 bg-primary hover:bg-primary text-text-inverse font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          View Certificate
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setGeneratingCertIdx(idx); setCertNameInput(course.fullName); }}
                          className="flex items-center px-4 py-2 bg-primary hover:bg-primary text-text-inverse font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
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
                        className="flex items-center px-4 py-2 bg-surface-secondary hover:bg-red-500 hover:text-text-inverse dark:bg-slate-800 dark:hover:bg-red-500 text-text-secondary dark:text-text-secondary font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <Link to={`/payment/${course.courseId}`} state={{ newEnrollment: course }}>
                        <button className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-text-inverse font-bold rounded-lg transition-colors shadow-lg">
                          Make Payment
                        </button>
                      </Link>
                    </>
                  ) : (
                      <Link to={`/course/${course.courseId}`} className="mr-2">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-text-inverse font-bold rounded-lg transition-colors shadow-lg">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Go to Course
                        </button>
                      </Link>
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
          templateImage={courseSettings[selectedCert.course]?.templateImage}
          onClose={() => setSelectedCert(null)} 
        />
      )}

      {/* Generate Certificate Prompt Modal */}
      {generatingCertIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface dark:bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full border border-border dark:border-border animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Generate Your Certificate</h3>
            <p className="text-sm text-text-muted dark:text-text-muted mb-6">
              Please enter your exact name as you want it to appear on your certificate. 
              <strong className="text-rose-500 block mt-2">Note: You can only generate this once!</strong>
            </p>
            <input 
              type="text" 
              value={certNameInput}
              onChange={(e) => setCertNameInput(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-lg px-4 py-3 text-text-primary dark:text-text-primary focus:outline-none focus:border-primary mb-6"
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setGeneratingCertIdx(null)}
                className="px-4 py-2 font-bold text-text-muted hover:text-text-primary dark:hover:text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSubmit}
                className="px-6 py-2 bg-primary hover:bg-primary text-text-inverse font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/30"
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
