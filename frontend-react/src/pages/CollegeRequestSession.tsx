import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2, BookOpen, Users, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';

export default function CollegeRequestSession() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    collegeName: '',
    topic: '',
    expectedAttendance: '',
    preferredDate: '',
    sessionType: 'Bootcamp',
    message: '' 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.collegeName) {
      setIsSubmitting(true);
      setErrorMsg('');
      try {
        // Send to contact endpoint for now
        await axios.post(getApiUrl('/api/v1/contact'), {
          name: formData.name,
          email: formData.email,
          message: `College: ${formData.collegeName}\nTopic: ${formData.topic}\nAttendance: ${formData.expectedAttendance}\nDate: ${formData.preferredDate}\nType: ${formData.sessionType}\n\n${formData.message}`
        });
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ 
            name: '', email: '', collegeName: '', topic: '', 
            expectedAttendance: '', preferredDate: '', sessionType: 'Bootcamp', message: '' 
          });
        }, 3000);
      } catch (error) {
        console.error("Failed to send request:", error);
        setErrorMsg('Failed to send request. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] text-text-inverse pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Request a <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">College Session</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Bring industry subject-matter experts to your campus. Schedule interactive bootcamps, hands-on hackathons, or custom placement training.
          </motion.p>
        </div>

        {/* Request Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827] border border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-10 bg-[#111827] flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-text-inverse mb-3">Request Received!</h3>
              <p className="text-text-muted max-w-md">Thank you for your interest. Our team will review your requirements and get back to you to coordinate the session.</p>
            </motion.div>
          ) : null}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm">
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@college.edu"
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">College/University Name</label>
              <input 
                type="text" 
                required
                value={formData.collegeName}
                onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                placeholder="Example University"
                className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Topic / Subject</label>
                <input 
                  type="text" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g. Full Stack Development"
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Session Type</label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({...formData, sessionType: e.target.value})}
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                >
                  <option value="Bootcamp">Bootcamp</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Placement Training">Placement Training</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Expected Attendance</label>
                <input 
                  type="number" 
                  value={formData.expectedAttendance}
                  onChange={(e) => setFormData({...formData, expectedAttendance: e.target.value})}
                  placeholder="e.g. 100"
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Preferred Date</label>
                <input 
                  type="date" 
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Additional Requirements (Optional)</label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                placeholder="Any specific tools, duration, or outcomes you are looking for?"
                className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-emerald-600 text-text-inverse font-bold rounded-xl px-6 py-4 flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Request</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
