import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Briefcase, 
  Clock, 
  ExternalLink, 
  X, 
  Layers, 
  Tag, 
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PublishedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract' | 'Remote';
  workplace: 'Remote' | 'On-site' | 'Hybrid';
  salary: string;
  experience: 'Fresher' | '0-2 Years' | '2-4 Years' | 'Internship';
  skills: string[];
  posted: string;
  featured?: boolean;
  description: string;
  applicantCount?: number;
}

const DEFAULT_PUBLISHED_JOBS: PublishedJob[] = [
  {
    id: 'pub-job-1',
    title: 'Frontend React Developer (Next.js & AI)',
    company: 'CodeSkill Careers',
    location: 'Bangalore, India',
    type: 'Full-time',
    workplace: 'Hybrid',
    salary: '₹14,00,000 - ₹20,00,000 PA',
    experience: '0-2 Years',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
    posted: 'Just now',
    featured: true,
    description: 'We are hiring a passionate Frontend Engineer to build stunning, responsive web portals for our edtech and candidate placement platform.',
    applicantCount: 24
  },
  {
    id: 'pub-job-2',
    title: 'Full Stack Node / TypeScript Intern',
    company: 'TechMatrix Global',
    location: 'Remote',
    type: 'Internship',
    workplace: 'Remote',
    salary: '₹35,000 / month + PPO',
    experience: 'Internship',
    skills: ['Node.js', 'TypeScript', 'Express', 'PostgreSQL', 'Docker'],
    posted: '1 day ago',
    featured: true,
    description: 'Work directly with lead architects to develop secure REST and GraphQL APIs for high-throughput enterprise systems.',
    applicantCount: 58
  },
  {
    id: 'pub-job-3',
    title: 'Junior Machine Learning & LLM Engineer',
    company: 'NeuralVision Labs',
    location: 'Hyderabad, India',
    type: 'Full-time',
    workplace: 'On-site',
    salary: '₹16,00,000 - ₹24,00,000 PA',
    experience: '0-2 Years',
    skills: ['Python', 'PyTorch', 'Transformers', 'LangChain', 'FastAPI'],
    posted: '2 days ago',
    featured: false,
    description: 'Design and fine-tune large language models and retrieval-augmented generation (RAG) pipelines for customer intelligence.',
    applicantCount: 41
  }
];

const STORAGE_KEY = 'codeskill_published_jobs';

export default function JobPublishingManagement() {
  const [jobs, setJobs] = useState<PublishedJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading published jobs from localStorage', e);
    }
    return DEFAULT_PUBLISHED_JOBS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<PublishedJob['type']>('Full-time');
  const [workplace, setWorkplace] = useState<PublishedJob['workplace']>('Hybrid');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState<PublishedJob['experience']>('0-2 Years');
  const [skillsInput, setSkillsInput] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(true);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      // Dispatch custom storage event so other tabs/pages know immediately
      window.dispatchEvent(new Event('published_jobs_updated'));
    } catch (e) {
      console.error('Error saving published jobs to localStorage', e);
    }
  }, [jobs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePublishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !location || !salary || !description) {
      showToast('Please fill in all required fields.');
      return;
    }

    const parsedSkills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newJob: PublishedJob = {
      id: `pub-${Date.now()}`,
      title,
      company,
      location,
      type,
      workplace,
      salary,
      experience,
      skills: parsedSkills.length > 0 ? parsedSkills : ['React', 'TypeScript', 'Node.js', 'Problem Solving'],
      posted: 'Just now',
      featured,
      description,
      applicantCount: 0
    };

    setJobs([newJob, ...jobs]);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setCompany('');
    setLocation('');
    setSalary('');
    setSkillsInput('');
    setDescription('');
    setFeatured(true);

    showToast(`Job "${newJob.title}" published successfully to Career Site!`);
  };

  const handleDeleteJob = (id: string, jobTitle: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    showToast(`Unpublished "${jobTitle}" from site.`);
  };

  const handleToggleFeatured = (id: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === id ? { ...j, featured: !j.featured } : j))
    );
    showToast('Updated featured status.');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'All' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPublished = jobs.length;
  const featuredCount = jobs.filter(j => j.featured).length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-primary text-slate-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center space-x-3">
            <Megaphone className="w-8 h-8 text-rose-500" />
            <span>Publish Jobs to Career Portal</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Post open positions with full salary, skills, and details directly to the public Career portal.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/jobs"
            target="_blank"
            className="inline-flex items-center space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-secondary font-semibold rounded-xl border border-border transition-all text-sm"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>View Live Career Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-text-inverse font-bold rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>+ Publish New Job on Site</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Published Jobs</p>
            <p className="text-2xl font-extrabold text-text-primary mt-1">{totalPublished}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Featured Opportunities</p>
            <p className="text-2xl font-extrabold text-primary mt-1">{featuredCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Applications Received</p>
            <p className="text-2xl font-extrabold text-primary mt-1">{totalApplicants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search title, company, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500 text-sm"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-text-muted" />
          <span className="text-xs text-text-muted font-semibold uppercase">Filter Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Published Jobs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full bg-surface dark:bg-[#111827] border border-border rounded-2xl p-12 text-center text-text-muted">
            No published jobs match your filters. Click "+ Publish New Job on Site" to post a new opening.
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-surface dark:bg-[#111827] border border-border hover:border-border rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        LIVE ON SITE
                      </span>
                      {job.featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mt-2">{job.title}</h3>
                    <p className="text-sm font-semibold text-text-secondary flex items-center space-x-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-text-muted" />
                      <span>{job.company}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                    title="Unpublish / Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                  <span className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                    <span>{job.salary}</span>
                  </span>
                  <span className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>{job.type} ({job.workplace})</span>
                  </span>
                </div>

                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  Applicants: <strong className="text-text-primary">{job.applicantCount || 0}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFeatured(job.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                      job.featured
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-text-muted hover:text-text-inverse'
                    }`}
                  >
                    {job.featured ? 'â˜… Featured' : 'â˜† Make Featured'}
                  </button>
                  <Link
                    to="/jobs"
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-secondary font-semibold transition-colors flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-rose-500" />
                <span>Publish New Job to Site</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishJob} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend React Developer"
                    className="w-full px-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google India / CodeSkill Labs"
                    className="w-full px-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore / Remote"
                    className="w-full px-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Job Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary focus:outline-none focus:border-rose-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Workplace Mode
                  </label>
                  <select
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary focus:outline-none focus:border-rose-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Salary / Stipend *
                  </label>
                  <input
                    type="text"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. ₹12,00,000 - ₹18,00,000 PA"
                    className="w-full px-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary focus:outline-none focus:border-rose-500"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-2 Years">0-2 Years</option>
                    <option value="2-4 Years">2-4 Years</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Next.js, Node.js, AWS"
                  className="w-full px-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                  Detailed Job Description & Responsibilities *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, team culture, responsibilities, and perks..."
                  className="w-full px-4 py-2.5 bg-background dark:bg-[#0B0F19] border border-border rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-job"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-slate-50 dark:bg-slate-900 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="featured-job" className="text-xs text-text-secondary font-medium cursor-pointer">
                  Mark as Featured Opportunity (displays banner badge on site)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-muted hover:text-text-primary transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-text-inverse font-bold rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all"
                >
                  Publish Job to Career Site Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
