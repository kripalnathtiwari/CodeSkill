import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Search,
  Filter,
  Building2,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  ExternalLink,
  Zap,
  Bookmark,
  TrendingUp,
  AlertCircle,
  Calendar,
  Check,
  CircleDot,
  Loader2,
  UploadCloud,
  FileCheck,
  Trash2,
  Megaphone,
  Plus,
  X,
  LockKeyhole,
  LogIn
} from 'lucide-react';
import { extractTextFromFile, parseResumeContent } from '../utils/cvParser';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  vacanciesCount?: number;
  deadline?: string;
  type: 'Full-time' | 'Internship' | 'Contract' | 'Remote';
  workplace: 'Remote' | 'On-site' | 'Hybrid';
  salary: string;
  experience: 'Fresher' | '0-2 Years' | '2-4 Years' | '5+ Years' | 'Internship';
  skills: string[];
  posted: string;
  featured?: boolean;
  description: string;
}

interface TrackedApplication {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  appliedDate: string;
  currentStep: number; // 1 to 4
  statusLabel: string;
  statusColor: 'emerald' | 'blue' | 'amber' | 'purple';
  nextAction?: string;
  atsScore?: number;
}

const resolveCandidateNameFromStorage = (email?: string): string => {
  try {
    const uStr = localStorage.getItem('user');
    if (uStr) {
      const u = JSON.parse(uStr);
      if (u.profile?.firstName || u.profile?.lastName) {
        const full = `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim();
        if (full) return full;
      }
      if (u.firstName || u.lastName) {
        const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        if (full) return full;
      }
      if (u.name) return u.name;
      if (u.fullName) return u.fullName;
    }
  } catch (e) { }

  const targetEmail = email || localStorage.getItem('user_email') || '';
  if (targetEmail) {
    const prefix = targetEmail.split('@')[0];
    const cleaned = prefix.replace(/[0-9]+$/, '').replace(/[._-]+/g, ' ').trim();
    if (cleaned) {
      return cleaned
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  return localStorage.getItem('user_name') || 'Candidate';
};

const SAMPLE_JOBS: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer Intern',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India',
    type: 'Internship',
    workplace: 'Remote',
    salary: '₹25,000 - ₹35,000 / month',
    experience: 'Internship',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    posted: '2 days ago',
    featured: true,
    description: 'Work alongside senior engineers to build responsive and accessible user interfaces for our enterprise cloud platform.'
  },
  {
    id: 'job-2',
    title: 'Full Stack Engineer (MERN)',
    company: 'InnovateAI Labs',
    location: 'Bangalore / Hyderabad',
    type: 'Full-time',
    workplace: 'Hybrid',
    salary: '₹12,00,000 - ₹18,00,000 PA',
    experience: '0-2 Years',
    skills: ['Node.js', 'React', 'MongoDB', 'AWS', 'GraphQL'],
    posted: '1 day ago',
    featured: true,
    description: 'Join our core product team to scale real-time AI tools and build resilient backend microservices.'
  },
  {
    id: 'job-3',
    title: 'Data Analyst Intern',
    company: 'DataFlow Analytics',
    location: 'Pune / Mumbai',
    type: 'Internship',
    workplace: 'Remote',
    salary: '₹20,000 - ₹30,000 / month',
    experience: 'Internship',
    skills: ['Python', 'SQL', 'Power BI', 'Pandas'],
    posted: '3 days ago',
    description: 'Analyze user growth pipelines and create interactive executive dashboards for data-driven product decisions.'
  },
  {
    id: 'job-4',
    title: 'Junior Software Development Engineer',
    company: 'CloudNexus Tech',
    location: 'Hyderabad, India',
    type: 'Full-time',
    workplace: 'On-site',
    salary: '₹10,00,000 - ₹14,00,000 PA',
    experience: 'Fresher',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    posted: '5 days ago',
    description: 'Design robust backend REST APIs and optimize database query performance for high-concurrency systems.'
  },
  {
    id: 'job-5',
    title: 'DevOps & SRE Intern',
    company: 'ScaleGrid Systems',
    location: 'Remote',
    type: 'Internship',
    workplace: 'Remote',
    salary: '₹30,000 / month',
    experience: 'Internship',
    skills: ['Linux', 'Kubernetes', 'Docker', 'CI/CD', 'GitHub Actions'],
    posted: 'Just now',
    featured: true,
    description: 'Help automate infrastructure deployment and monitor cloud reliability across multi-region Kubernetes clusters.'
  },
  {
    id: 'job-6',
    title: 'AI / Machine Learning Engineer (Associate)',
    company: 'NeuralWorks India',
    location: 'Bangalore, India',
    type: 'Full-time',
    workplace: 'Hybrid',
    salary: '₹14,00,000 - ₹22,00,000 PA',
    experience: '0-2 Years',
    skills: ['Python', 'PyTorch', 'LLMs', 'NLP', 'FastAPI'],
    posted: '4 days ago',
    description: 'Develop and fine-tune machine learning models for natural language understanding and intelligent automation workflows.'
  }
];

const INITIAL_TRACKED: TrackedApplication[] = [
  {
    id: 'track-101',
    jobId: 'job-1',
    title: 'Frontend Developer Intern',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India',
    appliedDate: 'July 28, 2026',
    currentStep: 3,
    statusLabel: 'Technical Interview Scheduled',
    statusColor: 'emerald',
    nextAction: 'Online Coding Round on Aug 3, 2026',
    atsScore: 92
  },
  {
    id: 'track-102',
    jobId: 'job-2',
    title: 'Full Stack Engineer (MERN)',
    company: 'InnovateAI Labs',
    location: 'Bangalore / Hyderabad',
    appliedDate: 'July 29, 2026',
    currentStep: 2,
    statusLabel: 'ATS & Resume Screened',
    statusColor: 'blue',
    nextAction: 'Recruiter Review in progress',
    atsScore: 86
  },
  {
    id: 'track-103',
    jobId: 'job-3',
    title: 'Data Analyst Intern',
    company: 'DataFlow Analytics',
    location: 'Pune / Mumbai',
    appliedDate: 'July 25, 2026',
    currentStep: 1,
    statusLabel: 'Application Received',
    statusColor: 'amber',
    nextAction: 'Waiting for initial screening',
    atsScore: 78
  }
];

const PROGRESS_STEPS = [
  { step: 1, name: 'Applied', desc: 'CV Submitted' },
  { step: 2, name: 'ATS Screen', desc: 'Resume Analysis' },
  { step: 3, name: 'Interview', desc: 'Technical & HR' },
  { step: 4, name: 'Offer / Final', desc: 'Decision Round' }
];

export default function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'tracker' ? 'tracker' : 'browse';
  const [activeTab, setActiveTab] = useState<'browse' | 'tracker'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'tracker') {
      setActiveTab('tracker');
    } else if (tabParam === 'browse') {
      setActiveTab('browse');
    }
  }, [searchParams]);

  const [allJobs, setAllJobs] = useState<JobOpportunity[]>(() => {
    try {
      const saved = localStorage.getItem('codeskill_published_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const nonDuplicateSamples = SAMPLE_JOBS.filter(s => !existingIds.has(s.id));
        return [...parsed, ...nonDuplicateSamples];
      }
    } catch (e) {
      console.error('Error loading published jobs from localStorage', e);
    }
    return SAMPLE_JOBS;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('codeskill_published_jobs');
        if (saved) {
          const parsed = JSON.parse(saved);
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const nonDuplicateSamples = SAMPLE_JOBS.filter(s => !existingIds.has(s.id));
          setAllJobs([...parsed, ...nonDuplicateSamples]);
        }
      } catch (e) { }
    };
    window.addEventListener('published_jobs_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('published_jobs_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [trackedApplications, setTrackedApplications] = useState<TrackedApplication[]>(INITIAL_TRACKED);
  const [activeModalJob, setActiveModalJob] = useState<JobOpportunity | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingJob, setPendingJob] = useState<JobOpportunity | null>(null);
  const [uploadedCV, setUploadedCV] = useState<{
    name: string;
    size: string;
    content?: string;
    parsedJson?: any;
    fileDataUrl?: string;
  } | null>(null);

  // Handle auto-opening job application modal after returning from successful login
  useEffect(() => {
    const autoJobId = searchParams.get('autoApply') || sessionStorage.getItem('pending_job_apply');
    if (user && autoJobId && allJobs.length > 0) {
      const targetJob = allJobs.find(j => j.id === autoJobId);
      if (targetJob) {
        setActiveModalJob(targetJob);
        sessionStorage.removeItem('pending_job_apply');
      }
    }
  }, [user, searchParams, allJobs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKB = (file.size / 1024).toFixed(2);

      try {
        const textContent = await extractTextFromFile(file);
        const fileDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        let parsedJson = null;
        try {
          if (file.name.endsWith('.json') || textContent.trim().startsWith('{')) {
            parsedJson = JSON.parse(textContent);
          }
        } catch (err) {
          // Not valid JSON, treat as text/document
        }

        setUploadedCV({
          name: file.name,
          size: `${sizeKB} KB`,
          content: textContent,
          parsedJson,
          fileDataUrl
        });

        // Immediately save uploaded CV into Admin -> CV Management -> User CV Section
        try {
          const storedCvs = localStorage.getItem('codeskill_user_cvs');
          const parsedCvs = storedCvs ? JSON.parse(storedCvs) : [];
          const candidateEmail = localStorage.getItem('user_email') || 'candidate@codeskill.dev';
          const candidateName = resolveCandidateNameFromStorage(candidateEmail);

          let resumeData: any;
          if (parsedJson) {
            resumeData = {
              name: parsedJson.name || parsedJson.candidateName || candidateName,
              email: parsedJson.email || parsedJson.candidateEmail || candidateEmail,
              phone: parsedJson.phone || '+91 98111 22334',
              summary: parsedJson.summary || parsedJson.objective || '',
              skills: Array.isArray(parsedJson.skills) ? parsedJson.skills : ['React', 'TypeScript', 'Node.js'],
              education: Array.isArray(parsedJson.education) ? parsedJson.education : [],
              experience: Array.isArray(parsedJson.experience) ? parsedJson.experience : [],
              projects: Array.isArray(parsedJson.projects) ? parsedJson.projects : []
            };
          } else {
            resumeData = parseResumeContent(textContent, {
              fileName: file.name,
              fallbackName: candidateName,
              fallbackEmail: candidateEmail,
              jobRole: 'General Candidate Pool / Resume Upload',
              jobCompany: 'CodeSkill Candidates'
            });
          }

          const newJsonCv = {
            id: `user-cv-${Date.now()}`,
            candidateName: resumeData.name || candidateName,
            candidateEmail: resumeData.email || candidateEmail,
            phone: resumeData.phone || '+91 98111 22334',
            appliedRole: 'General Candidate Pool / Resume Upload',
            company: 'CodeSkill Candidates',
            appliedDate: 'Just now',
            resumeFileName: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
            storageFormat: 'PDF' as const,
            storageSizeKB: Number(sizeKB),
            fileDataUrl,
            resumeData
          };

          const updatedCvs = [newJsonCv, ...parsedCvs.filter((c: any) => c.resumeFileName !== file.name)];
          localStorage.setItem('codeskill_user_cvs', JSON.stringify(updatedCvs));
          window.dispatchEvent(new Event('user_cvs_updated'));
        } catch (err) {
          console.error('Error auto-saving uploaded CV:', err);
        }
      } catch (e) {
        console.error('Error extracting text from file:', e);
      }
    }
  };

  const handleApply = (job: JobOpportunity) => {
    if (!user) {
      sessionStorage.setItem('pending_job_apply', job.id);
      setPendingJob(job);
      setActiveModalJob(null);
      setShowAuthModal(true);
      return;
    }
    // Add to tracked applications if not already present
    const alreadyTracked = trackedApplications.some(t => t.jobId === job.id);
    if (!alreadyTracked) {
      const newTracked: TrackedApplication = {
        id: `track-${Date.now()}`,
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        appliedDate: 'Just now',
        currentStep: 1,
        statusLabel: 'Application Received',
        statusColor: 'amber',
        nextAction: 'Under ATS automated screening',
        atsScore: 85
      };
      setTrackedApplications([newTracked, ...trackedApplications]);
    }

    // Save EXACT Uploaded Resume in JSON format in Admin -> CV Management -> User CV Section
    try {
      const storedCvs = localStorage.getItem('codeskill_user_cvs');
      const parsedCvs = storedCvs ? JSON.parse(storedCvs) : [];

      const candidateEmail = localStorage.getItem('user_email') || 'candidate@codeskill.dev';
      const candidateName = resolveCandidateNameFromStorage(candidateEmail);
      const rawName = uploadedCV ? uploadedCV.name : `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
      const resumeFileName = rawName.replace(/\.[^/.]+$/, '') + '.pdf';

      let resumeData: any;
      if (uploadedCV && uploadedCV.parsedJson) {
        // If candidate uploaded a valid JSON resume file, store their exact JSON structure
        resumeData = {
          name: uploadedCV.parsedJson.name || uploadedCV.parsedJson.candidateName || candidateName,
          email: uploadedCV.parsedJson.email || uploadedCV.parsedJson.candidateEmail || candidateEmail,
          phone: uploadedCV.parsedJson.phone || '+91 98111 22334',
          summary: uploadedCV.parsedJson.summary || uploadedCV.parsedJson.objective || '',
          skills: Array.isArray(uploadedCV.parsedJson.skills) ? uploadedCV.parsedJson.skills : ['React', 'TypeScript', 'Node.js'],
          education: Array.isArray(uploadedCV.parsedJson.education) ? uploadedCV.parsedJson.education : [],
          experience: Array.isArray(uploadedCV.parsedJson.experience) ? uploadedCV.parsedJson.experience : [],
          projects: Array.isArray(uploadedCV.parsedJson.projects) ? uploadedCV.parsedJson.projects : []
        };
      } else if (uploadedCV && uploadedCV.content) {
        resumeData = parseResumeContent(uploadedCV.content, {
          fileName: uploadedCV.name,
          fallbackName: candidateName,
          fallbackEmail: candidateEmail,
          jobRole: job.title,
          jobCompany: job.company
        });
      } else {
        resumeData = {
          name: candidateName,
          email: candidateEmail,
          phone: '+91 98111 22334',
          summary: `Applicant for ${job.title} at ${job.company}.`,
          skills: job.skills && job.skills.length > 0 ? job.skills : ['React', 'TypeScript', 'Node.js', 'Problem Solving'],
          education: [
            { degree: 'B.Tech in Computer Science', institution: 'Tech University', year: '2020 - 2024' }
          ],
          experience: [
            { role: 'Software Engineer', company: 'Previous Tech Corp', duration: '2023 - Present', description: 'Developed full stack solutions and scalable frontend UI components.' }
          ],
          projects: [
            { name: 'Full-Stack Job Application & ATS Tracker', description: 'Built an integrated career platform with resume parser.' }
          ]
        };
      }

      const newJsonCv = {
        id: `user-cv-${Date.now()}`,
        candidateName: resumeData.name || candidateName,
        candidateEmail: resumeData.email || candidateEmail,
        phone: resumeData.phone || '+91 98111 22334',
        appliedRole: job.title,
        company: job.company,
        appliedDate: 'Just now',
        resumeFileName,
        storageFormat: 'PDF' as const,
        storageSizeKB: uploadedCV ? Number((uploadedCV.content?.length || 1400) / 1024).toFixed(2) : 1.4,
        fileDataUrl: uploadedCV?.fileDataUrl,
        resumeData
      };

      const updatedCvs = [newJsonCv, ...parsedCvs];
      localStorage.setItem('codeskill_user_cvs', JSON.stringify(updatedCvs));
      window.dispatchEvent(new Event('user_cvs_updated'));
    } catch (err) {
      console.error('Error saving User CV in JSON format:', err);
    }

    alert(`Application Submitted successfully for ${job.title} @ ${job.company}!`);
    setActiveModalJob(null);
  };

  const handleTabChange = (tab: 'browse' | 'tracker') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'All' || job.type === selectedType || job.workplace === selectedType;
    const matchesExp = selectedExperience === 'All' || job.experience === selectedExperience;

    return matchesSearch && matchesType && matchesExp;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            <span>CodeSkill Career Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Discover Top Tech <span className="text-emerald-600 dark:text-emerald-400">Jobs & Track Progress</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Explore curated opportunities matching your skills and monitor every stage of your job application pipeline in real-time.
          </p>
        </div>

        {/* 4 Feature/Section Boxes Aligned in a Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {/* Box 1: Browse Jobs */}
          <button
            onClick={() => handleTabChange('browse')}
            className={`group relative text-left overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border p-5 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg ${activeTab === 'browse'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/60'
              }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                {activeTab === 'browse' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {SAMPLE_JOBS.length} Roles
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Browse Jobs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Explore & apply to tech jobs
                </p>
              </div>
            </div>
          </button>

          {/* Box 2: Track Application Progress */}
          <button
            onClick={() => handleTabChange('tracker')}
            className={`group relative text-left overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border p-5 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg ${activeTab === 'tracker'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/60'
              }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {trackedApplications.length} Tracked
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Track Applications
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Monitor interview progress
                </p>
              </div>
            </div>
          </button>

          {/* Box 3: Resume Builder (renamed from iResume) */}
          <Link
            to="/cv-builder?view=editor"
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Resume Builder
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Create & customize your CV
                </p>
              </div>
            </div>
          </Link>

          {/* Box 4: Resume Analysis */}
          <Link
            to="/ats-checker"
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Resume Analysis
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Test ATS compatibility
                </p>
              </div>
            </div>
          </Link>
        </div>

        {activeTab === 'browse' ? (
          /* ================= BROWSE JOBS TAB ================= */
          <div className="space-y-8">
            {/* Upload CV Section Banner */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    {uploadedCV ? <FileCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>Upload Your CV to Apply & Match</span>
                      {uploadedCV && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Active CV Attached
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {uploadedCV
                        ? `Using ${uploadedCV.name} (${uploadedCV.size}) for 1-click apply and automated ATS screening.`
                        : 'Upload your latest resume (.pdf, .doc, .docx) to enable fast applying across all tech roles.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  {uploadedCV ? (
                    <>
                      <button
                        onClick={() => setUploadedCV(null)}
                        className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                      <label className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center space-x-2 shadow-sm">
                        <UploadCloud className="w-4 h-4" />
                        <span>Replace CV</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <label className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 shadow-md hover:shadow-emerald-500/20">
                      <UploadCloud className="w-5 h-5" />
                      <span>Upload CV (.PDF / .DOC)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Megaphone className="w-6 h-6 text-rose-500" />
                <span>Live Job Opportunities</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Browse all active tech roles posted by companies & recruiters.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by role, company, or skills (e.g. React, Python)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="All">All Job Types</option>
                    <option value="Internship">Internships</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Remote">Remote Only</option>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="All">All Experience</option>
                    <option value="Internship">Internship Level</option>
                    <option value="Fresher">Fresher / Graduate</option>
                    <option value="0-2 Years">0-2 Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Cards Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">
                  Available Opportunities ({filteredJobs.length})
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing curated roles for CodeSkill learners
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                  <Briefcase className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">No matching jobs found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('All');
                      setSelectedExperience('All');
                    }}
                    className="mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => {
                    const isApplied = trackedApplications.some(t => t.jobId === job.id);
                    return (
                      <div
                        key={job.id}
                        className="group bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                {job.company.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {job.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center space-x-1.5 mt-0.5">
                                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{job.company}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-1.5">
                              {job.featured && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  Featured
                                </span>
                              )}
                              {job.vacanciesCount && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  {job.vacanciesCount} Vacancies Open
                                </span>
                              )}
                              {job.deadline && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  Apply by {job.deadline}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{job.location}</span>
                            </span>
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{job.salary}</span>
                            </span>
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>{job.posted}</span>
                            </span>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200/70 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 border border-slate-300/50 dark:border-slate-600/50"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Level: <strong className="text-slate-900 dark:text-slate-200">{job.experience}</strong>
                          </span>

                          <button
                            onClick={() => setActiveModalJob(job)}
                            disabled={isApplied}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${isApplied
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:shadow-emerald-500/20'
                              }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Tracked in Progress</span>
                              </>
                            ) : (
                              <>
                                <span>Apply</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= TRACK APPLICATION PROGRESS TAB ================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-md gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>My Application Progress Pipeline</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Track resume screening, technical rounds, and interview decisions in real-time.
                </p>
              </div>
              <Link
                to="/cv-builder"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold transition-colors w-fit"
              >
                <FileText className="w-4 h-4" />
                <span>Update Submitted Resume</span>
              </Link>
            </div>

            <div className="space-y-6">
              {trackedApplications.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                  <TrendingUp className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300">No applications tracked yet</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Start applying from the "Browse Jobs" tab to see your progress pipeline here.
                  </p>
                  <button
                    onClick={() => handleTabChange('browse')}
                    className="mt-4 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Browse Opportunities
                  </button>
                </div>
              ) : (
                trackedApplications.map((app) => {
                  const getStatusBadgeStyle = (color: string) => {
                    switch (color) {
                      case 'emerald':
                        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                      case 'blue':
                        return 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400';
                      case 'purple':
                        return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400';
                      default:
                        return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
                    }
                  };

                  return (
                    <div
                      key={app.id}
                      className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-md space-y-6"
                    >
                      {/* Title & Status Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/80 pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                              {app.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                                app.statusColor
                              )}`}
                            >
                              {app.statusLabel}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              <strong>{app.company}</strong>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>{app.location}</span>
                            </span>
                            <span className="text-slate-500 text-xs">
                              Applied: {app.appliedDate}
                            </span>
                          </p>
                        </div>

                        {app.atsScore && (
                          <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">ATS Match Score</div>
                              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{app.atsScore}%</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4-Step Progress Tracker Bar */}
                      <div className="py-4">
                        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
                          {PROGRESS_STEPS.map((stepItem, idx) => {
                            const isCompleted = stepItem.step < app.currentStep;
                            const isCurrent = stepItem.step === app.currentStep;

                            return (
                              <div key={stepItem.step} className="flex flex-col items-center text-center relative">
                                {/* Connecting line between dots */}
                                {idx < PROGRESS_STEPS.length - 1 && (
                                  <div
                                    className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors duration-300 ${stepItem.step < app.currentStep
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-200 dark:bg-slate-700'
                                      }`}
                                  />
                                )}

                                {/* Dot / Icon */}
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all ${isCompleted
                                      ? 'bg-emerald-500 text-white shadow-md'
                                      : isCurrent
                                        ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg ring-4 ring-emerald-500/20'
                                        : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                                    }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                  ) : isCurrent ? (
                                    <CircleDot className="w-5 h-5 animate-pulse" />
                                  ) : (
                                    <span className="text-xs font-bold">{stepItem.step}</span>
                                  )}
                                </div>

                                {/* Step label */}
                                <div className="mt-2 space-y-0.5">
                                  <div
                                    className={`text-xs sm:text-sm font-bold ${isCompleted || isCurrent
                                        ? 'text-slate-900 dark:text-white'
                                        : 'text-slate-400 dark:text-slate-500'
                                      }`}
                                  >
                                    {stepItem.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                                    {stepItem.desc}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Next Action & Action Buttons */}
                      <div className="bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300">
                            <strong>Next Step:</strong> {app.nextAction || 'Awaiting recruiter feedback'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Link
                            to="/ats-checker"
                            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            Check ATS Match
                          </Link>
                          <Link
                            to="/cv-builder"
                            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold transition-colors"
                          >
                            View Submitted CV
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application Confirmation Modal */}
      {activeModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Apply: {activeModalJob.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You are applying to <strong>{activeModalJob.company}</strong> ({activeModalJob.location}).
              </p>
            </div>

            {/* Upload CV Section inside Modal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Attach Resume / CV
              </label>
              {uploadedCV ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {uploadedCV.name}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {uploadedCV.size} • ATS Checked
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedCV(null)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Remove uploaded CV"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all group">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Click to Upload Custom CV (.PDF / .DOC)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Max file size 5MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Profile Resume:</span>
                <Link to="/cv-builder" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium text-xs">
                  Edit in Resume →
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">ATS Score Check:</span>
                <Link to="/ats-checker" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs">
                  Verify ATS Match →
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveModalJob(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApply(activeModalJob)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-semibold transition-colors shadow-lg"
              >
                Confirm Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Modal for Job Applications */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden text-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
              <LockKeyhole className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Login Required to Apply</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Please log in or create a free account to submit your application for <span className="text-emerald-400 font-bold">{pendingJob?.title || 'this position'}</span> at <span className="text-emerald-400 font-bold">{pendingJob?.company || 'the company'}</span>.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login', { state: { from: `/jobs?autoApply=${pendingJob?.id || ''}` } })}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Log In & Apply</span>
              </button>
              <button
                onClick={() => navigate('/register', { state: { from: `/jobs?autoApply=${pendingJob?.id || ''}` } })}
                className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
