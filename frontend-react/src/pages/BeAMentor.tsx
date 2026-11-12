import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Sparkles, 
  Award, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  Globe, 
  FileText, 
  Send, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  HeartHandshake, 
  Video, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  "Full Stack Web Development (MERN / Next.js)",
  "Data Structures & Algorithms (DSA)",
  "System Design (High & Low Level)",
  "Cloud Architecture & DevOps (AWS / Docker / K8s)",
  "Artificial Intelligence & Machine Learning",
  "Mobile App Development (Android / iOS / Flutter)",
  "Data Engineering & Analytics",
  "Behavioral & HR Interview Coaching"
];

const EXPERIENCE_OPTIONS = [
  "1 - 2 Years",
  "3 - 5 Years",
  "6 - 8 Years",
  "8+ Years (Staff / Lead / Principal)"
];

const AVAILABILITY_OPTIONS = [
  "1 - 3 hours / week",
  "4 - 6 hours / week",
  "6 - 10 hours / week",
  "Weekends Only (Flexible)"
];

const SERVICE_OPTIONS = [
  "1-on-1 Technical Mock Interviews",
  "Resume & ATS Portfolio Review",
  "System Design & Capstone Architecture",
  "Live Weekend Masterclasses",
  "Career Roadmap & Placement Mentorship"
];

export default function BeAMentor() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentCompany: '',
    currentRole: '',
    experienceYears: EXPERIENCE_OPTIONS[1],
    primaryDomain: DOMAIN_OPTIONS[0],
    linkedinUrl: '',
    githubOrPortfolioUrl: '',
    resumeUrl: '',
    weeklyAvailability: AVAILABILITY_OPTIONS[1],
    preferredServices: [SERVICE_OPTIONS[0], SERVICE_OPTIONS[1]],
    priorMentorshipExperience: '',
    shortBio: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const exists = prev.preferredServices.includes(service);
      return {
        ...prev,
        preferredServices: exists 
          ? prev.preferredServices.filter(s => s !== service)
          : [...prev.preferredServices, service]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic validation
    if (!formData.fullName.trim()) return setErrorMsg('Please enter your full name.');
    if (!formData.email.trim() || !formData.email.includes('@')) return setErrorMsg('Please enter a valid email address.');
    if (!formData.phone.trim()) return setErrorMsg('Please enter your phone or WhatsApp number.');
    if (!formData.currentCompany.trim()) return setErrorMsg('Please enter your current company or organization.');
    if (!formData.currentRole.trim()) return setErrorMsg('Please enter your current designation / role.');
    if (!formData.linkedinUrl.trim()) return setErrorMsg('Please provide your LinkedIn profile URL.');
    if (!formData.shortBio.trim()) return setErrorMsg('Please share a short bio or motivation for joining.');

    setIsSubmitting(true);

    try {
      const newRequest = {
        id: `mentor_req_${Date.now()}`,
        ...formData,
        status: 'PENDING',
        appliedAt: new Date().toISOString()
      };

      const existingRaw = localStorage.getItem('mentor_requests');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newRequest, ...existingList];

      localStorage.setItem('mentor_requests', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 600);
    } catch (err) {
      console.error('Error saving mentor application:', err);
      setIsSubmitting(false);
      setErrorMsg('Failed to save application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-6 border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join The CodeSkill Mentor Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text-primary leading-tight">
            Shape The Future of <span className="text-primary">Tech Talent</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Share your industry knowledge, guide high-potential students, conduct 1-on-1 mock interviews, and get rewarded with flexible hours and top-tier compensation.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#application-form"
              className="px-8 py-3.5 rounded-xl bg-primary text-text-inverse font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center space-x-2"
            >
              <span>Apply to be a Mentor</span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#perks"
              className="px-6 py-3.5 rounded-xl bg-surface dark:bg-slate-800 border border-border text-text-primary font-bold hover:bg-background transition-colors"
            >
              <span>Explore Mentor Perks</span>
            </a>
          </div>

          {/* Social Proof / Stats Strip */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center border-t border-border/70 mt-12">
            <div>
              <div className="text-3xl font-extrabold text-primary">10,000+</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-text-primary">Flexible</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">2 - 6 hrs / week</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Competitive</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Honorarium / Stipend</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-text-primary">100+</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Top Hiring Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks / Benefits Section */}
      <section id="perks" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
            Why Mentor With <span className="text-primary">CodeSkill</span>?
          </h2>
          <p className="text-text-secondary text-base">
            Everything you need to give back, grow your brand, and earn honorariums without leaving your current day job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-surface dark:bg-[#111827] border border-border p-8 rounded-3xl space-y-4 hover:border-primary/50 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Complete Flexibility</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You choose when and how much you mentor. Set your calendar slots on weekends or weekday evenings with zero minimum commitments.
            </p>
          </div>

          <div className="bg-surface dark:bg-[#111827] border border-border p-8 rounded-3xl space-y-4 hover:border-primary/50 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Earn Competitive Stipends</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Earn reliable honorariums for every mock interview, resume review, code critique, or weekend bootcamp masterclass you deliver.
            </p>
          </div>

          <div className="bg-surface dark:bg-[#111827] border border-border p-8 rounded-3xl space-y-4 hover:border-primary/50 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Build Your Personal Brand</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Get an official Verified Mentor Badge on CodeSkill, enhance your leadership credentials on LinkedIn, and connect with top tech recruiters.
            </p>
          </div>

        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-16 px-6 bg-surface-secondary/40 dark:bg-background border-t border-border">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-surface dark:bg-[#111827] border border-border rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12">
            
            {isSubmitted ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-text-primary">Application Submitted!</h2>
                  <p className="text-base text-text-secondary max-w-lg mx-auto">
                    Thank you, <span className="font-bold text-text-primary">{formData.fullName}</span>! Your mentor application has been received and logged into our review queue.
                  </p>
                </div>

                <div className="bg-surface-secondary dark:bg-slate-900/60 p-6 rounded-2xl border border-border max-w-md mx-auto text-left text-sm space-y-2.5">
                  <div className="font-bold text-text-primary mb-1">What happens next:</div>
                  <div className="flex items-start space-x-2 text-text-secondary">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Our mentor relations team will review your profile & credentials within <strong>24-48 business hours</strong>.</span>
                  </div>
                  <div className="flex items-start space-x-2 text-text-secondary">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>We will send an introductory invite to <strong>{formData.email}</strong> to schedule an onboarding orientation.</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <Link
                    to="/"
                    className="px-6 py-3 rounded-xl bg-primary text-text-inverse font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Return to Homepage
                  </Link>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        currentCompany: '',
                        currentRole: '',
                        experienceYears: EXPERIENCE_OPTIONS[1],
                        primaryDomain: DOMAIN_OPTIONS[0],
                        linkedinUrl: '',
                        githubOrPortfolioUrl: '',
                        resumeUrl: '',
                        weeklyAvailability: AVAILABILITY_OPTIONS[1],
                        preferredServices: [SERVICE_OPTIONS[0], SERVICE_OPTIONS[1]],
                        priorMentorshipExperience: '',
                        shortBio: ''
                      });
                    }}
                    className="px-6 py-3 rounded-xl border border-border text-text-primary font-bold text-sm hover:bg-background transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Header */}
                <div className="border-b border-border pb-6 space-y-2">
                  <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Mentor Application Portal</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-text-primary">
                    Apply to Become a CodeSkill Mentor
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Fill out your professional details below. Verified mentors receive direct bookings and session requests from our student community.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Section 1: Personal & Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    1. Contact & Identity
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. john.doe@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        WhatsApp / Contact Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional Background */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    2. Professional Background
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Current Company / Organization <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Microsoft, Google, Razorpay"
                        value={formData.currentCompany}
                        onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Current Designation / Role <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Software Engineer"
                        value={formData.currentRole}
                        onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Total Industry Experience <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {EXPERIENCE_OPTIONS.map(exp => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        LinkedIn Profile URL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        GitHub / Portfolio / Personal Website (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={formData.githubOrPortfolioUrl}
                        onChange={(e) => setFormData({ ...formData, githubOrPortfolioUrl: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Resume / CV Link (Google Drive / Dropbox)
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={formData.resumeUrl}
                        onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Mentorship Focus & Availability */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    3. Mentorship Focus & Availability
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Primary Expertise Domain <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.primaryDomain}
                        onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {DOMAIN_OPTIONS.map(dom => (
                          <option key={dom} value={dom}>{dom}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Weekly Availability <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.weeklyAvailability}
                        onChange={(e) => setFormData({ ...formData, weeklyAvailability: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {AVAILABILITY_OPTIONS.map(avail => (
                          <option key={avail} value={avail}>{avail}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-2">
                      Services You Would Like to Provide (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SERVICE_OPTIONS.map(service => {
                        const isChecked = formData.preferredServices.includes(service);
                        return (
                          <div
                            key={service}
                            onClick={() => handleServiceToggle(service)}
                            className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center space-x-2.5 ${
                              isChecked
                                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                                : 'bg-background border-border text-text-secondary hover:border-border/80'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-primary border-primary text-white' : 'border-border'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span>{service}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">
                      Prior Mentorship or Interviewing Experience (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Conducted 40+ mock interviews, internal interviewer at Amazon, college club mentor"
                      value={formData.priorMentorshipExperience}
                      onChange={(e) => setFormData({ ...formData, priorMentorshipExperience: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">
                      Short Bio & Pitch (Why do you want to mentor on CodeSkill?) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about your background, the tech stack you love, and how you plan to help students crack top tech interviews..."
                      value={formData.shortBio}
                      onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-text-muted text-center sm:text-left">
                    By submitting, you agree to our CodeSkill Mentor Honor Code and Privacy Policy.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-text-inverse font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}
