import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Link as LinkIcon,
  Briefcase,
  ChevronRight,
  Tags,
  Tag,
  User,
  Download,
  Eye,
  X,
  Code,
  CheckCircle2,
  Database,
  Zap,
  Sparkles,
  FileCode,
  Search
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../../utils/apiConfig';
import { sanitizeStoredCv } from '../../utils/cvParser';
import DriveImage from '../../components/DriveImage';

interface SampleCV {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  imageUrl?: string | null;
  redirectUrl?: string | null;
  category: string | null;
  createdAt: string;
}

interface JobSkillMap {
  id: string;
  jobRole: string;
  skills: string[];
  createdAt: string;
}

export interface UserCVEntry {
  id: string;
  candidateName: string;
  candidateEmail: string;
  phone: string;
  appliedRole: string;
  company: string;
  appliedDate: string;
  resumeFileName: string;
  storageFormat: 'PDF' | 'JSON';
  storageSizeKB: number;
  rawUploadedContent?: string;
  fileDataUrl?: string;
  resumeData: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    education: { degree: string; institution: string; year: string }[];
    experience: { role: string; company: string; duration: string; description: string }[];
    projects: { name: string; description: string }[];
  };
}

const DEFAULT_USER_CVS: UserCVEntry[] = [
  {
    id: 'user-cv-101',
    candidateName: 'Aarav Sharma',
    candidateEmail: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    appliedRole: 'Senior Frontend React Developer',
    company: 'CodeSkill Labs',
    appliedDate: 'Just now',
    resumeFileName: 'Aarav_Sharma_Resume.pdf',
    storageFormat: 'PDF',
    storageSizeKB: 1.4,
    resumeData: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      summary: 'Passionate Senior Frontend Engineer with 4+ years of expertise building scalable React & Next.js applications, AI integrations, and responsive UI systems.',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'AI Agents', 'GraphQL'],
      education: [
        { degree: 'B.Tech in Computer Science', institution: 'IIT Bombay', year: '2020 - 2024' }
      ],
      experience: [
        { role: 'Frontend Engineer', company: 'TechMatrix Global', duration: '2024 - Present', description: 'Architected high-performance web apps, reduced bundle size by 35%, and integrated automated ATS screening tools.' }
      ],
      projects: [
        { name: 'AI Career Coach Platform', description: 'Built an AI-powered career counseling app using Next.js and Tailwind.' }
      ]
    }
  },
  {
    id: 'user-cv-102',
    candidateName: 'Priya Patel',
    candidateEmail: 'priya.patel@devmail.org',
    phone: '+91 91234 56789',
    appliedRole: 'Full Stack Node / TypeScript Intern',
    company: 'Microsoft India',
    appliedDate: '1 hr ago',
    resumeFileName: 'Priya_Patel_CV.pdf',
    storageFormat: 'PDF',
    storageSizeKB: 1.2,
    resumeData: {
      name: 'Priya Patel',
      email: 'priya.patel@devmail.org',
      phone: '+91 91234 56789',
      summary: 'Full stack developer focused on backend architectures, cloud deployments, and clean RESTful API design.',
      skills: ['Node.js', 'TypeScript', 'Express', 'PostgreSQL', 'Docker', 'React', 'MongoDB'],
      education: [
        { degree: 'B.E. in Information Technology', institution: 'BITS Pilani', year: '2021 - 2025' }
      ],
      experience: [
        { role: 'Backend Engineering Intern', company: 'CloudScale Inc', duration: 'Summer 2024', description: 'Developed microservices in Node.js and optimized PostgreSQL query execution times by 40%.' }
      ],
      projects: [
        { name: 'Distributed Job Portal API', description: 'Designed high-availability job listing backend with Redis caching and JWT auth.' }
      ]
    }
  }
];

export default function CvManagement() {
  const [activeTab, setActiveTab] = useState<'samples' | 'skills' | 'user_cvs'>('user_cvs');

  // Samples State
  const [samples, setSamples] = useState<SampleCV[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Skills State
  const [jobSkillMaps, setJobSkillMaps] = useState<JobSkillMap[]>([]);
  const [jobRole, setJobRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  });

  // User CVs (JSON Format) State
  const [userCvs, setUserCvs] = useState<UserCVEntry[]>([]);
  const [selectedCvForView, setSelectedCvForView] = useState<UserCVEntry | null>(null);
  const [userCvSearch, setUserCvSearch] = useState('');

  const resolveCandidateName = (name: string, email?: string) => {
    if (name && name !== 'Logged In Candidate' && name !== 'Candidate') {
      return name;
    }
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
    } catch (e) {}

    if (email) {
      const prefix = email.split('@')[0];
      const cleaned = prefix.replace(/[0-9]+$/, '').replace(/[._-]+/g, ' ').trim();
      if (cleaned) {
        return cleaned
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    return 'Candidate';
  };

  const loadUserCvs = () => {
    try {
      const stored = localStorage.getItem('codeskill_user_cvs');
      if (stored) {
        const parsed: UserCVEntry[] = JSON.parse(stored);
        const resolved = parsed.map(cv => {
          const realName = resolveCandidateName(cv.candidateName, cv.candidateEmail);
          const pdfFileName = (cv.resumeFileName || '').replace(/\.json$/i, '.pdf');
          const baseCv = {
            ...cv,
            candidateName: realName || 'Candidate',
            resumeFileName: pdfFileName.endsWith('.pdf') ? pdfFileName : (pdfFileName ? `${pdfFileName}.pdf` : 'Candidate_Resume.pdf'),
            storageFormat: 'PDF' as const,
            resumeData: {
              ...(cv.resumeData || {}),
              name: realName || 'Candidate'
            }
          };
          return sanitizeStoredCv(baseCv);
        });
        setUserCvs(resolved);
        localStorage.setItem('codeskill_user_cvs', JSON.stringify(resolved));
      } else {
        localStorage.setItem('codeskill_user_cvs', JSON.stringify(DEFAULT_USER_CVS));
        setUserCvs(DEFAULT_USER_CVS);
      }
    } catch (err) {
      console.error('Error loading User CVs from localStorage:', err);
      setUserCvs(DEFAULT_USER_CVS);
    }
  };

  useEffect(() => {
    fetchSamples();
    fetchJobSkills();
    loadUserCvs();

    window.addEventListener('user_cvs_updated', loadUserCvs);
    return () => {
      window.removeEventListener('user_cvs_updated', loadUserCvs);
    };
  }, []);

  const handleDeleteUserCv = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this candidate resume from storage?')) return;
    const updated = userCvs.filter(cv => cv.id !== id);
    setUserCvs(updated);
    localStorage.setItem('codeskill_user_cvs', JSON.stringify(updated));
    window.dispatchEvent(new Event('user_cvs_updated'));
  };

  const handleDownloadJson = (cv: UserCVEntry) => {
    const jsonString = JSON.stringify(cv.resumeData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.candidateName.replace(/\s+/g, '_')}_Resume.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = (cv: UserCVEntry) => {
    if (cv.fileDataUrl && cv.fileDataUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = cv.fileDataUrl;
      link.download = cv.resumeFileName || 'Candidate_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cv.candidateName} - Resume</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 28px; margin-bottom: 4px; color: #0f172a; }
            .meta { font-size: 14px; color: #475569; margin-bottom: 24px; }
            .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #059669; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
            .item { margin-bottom: 16px; }
            .item-title { font-weight: bold; color: #0f172a; }
            .item-sub { font-size: 13px; color: #64748b; }
            ul { margin: 8px 0; padding-left: 20px; }
            .skills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
            .skill { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
          </style>
        </head>
        <body>
          <h1>${cv.candidateName}</h1>
          <div class="meta">${cv.candidateEmail} • ${cv.phone}</div>
          
          <div class="section-title">Professional Summary</div>
          <p>${cv.resumeData.summary || 'Experienced software professional.'}</p>
          
          <div class="section-title">Skills & Technologies</div>
          <div class="skills">
            ${cv.resumeData.skills.map(s => `<span class="skill">${s}</span>`).join('')}
          </div>

          <div class="section-title">Experience</div>
          ${cv.resumeData.experience.map(e => `
            <div class="item">
              <div class="item-title">${e.role} — ${e.company}</div>
              <div class="item-sub">${e.duration}</div>
              <p>${e.description}</p>
            </div>
          `).join('')}

          <div class="section-title">Education</div>
          ${cv.resumeData.education.map(ed => `
            <div class="item">
              <div class="item-title">${ed.degree}</div>
              <div class="item-sub">${ed.institution} (${ed.year})</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleAddSampleUserCv = () => {
    const names = ['Rohan Verma', 'Ananya Gupta', 'Vikram Singh', 'Sneha Iyer'];
    const roles = ['Full Stack Developer', 'Backend TypeScript Engineer', 'React Frontend Specialist', 'AI Software Engineer'];
    const companies = ['Google India', 'Amazon Web Services', 'CodeSkill Enterprise', 'Flipkart Tech'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];

    const newEntry: UserCVEntry = {
      id: `user-cv-${Date.now()}`,
      candidateName: randomName,
      candidateEmail: `${randomName.toLowerCase().replace(/\s+/g, '.')}@devmail.org`,
      phone: '+91 ' + Math.floor(8000000000 + Math.random() * 1999999999),
      appliedRole: randomRole,
      company: randomCompany,
      appliedDate: 'Just now',
      resumeFileName: `${randomName.replace(/\s+/g, '_')}_Resume.pdf`,
      storageFormat: 'PDF',
      storageSizeKB: 1.3,
      resumeData: {
        name: randomName,
        email: `${randomName.toLowerCase().replace(/\s+/g, '.')}@devmail.org`,
        phone: '+91 ' + Math.floor(8000000000 + Math.random() * 1999999999),
        summary: `Experienced developer specializing in ${randomRole} with a strong track record of delivery and performance optimization.`,
        skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js', 'REST API', 'Git'],
        education: [
          { degree: 'B.Tech in Computer Engineering', institution: 'National Institute of Technology', year: '2019 - 2023' }
        ],
        experience: [
          { role: randomRole, company: randomCompany, duration: '2023 - Present', description: 'Led frontend & backend feature rollouts, improved response times by 30%, and mentored junior engineers.' }
        ],
        projects: [
          { name: 'Cloud Resume Parser & ATS Score Engine', description: 'Developed an automated resume ranking service using Node.js and TypeScript.' }
        ]
      }
    };

    const updated = [newEntry, ...userCvs];
    setUserCvs(updated);
    localStorage.setItem('codeskill_user_cvs', JSON.stringify(updated));
    window.dispatchEvent(new Event('user_cvs_updated'));
  };

  const fetchSamples = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/cv/samples`, getHeaders());
      setSamples(res.data);
    } catch (error) {
      console.error('Failed to fetch CV samples:', error);
    }
  };

  const fetchJobSkills = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/cv/skills`, getHeaders());
      setJobSkillMaps(res.data);
    } catch (error) {
      console.error('Failed to fetch job skills:', error);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !imageUrl) return alert('Please provide a Sample Image URL or upload a file/image');
    if (!title) return alert('Title is required');

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('redirectUrl', redirectUrl);
    formData.append('imageUrl', imageUrl);
    formData.append('previewUrl', imageUrl);
    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post(`${API_URL}/api/v1/admin/cv/samples`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      alert('CV Sample uploaded successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setRedirectUrl('');
      setImageUrl('');
      setFile(null);
      fetchSamples();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSample = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sample?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/cv/samples/${id}`, getHeaders());
      alert('Deleted successfully');
      setSamples(samples.filter(s => s.id !== id));
    } catch (error) {
      alert('Failed to delete sample');
    }
  };

  const addSkillToCurrent = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills([...currentSkills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkillFromCurrent = (index: number) => {
    setCurrentSkills(currentSkills.filter((_, i) => i !== index));
  };

  const handleSaveJobSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim() || currentSkills.length === 0) {
      return alert('Job Role and at least one skill are required');
    }

    setIsSavingSkill(true);
    try {
      await axios.post(`${API_URL}/api/v1/admin/cv/skills`, {
        jobRole: jobRole.trim(),
        skills: currentSkills
      }, getHeaders());
      alert('Job skills saved successfully');
      setJobRole('');
      setCurrentSkills([]);
      fetchJobSkills();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save job skills');
    } finally {
      setIsSavingSkill(false);
    }
  };

  const deleteJobSkillMap = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job role mapping?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/cv/skills/${id}`, getHeaders());
      alert('Deleted successfully');
      setJobSkillMaps(jobSkillMaps.filter(m => m.id !== id));
    } catch (error) {
      alert('Failed to delete mapping');
    }
  };

  const removeIndividualSkill = async (mapId: string, skill: string) => {
    try {
      await axios.put(`${API_URL}/api/v1/admin/cv/skills/remove/${mapId}`, { skill }, getHeaders());
      fetchJobSkills();
    } catch (error) {
      alert('Failed to remove skill');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary dark:text-text-primary mb-2">CV Management</h1>
          <p className="text-text-muted dark:text-text-muted">Manage sample CV templates and job-specific skills mappings.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-border dark:border-border mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('samples')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${activeTab === 'samples'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
              : 'text-text-muted hover:text-text-primary dark:hover:text-text-secondary'
            }`}
        >
          CV Template Samples
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${activeTab === 'skills'
              ? 'text-fuchsia-600 dark:text-fuchsia-400 border-b-2 border-fuchsia-500'
              : 'text-text-muted hover:text-text-primary dark:hover:text-text-secondary'
            }`}
        >
          Job Skills
        </button>
        <button
          onClick={() => setActiveTab('user_cvs')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center space-x-2 ${activeTab === 'user_cvs'
              ? 'text-primary dark:text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-text-primary dark:hover:text-text-secondary'
            }`}
        >
          <span>User CV Section</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary dark:text-primary font-extrabold tracking-normal">
            PDF Form ({userCvs.length})
          </span>
        </button>
      </div>

      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1 glass-card bg-surface/80 dark:bg-background/80 p-6 rounded-2xl border border-border dark:border-border">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Plus className="w-5 h-5 mr-2 text-indigo-500" /> Add CV Template Sample</h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Sample CV Name / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Modern Tech Specialist CV"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Sample Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. https://example.com/sample-cv.png"
                />
                <p className="text-xs text-text-muted mt-1">Paste an image link OR upload an image/file below.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Redirect Page Link</label>
                <input
                  type="text"
                  value={redirectUrl}
                  onChange={e => setRedirectUrl(e.target.value)}
                  className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. /cv-builder"
                />
                <p className="text-xs text-text-muted mt-1">URL to open when a user clicks on this template sample.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Software Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 h-20"
                  placeholder="Brief note about this template..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Upload Sample File / Image (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-text-inverse font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Saving...' : 'Add Template Sample'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {samples.map(sample => {
                return (
                  <div key={sample.id} className="bg-surface dark:bg-background border border-border dark:border-border rounded-2xl p-5 relative group flex flex-col justify-between">
                    <div>
                      <div className="mb-4 rounded-xl overflow-hidden bg-surface-secondary dark:bg-slate-800 h-44 flex items-center justify-center border border-border dark:border-border">
                        <DriveImage sample={sample} apiUrl={API_URL} />
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                        <h3 className="font-bold text-lg text-text-primary dark:text-text-primary">{sample.title}</h3>
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2 mb-2">{sample.description || 'No description'}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sample.category && (
                          <span className="px-3 py-1 bg-surface-secondary dark:bg-slate-800 text-xs font-semibold rounded-full text-text-secondary dark:text-text-secondary">
                            {sample.category}
                          </span>
                        )}
                        {sample.redirectUrl && (
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full truncate max-w-[180px]">
                            Redirects to: {sample.redirectUrl}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-slate-100 dark:border-border pt-4">
                      <div className="flex items-center space-x-3">
                        {sample.redirectUrl && (
                          <a
                            href={sample.redirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-500 text-text-inverse px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Open CV Page
                          </a>
                        )}
                        {sample.fileUrl && (
                          <a
                            href={`${sample.fileUrl.startsWith('http') ? '' : `${API_URL}/public`}${sample.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-bold flex items-center"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" /> View File
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteSample(sample.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-colors" title="Delete sample">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {samples.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted">
                  No sample CVs uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Job Role Form */}
          <div className="lg:col-span-1 glass-card bg-surface/80 dark:bg-background/80 p-6 rounded-2xl border border-border dark:border-border">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-fuchsia-500" /> Map Job Skills</h2>
            <form onSubmit={handleSaveJobSkills} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Job Role</label>
                <input
                  type="text"
                  required
                  value={jobRole}
                  onChange={e => setJobRole(e.target.value)}
                  className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="e.g. Backend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-text-secondary mb-1">Add Skills</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkillToCurrent())}
                    className="flex-1 bg-background dark:bg-background border border-border dark:border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-fuchsia-500"
                    placeholder="e.g. Node.js"
                  />
                  <button type="button" onClick={addSkillToCurrent} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 px-4 rounded-xl font-bold">Add</button>
                </div>
              </div>

              {currentSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentSkills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 px-3 py-1 rounded-full text-sm font-semibold">
                      <span>{skill}</span>
                      <button type="button" onClick={() => removeSkillFromCurrent(index)} className="hover:text-rose-500 ml-1">&times;</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingSkill}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-text-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
              >
                {isSavingSkill ? 'Saving...' : 'Save Job Skills'}
              </button>
            </form>
          </div>

          {/* List mapped skills */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {jobSkillMaps.map(map => (
                <div key={map.id} className="bg-surface dark:bg-background border border-border dark:border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <ChevronRight className="w-5 h-5 text-fuchsia-500 mr-1" />
                      {map.jobRole}
                    </h3>
                    <button onClick={() => deleteJobSkillMap(map.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-colors" title="Delete role map">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {map.skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-surface-secondary dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm border border-border dark:border-border group">
                        <Tag className="w-3 h-3 text-text-muted" />
                        <span className="font-semibold text-text-primary dark:text-text-secondary">{skill}</span>
                        <button onClick={() => removeIndividualSkill(map.id, skill)} className="text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {jobSkillMaps.length === 0 && (
                <div className="py-12 text-center text-text-muted">
                  No job skills mapped yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER CV SECTION (JSON FILE FORM - LOW STORAGE) */}
      {activeTab === 'user_cvs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Storage Efficiency Explanation Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-sky-500/10 to-indigo-500/10 border border-primary/30 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary dark:text-primary shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-text-primary dark:text-text-primary flex items-center space-x-2">
                    <span>User CV Section (PDF Form)</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-primary text-text-inverse font-bold">
                      PDF Storage Form
                    </span>
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-text-muted mt-1">
                    When users upload their resume or apply for jobs, their resume is automatically stored in <strong>secure PDF form</strong>, ensuring universal compatibility and easy viewing.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right px-4 py-2 bg-surface dark:bg-slate-800 rounded-xl border border-border dark:border-border">
                  <div className="text-[11px] text-text-muted font-bold uppercase">Total Stored</div>
                  <div className="text-lg font-black text-primary dark:text-primary">
                    {userCvs.length} Resumes
                  </div>
                </div>
                <div className="text-right px-4 py-2 bg-surface dark:bg-slate-800 rounded-xl border border-border dark:border-border">
                  <div className="text-[11px] text-text-muted font-bold uppercase">Total Storage Size</div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {(userCvs.reduce((acc, cv) => acc + (cv.storageSizeKB || 1.3), 0)).toFixed(2)} KB
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={userCvSearch}
                onChange={(e) => setUserCvSearch(e.target.value)}
                placeholder="Search by candidate name, applied job role, company, or skill..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-background border border-border dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddSampleUserCv}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary text-text-inverse font-bold text-sm rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Sample Candidate PDF CV</span>
            </button>
          </div>

          {/* Candidates CV Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCvs
              .filter(cv => {
                const search = (userCvSearch || '').toLowerCase();
                return (
                  (cv.candidateName || '').toLowerCase().includes(search) ||
                  (cv.appliedRole || '').toLowerCase().includes(search) ||
                  (cv.company || '').toLowerCase().includes(search) ||
                  (cv.resumeData?.skills || []).some(s => (s || '').toLowerCase().includes(search))
                );
              })
              .map((cv) => (
                <div
                  key={cv.id}
                  className="bg-surface dark:bg-background border border-border dark:border-border hover:border-primary/50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary dark:text-primary font-bold text-base">
                          {cv.candidateName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary dark:text-text-primary text-base group-hover:text-primary dark:group-hover:text-primary transition-colors">
                            {cv.candidateName}
                          </h4>
                          <p className="text-xs text-text-muted dark:text-text-muted">
                            {cv.candidateEmail}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-primary font-extrabold text-[11px] border border-primary/20 shrink-0">
                        <FileCode className="w-3 h-3" />
                        <span>{cv.storageFormat} • {cv.storageSizeKB} KB</span>
                      </span>
                    </div>

                    <div className="bg-background dark:bg-slate-800 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted font-semibold uppercase text-[10px]">Applied Role</span>
                        <span className="font-bold text-text-primary dark:text-text-secondary">{cv.appliedRole}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted font-semibold uppercase text-[10px]">Company</span>
                        <span className="font-semibold text-text-primary dark:text-text-secondary">{cv.company}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted font-semibold uppercase text-[10px]">File Name</span>
                        <span className="font-mono text-primary dark:text-primary text-[11px]">{cv.resumeFileName}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Key Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.resumeData.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-surface-secondary dark:bg-slate-800 text-text-primary dark:text-text-secondary rounded-md text-[11px] font-semibold border border-border dark:border-border"
                          >
                            {skill}
                          </span>
                        ))}
                        {cv.resumeData.skills.length > 5 && (
                          <span className="px-1.5 py-0.5 bg-surface-secondary dark:bg-slate-800 text-text-muted rounded-md text-[10px] font-bold">
                            +{cv.resumeData.skills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-border">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCvForView(cv);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary font-bold rounded-lg text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF CV</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(cv)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-secondary hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-text-secondary font-bold rounded-lg text-xs transition-colors"
                        title="Download PDF Resume file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.PDF</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteUserCv(cv.id)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {userCvs.length === 0 && (
            <div className="py-16 text-center bg-surface dark:bg-background border border-border dark:border-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-secondary dark:bg-slate-800 flex items-center justify-center mx-auto text-text-muted">
                <FileCode className="w-6 h-6" />
              </div>
              <p className="text-text-secondary dark:text-text-muted font-medium">
                No user PDF CVs stored yet. When users upload their resume on the job application page, they will appear here!
              </p>
              <button
                onClick={handleAddSampleUserCv}
                className="px-4 py-2 bg-primary text-text-inverse font-bold rounded-xl text-sm"
              >
                + Add Sample Candidate PDF CV
              </button>
            </div>
          )}
        </div>
      )}

      {/* JSON RESUME VIEWER MODAL */}
      {selectedCvForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface dark:bg-background border border-border dark:border-border rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border dark:border-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary dark:text-primary font-bold">
                  {selectedCvForView.candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-text-primary flex items-center space-x-2">
                    <span>{selectedCvForView.candidateName}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary dark:text-primary font-mono font-extrabold">
                      {selectedCvForView.resumeFileName} (PDF format)
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted dark:text-text-muted">
                    Applied for <strong>{selectedCvForView.appliedRole}</strong> at <strong>{selectedCvForView.company}</strong> ({selectedCvForView.appliedDate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCvForView(null)}
                className="p-1.5 text-text-muted hover:text-text-primary dark:hover:text-text-primary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Uploaded PDF Document (Exact candidate formatting & style) */}
            {selectedCvForView.fileDataUrl ? (
              <div className="space-y-4">
                <div className="w-full h-[640px] bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-border">
                  <iframe
                    src={selectedCvForView.fileDataUrl}
                    title={selectedCvForView.resumeFileName}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            ) : (
              /* Fallback Visual View for entries without stored PDF bytes */
              <div className="space-y-6 text-sm">
                <div className="p-4 bg-background dark:bg-slate-800 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between text-xs text-text-secondary dark:text-text-secondary">
                    <div><strong>Email:</strong> {selectedCvForView.resumeData.email}</div>
                    <div><strong>Phone:</strong> {selectedCvForView.resumeData.phone}</div>
                    <div><strong>Storage:</strong> PDF format ({selectedCvForView.storageSizeKB} KB)</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Professional Summary</h4>
                  <p className="text-text-primary dark:text-text-secondary bg-surface dark:bg-slate-800 p-4 rounded-xl border border-border dark:border-border">
                    {selectedCvForView.resumeData.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Skills & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCvForView.resumeData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-primary/10 text-primary dark:text-primary rounded-lg text-xs font-bold border border-primary/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Experience</h4>
                  <div className="space-y-3">
                    {selectedCvForView.resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-background dark:bg-slate-800 rounded-xl border border-border dark:border-border space-y-1">
                        <div className="flex items-center justify-between font-bold text-text-primary dark:text-text-primary">
                          <span>{exp.role} @ {exp.company}</span>
                          <span className="text-xs text-primary dark:text-primary">{exp.duration}</span>
                        </div>
                        <p className="text-xs text-text-secondary dark:text-text-muted">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Education</h4>
                  <div className="space-y-2">
                    {selectedCvForView.resumeData.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-background dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-text-primary dark:text-text-primary">{edu.degree} - {edu.institution}</span>
                        <span className="text-text-muted">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border dark:border-border">
              <button
                onClick={() => handleDownloadPdf(selectedCvForView)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-text-inverse font-bold rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download .PDF Resume</span>
              </button>
              <button
                onClick={() => setSelectedCvForView(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-text-secondary font-bold rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
