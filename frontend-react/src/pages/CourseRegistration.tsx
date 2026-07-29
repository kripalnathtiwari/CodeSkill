import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, ChevronDown } from "lucide-react";
import { getCourseById } from "../data/coursesData";
import { useAuth } from "../context/AuthContext";

export default function CourseRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(id || "");
  const { user } = useAuth();

  // Scroll to top and check for existing enrollment
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      try {
        const enrollments = JSON.parse(existingStr);
        if (user && user.email) {
          const alreadyEnrolled = enrollments.find((e: any) => 
            e.courseId === (id || "c-1") && 
            (e.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim()) &&
            ["PAID", "active", "completed", "Success"].includes(e.status)
          );
          if (alreadyEnrolled) {
            alert("You are already registered and paid for this course! Redirecting to your dashboard...");
            navigate("/dashboard");
          }
        }
      } catch (e) {}
    }
  }, [id, navigate, user]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "India: +91",
    phone: "",
    gradYear: ""
  });

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email,
        fullName: prev.fullName || (user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "")
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      alert("Please enter your Full Name for the certificate.");
      return;
    }

    // Save enrollment to local storage
    const newEnrollment = {
      courseId: id || "c-1",
      courseName: course?.title || "Generative AI Training Program",
      fullName: formData.fullName,
      email: formData.email,
      accountEmail: user?.email,
      phone: formData.phone,
      dateRegistered: new Date().toISOString(),
      status: "UNPAID" // Saved as unpaid initially
    };

    const existingStr = localStorage.getItem("enrolledCourses");
    let enrollments = [];
    if (existingStr) {
      try {
        enrollments = JSON.parse(existingStr);
      } catch (e) {}
    }
    
    // Safety check against duplicate registration
    const existingIndex = enrollments.findIndex((e: any) => 
      e.courseId === (id || "c-1") && 
      (e.email?.toLowerCase().trim() === formData.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim())
    );
    if (existingIndex > -1) {
      if (enrollments[existingIndex].status === "PAID" || enrollments[existingIndex].status === "active") {
        alert("You are already registered and paid for this course!");
        navigate("/dashboard");
        return;
      }
      // If UNPAID, we overwrite with fresh details in case they changed phone/name
      enrollments[existingIndex] = newEnrollment;
    } else {
      enrollments.push(newEnrollment);
    }
    
    localStorage.setItem("enrolledCourses", JSON.stringify(enrollments));

    // Redirect to Payment
    navigate(`/payment/${id || "c-1"}`, { state: { newEnrollment } });
  };

  return (
    <div className="flex-1 bg-[#111827] w-full min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left: Registration Form */}
        <div className="w-full lg:w-[60%] bg-[#1a2333] rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Registration Details</h2>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your exact name for the certificate"
                className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Id <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option>India: +91</option>
                    <option>USA: +1</option>
                    <option>UK: +44</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="gradYear"
                value={formData.gradYear}
                onChange={handleChange}
                required
                className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 mt-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-lg"
            >
              Save & Continue
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By Registering, you agree to our <a href="#" className="text-emerald-500 hover:underline">Privacy Policy</a> and <a href="#" className="text-emerald-500 hover:underline">Terms & Conditions</a>.
            </p>
          </form>
        </div>

        {/* Right: Batches Available */}
        <div className="w-full lg:w-[40%]">
          <div className="bg-[#1a2333] rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">Batches Available</h2>
              <span className="bg-emerald-900/50 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-800/50">
                1 option
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-8">Choose the batch that fits your schedule</p>

            {/* Selected Batch Card */}
            <div className="bg-[#111827] border-l-4 border-emerald-600 rounded-r-xl rounded-l-sm border-t border-r border-b border-slate-700/50 overflow-hidden">
              <div className="p-6 relative">
                <div className="absolute top-6 left-5">
                  <div className="bg-emerald-500 rounded-full w-6 h-6 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="pl-10">
                  <h3 className="font-bold text-white text-lg mb-4">{course?.title || "Generative AI Training Program"} - Batch 9</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-300">
                      <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                      <span><span className="font-semibold">Starting From</span> Jun 28, 2026</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Clock className="w-4 h-4 mr-3 text-slate-400" />
                      <span>07:00 PM IST - Sat, Sun</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#151d2d] px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-[#1a2438] transition-colors border-t border-slate-700/50">
                <span className="text-emerald-500 font-semibold text-sm">View Mentor</span>
                <ChevronDown className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
