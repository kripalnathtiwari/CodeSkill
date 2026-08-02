import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCog, Users, FileText, Sparkles, Plus, Download, Trash2, ShieldCheck, Check, Edit3, ArrowRight, Calendar, ChevronUp, ChevronDown, LockKeyhole, LogIn } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../utils/apiConfig';
import { useAuth } from '../context/AuthContext';

interface EducationItem {
  id: string;
  instituteName: string;
  location: string;
  degreeType: string;
  fieldOfStudy: string;
  startYear: string;
  gradYear: string;
  scoreType: string;
  score: string;
}

interface ProjectItem {
  id: string;
  projectTitle: string;
  role?: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  projectLink: string;
  projectLabel?: string;
  githubLink: string;
  githubLabel?: string;
  description: string;
}

interface TechnicalSkill {
  id: string;
  category: string;
  skills: string;
}

interface CertificationItem {
  id: string;
  certificateTitle: string;
  certificateLink?: string;
  certificateLabel?: string;
  certificateUrl?: string;
  urlLabel?: string;
  issuedBy: string;
  issueDate?: string;
  description?: string;
}

export default function CVBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const initialView = (searchParams.get('view') === 'editor' || routerLocation.hash === '#editor' || routerLocation.state?.view === 'editor')
    ? 'editor'
    : 'landing';
  const [view, setView] = useState<'landing' | 'editor' | 'my-resumes'>(initialView);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('view') === 'editor' || routerLocation.hash === '#editor' || routerLocation.state?.view === 'editor') {
      setView('editor');
    }
  }, [searchParams, routerLocation]);

  // Auto-restore draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('codeskill_cv_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.firstName) setFirstName(draft.firstName);
        if (draft.lastName) setLastName(draft.lastName);
        if (draft.email) setEmail(draft.email);
        if (draft.location) setLocation(draft.location);
        if (draft.phone) setPhone(draft.phone);
        if (draft.github) setGithub(draft.github);
        if (draft.linkedin) setLinkedin(draft.linkedin);
        if (draft.portfolio) setPortfolio(draft.portfolio);
        if (draft.summary) setSummary(draft.summary);
        if (draft.educationList?.length) setEducationList(draft.educationList);
        if (draft.projectList?.length) setProjectList(draft.projectList);
        if (draft.progLanguages) setProgLanguages(draft.progLanguages);
        if (draft.libraries) setLibraries(draft.libraries);
        if (draft.toolsPlatforms) setToolsPlatforms(draft.toolsPlatforms);
        if (draft.databases) setDatabases(draft.databases);
        if (draft.certificationList?.length) setCertificationList(draft.certificationList);
      }
    } catch (e) {}
  }, []);

  // Personal Information State (matching comprehensive 2-column form layout)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [summary, setSummary] = useState('');

  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  // Education List State
  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      id: '1',
      instituteName: '',
      location: '',
      degreeType: '',
      fieldOfStudy: '',
      startYear: '',
      gradYear: '',
      scoreType: 'CGPA',
      score: ''
    }
  ]);

  const addEducation = () => {
    setEducationList([
      ...educationList,
      {
        id: Date.now().toString(),
        instituteName: '',
        location: '',
        degreeType: '',
        fieldOfStudy: '',
        startYear: '',
        gradYear: '',
        scoreType: 'CGPA',
        score: ''
      }
    ]);
  };

  const removeEducation = (id: string) => {
    setEducationList(educationList.filter(item => item.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setEducationList(
      educationList.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Skillsets State (matching screenshot)
  const [techSkillsOpen, setTechSkillsOpen] = useState(true);
  const [progLanguages, setProgLanguages] = useState('');
  const [libraries, setLibraries] = useState('');
  const [toolsPlatforms, setToolsPlatforms] = useState('');
  const [databases, setDatabases] = useState('');

  // Projects List State (matching screenshot)
  const [projectList, setProjectList] = useState<ProjectItem[]>([
    {
      id: '1',
      projectTitle: '',
      githubLink: '',
      projectLink: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    }
  ]);

  const addProject = () => {
    setProjectList([
      ...projectList,
      {
        id: Date.now().toString(),
        projectTitle: '',
        githubLink: '',
        projectLink: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: ''
      }
    ]);
  };

  const removeProject = (id: string) => {
    setProjectList(projectList.filter(item => item.id !== id));
  };

  const updateProject = (
    id: string,
    field: keyof ProjectItem,
    value: string | boolean
  ) => {
    setProjectList(
      projectList.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Certifications List State (matching screenshot)
  const [certificationList, setCertificationList] = useState<CertificationItem[]>([
    {
      id: '1',
      certificateTitle: '',
      certificateLink: '',
      issuedBy: ''
    }
  ]);

  const addCertification = () => {
    setCertificationList([
      ...certificationList,
      {
        id: Date.now().toString(),
        certificateTitle: '',
        certificateLink: '',
        issuedBy: ''
      }
    ]);
  };

  const removeCertification = (id: string) => {
    setCertificationList(certificationList.filter(item => item.id !== id));
  };

  const updateCertification = (
    id: string,
    field: keyof CertificationItem,
    value: string
  ) => {
    setCertificationList(
      certificationList.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePrintCV = () => {
    if (!user) {
      sessionStorage.setItem('pending_action', 'DOWNLOAD_CV');
      setShowAuthModal(true);
      return;
    }
    const previewElement = document.getElementById('cv-preview-sheet');
    if (!previewElement) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=1150');
    if (!printWindow) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((style) => style.outerHTML)
      .join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${fullName || 'ATS_Resume'}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            body {
              display: flex !important;
              justify-content: center !important;
              align-items: flex-start !important;
            }
            .cv-print-sheet {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              padding: 14mm 16mm !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              overflow: hidden !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              break-before: avoid !important;
              break-after: avoid !important;
              break-inside: avoid !important;
            }
            .cv-print-sheet * {
              overflow: visible !important;
              max-height: none !important;
            }
            .no-print {
              display: none !important;
            }
            @media print {
              html, body, .cv-print-sheet {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
            }
          </style>
        </head>
        <body class="bg-white text-slate-900">
          <div class="cv-print-sheet">
            ${previewElement.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-3xl font-black">Resume Editor</h1>
              <p className="text-slate-400 text-sm">Create an ATS-friendly resume from scratch</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('landing')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
              >
                Back to Landing
              </button>
              <button
                onClick={handlePrintCV}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold text-sm flex items-center gap-2 border border-white/40 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column (Personal Info + Education) */}
            <div className="lg:col-span-6 space-y-8">
              {/* Personal Information Box */}
              <div className="space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-orange-400">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      First Name <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ankit"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Last Name <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Email <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ankit@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Bengaluru, India"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 1234567890"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Github
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="github.com/username"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Portfolio
                    </label>
                    <input
                      type="text"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      placeholder="yourwebsite.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief summary of your professional background and achievements..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Education Section Box */}
              <div className="space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-orange-400">Education</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {educationList.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-4 relative"
                    >
                      {educationList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove Education"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Institute Name <span className="text-orange-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.instituteName}
                            onChange={(e) => updateEducation(edu.id, 'instituteName', e.target.value)}
                            placeholder="IIT Bombay"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                            placeholder="Mumbai, India"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Degree Type <span className="text-orange-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.degreeType}
                            onChange={(e) => updateEducation(edu.id, 'degreeType', e.target.value)}
                            placeholder="B.Tech / XII / B.Sc"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Field of Study/Board <span className="text-orange-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                            placeholder="Computer Science / CBSE"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Start Year <span className="text-orange-400">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={edu.startYear}
                              onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                              placeholder="YYYY"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Grad Year <span className="text-orange-400">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={edu.gradYear}
                              onChange={(e) => updateEducation(edu.id, 'gradYear', e.target.value)}
                              placeholder="YYYY"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Score Type
                          </label>
                          <select
                            value={edu.scoreType}
                            onChange={(e) => updateEducation(edu.id, 'scoreType', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="CGPA">CGPA</option>
                            <option value="Percentage">Percentage</option>
                            <option value="Grade">Grade</option>
                            <option value="None">None</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Score
                          </label>
                          <input
                            type="text"
                            value={edu.score}
                            onChange={(e) => updateEducation(edu.id, 'score', e.target.value)}
                            placeholder="e.g. 8.9 / 92%"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skillsets Section Box */}
              <div className="space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white">Skillsets</h3>

                {/* Technical Skills Collapsible Accordion */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => setTechSkillsOpen(!techSkillsOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/80 hover:bg-slate-900 text-left font-bold text-white text-base transition-colors"
                  >
                    <span>Technical Skills</span>
                    {techSkillsOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {techSkillsOpen && (
                    <div className="p-5 border-t border-slate-800/80 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Programming Languages <span className="text-orange-400">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={progLanguages}
                            onChange={(e) => setProgLanguages(e.target.value)}
                            placeholder="Python, C++, R, Javascript"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Libraries/FrameWorks <span className="text-orange-400">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={libraries}
                            onChange={(e) => setLibraries(e.target.value)}
                            placeholder="ReactJS, NodeJS, AngularJS"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Tools/Platforms <span className="text-orange-400">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={toolsPlatforms}
                            onChange={(e) => setToolsPlatforms(e.target.value)}
                            placeholder="VSCode, Figma, Postman, Canva"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Databases <span className="text-orange-400">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={databases}
                            onChange={(e) => setDatabases(e.target.value)}
                            placeholder="MySQL, MongoDB, PostgreSQL"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects Section Box */}
              <div className="space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Projects</h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {projectList.map((proj, index) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Project #{index + 1}
                        </span>
                        {projectList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProject(proj.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            title="Remove Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Project Title * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Project Title <span className="text-orange-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={proj.projectTitle}
                            onChange={(e) => updateProject(proj.id, 'projectTitle', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        {/* Github Link (optional) */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              Github Link URL <span className="text-orange-400">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={proj.githubLink}
                              onChange={(e) => updateProject(proj.id, 'githubLink', e.target.value)}
                              placeholder="https://github.com/..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                          {proj.githubLink && (
                            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
                              <label className="block text-[11px] font-medium text-orange-300 mb-1 flex items-center justify-between">
                                <span>Customize Link Display Text</span>
                                <span className="text-[10px] text-slate-400">MS Word Hyperlink Style</span>
                              </label>
                              <input
                                type="text"
                                value={proj.githubLabel || ''}
                                onChange={(e) => updateProject(proj.id, 'githubLabel', e.target.value)}
                                placeholder="e.g. GitHub Repo / Source Code"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                              />
                            </div>
                          )}
                        </div>

                        {/* Project Link (optional) */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              Project Link URL <span className="text-orange-400">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={proj.projectLink}
                              onChange={(e) => updateProject(proj.id, 'projectLink', e.target.value)}
                              placeholder="https://myproject-demo.com"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                          {proj.projectLink && (
                            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
                              <label className="block text-[11px] font-medium text-orange-300 mb-1 flex items-center justify-between">
                                <span>Customize Link Display Text</span>
                                <span className="text-[10px] text-slate-400">MS Word Hyperlink Style</span>
                              </label>
                              <input
                                type="text"
                                value={proj.projectLabel || ''}
                                onChange={(e) => updateProject(proj.id, 'projectLabel', e.target.value)}
                                placeholder="e.g. Live Demo / View App"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                              />
                            </div>
                          )}
                        </div>

                        {/* Start Date * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Start Date <span className="text-orange-400">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={proj.startDate}
                              onChange={(e) => updateProject(proj.id, 'startDate', e.target.value)}
                              placeholder="MM/YYYY"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                        </div>

                        {/* End Date * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            End Date <span className="text-orange-400">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={proj.endDate}
                              disabled={proj.currentlyWorking}
                              onChange={(e) => updateProject(proj.id, 'endDate', e.target.value)}
                              placeholder={proj.currentlyWorking ? 'Present' : 'MM/YYYY'}
                              className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors ${proj.currentlyWorking ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Checkbox: I am currently working on this */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id={`working-${proj.id}`}
                          checked={proj.currentlyWorking}
                          onChange={(e) => updateProject(proj.id, 'currentlyWorking', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-950"
                        />
                        <label
                          htmlFor={`working-${proj.id}`}
                          className="text-xs font-medium text-slate-300 cursor-pointer select-none"
                        >
                          I am currently working on this
                        </label>
                      </div>

                      {/* Description / Key Achievements */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Project Description / Key Achievements
                        </label>
                        <textarea
                          rows={3}
                          value={proj.description}
                          onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                          placeholder="Describe your project, features built, and technologies used..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section Box */}
              <div className="space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Certifications</h3>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certification</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {certificationList.map((cert, index) => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Certification #{index + 1}
                        </span>
                        {certificationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCertification(cert.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            title="Remove Certification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Certificate Title * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Certificate Title <span className="text-orange-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.certificateTitle}
                            onChange={(e) => updateCertification(cert.id, 'certificateTitle', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        {/* Certificate Link * */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              Certificate Link URL <span className="text-orange-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={cert.certificateLink}
                              onChange={(e) => updateCertification(cert.id, 'certificateLink', e.target.value)}
                              placeholder="https://coursera.org/verify/..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                          {cert.certificateLink && (
                            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
                              <label className="block text-[11px] font-medium text-orange-300 mb-1 flex items-center justify-between">
                                <span>Customize Link Display Text</span>
                                <span className="text-[10px] text-slate-400">MS Word Hyperlink Style</span>
                              </label>
                              <input
                                type="text"
                                value={cert.certificateLabel || ''}
                                onChange={(e) => updateCertification(cert.id, 'certificateLabel', e.target.value)}
                                placeholder="e.g. View Certificate / Credential"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                              />
                            </div>
                          )}
                        </div>

                        {/* Issued By * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Issued By <span className="text-orange-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.issuedBy}
                            onChange={(e) => updateCertification(cert.id, 'issuedBy', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live A4 Preview Column (Sticky, Fixed A4 Size) */}
            <div className="lg:col-span-6">
              <div className="sticky top-8">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    <span>A4 Live Preview (Fixed 210 × 297 mm)</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">1 Page • ATS Friendly</span>
                </div>

                {/* Fixed A4 Page Sheet */}
                <div
                  id="cv-preview-sheet"
                  className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-300 w-full aspect-[210/297] max-h-[850px] overflow-hidden flex flex-col justify-between relative"
                >
                  <div className="overflow-y-auto pr-2 flex-1">
                    {/* Professional Header */}
                    <div className="text-center mb-3">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                        {fullName || 'Your Name'}
                      </h2>
                      <p className="text-xs text-slate-700 mt-1 flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
                        {[
                          email ? { text: email, url: `mailto:${email}` } : { text: 'email@example.com' },
                          phone ? { text: phone, url: `tel:${phone}` } : { text: '+91 0000000000' },
                          location ? { text: location } : null,
                          github
                            ? {
                              text: `github.com/${github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}`,
                              url: github.startsWith('http') ? github : `https://${github}`
                            }
                            : null,
                          linkedin
                            ? {
                              text: `linkedin.com/in/${linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`,
                              url: linkedin.startsWith('http') ? linkedin : `https://${linkedin}`
                            }
                            : null,
                          portfolio
                            ? {
                              text: 'Portfolio',
                              url: portfolio.startsWith('http') ? portfolio : `https://${portfolio}`
                            }
                            : null
                        ]
                          .filter((item): item is { text: string; url?: string } => Boolean(item))
                          .map((item, idx, arr) => (
                            <span key={idx} className="flex items-center gap-2">
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-900 hover:underline font-medium"
                                >
                                  {item.text}
                                </a>
                              ) : (
                                <span>{item.text}</span>
                              )}
                              {idx < arr.length - 1 && <span className="text-slate-400">•</span>}
                            </span>
                          ))}
                      </p>
                    </div>

                    {/* SUMMARY */}
                    {summary && (
                      <div className="mt-3">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5">
                          SUMMARY
                        </h3>
                        <p className="text-xs text-slate-800 leading-relaxed text-justify">{summary}</p>
                      </div>
                    )}

                    {/* EDUCATION SECTION in Preview */}
                    {educationList.some(item => item.instituteName || item.degreeType) && (
                      <div className="mt-3">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
                          EDUCATION
                        </h3>
                        <div className="space-y-2">
                          {educationList
                            .filter(item => item.instituteName || item.degreeType)
                            .map(item => (
                              <div key={item.id} className="text-xs text-slate-900">
                                <div className="flex justify-between items-baseline font-bold">
                                  <span>
                                    {item.instituteName || 'Institute Name'}
                                    {item.location ? `, ${item.location}` : ''}
                                  </span>
                                  <span className="font-semibold text-slate-700 whitespace-nowrap">
                                    {[item.startYear, item.gradYear].filter(Boolean).join(' - ') || 'Year'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-baseline text-slate-800 mt-0.5">
                                  <span className="italic">
                                    {item.degreeType || 'Degree'}
                                    {item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ''}
                                  </span>
                                  {item.score && item.scoreType !== 'None' && (
                                    <span className="font-medium text-slate-700">
                                      {item.scoreType}: {item.score}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* TECHNICAL SKILLS SECTION in Preview */}
                    {(progLanguages || libraries || toolsPlatforms || databases) && (
                      <div className="mt-3">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5">
                          TECHNICAL SKILLS
                        </h3>
                        <div className="space-y-1 text-xs text-slate-900">
                          {progLanguages && (
                            <div>
                              <span className="font-bold">Languages: </span>
                              <span className="text-slate-800">{progLanguages}</span>
                            </div>
                          )}
                          {libraries && (
                            <div>
                              <span className="font-bold">Libraries & Frameworks: </span>
                              <span className="text-slate-800">{libraries}</span>
                            </div>
                          )}
                          {toolsPlatforms && (
                            <div>
                              <span className="font-bold">Tools & Platforms: </span>
                              <span className="text-slate-800">{toolsPlatforms}</span>
                            </div>
                          )}
                          {databases && (
                            <div>
                              <span className="font-bold">Databases: </span>
                              <span className="text-slate-800">{databases}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PROJECTS SECTION in Preview */}
                    {projectList.some(item => item.projectTitle) && (
                      <div className="mt-3">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
                          PROJECTS
                        </h3>
                        <div className="space-y-2.5">
                          {projectList
                            .filter(item => item.projectTitle)
                            .map(item => (
                              <div key={item.id} className="text-xs text-slate-900">
                                <div className="flex justify-between items-baseline">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold">{item.projectTitle}</span>
                                    {item.githubLink && (
                                      <span className="text-[11px] text-slate-700">
                                        |{' '}
                                        <a
                                          href={item.githubLink.startsWith('http') ? item.githubLink : `https://${item.githubLink}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-slate-900 hover:underline font-medium"
                                        >
                                          {item.githubLabel || 'GitHub'}
                                        </a>
                                      </span>
                                    )}
                                    {item.projectLink && (
                                      <span className="text-[11px] text-slate-700">
                                        |{' '}
                                        <a
                                          href={item.projectLink.startsWith('http') ? item.projectLink : `https://${item.projectLink}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-slate-900 hover:underline font-medium"
                                        >
                                          {item.projectLabel || 'Live Demo'}
                                        </a>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right font-semibold text-slate-700 whitespace-nowrap">
                                    {[
                                      item.startDate,
                                      item.currentlyWorking ? 'Present' : item.endDate
                                    ]
                                      .filter(Boolean)
                                      .join(' - ') || 'Date'}
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-slate-800 mt-0.5 leading-normal whitespace-pre-line">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* CERTIFICATIONS SECTION in Preview */}
                    {certificationList.some(item => item.certificateTitle || item.issuedBy) && (
                      <div className="mt-3">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5">
                          CERTIFICATIONS
                        </h3>
                        <div className="space-y-1.5">
                          {certificationList
                            .filter(item => item.certificateTitle || item.issuedBy)
                            .map(item => (
                              <div key={item.id} className="flex justify-between items-baseline text-xs text-slate-900">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold">{item.certificateTitle || 'Certificate Title'}</span>
                                  {item.issuedBy && (
                                    <span className="italic text-slate-700">
                                      — Issued by {item.issuedBy}
                                    </span>
                                  )}
                                </div>
                                {item.certificateLink && (
                                  <a
                                    href={item.certificateLink.startsWith('http') ? item.certificateLink : `https://${item.certificateLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-medium text-slate-900 hover:underline whitespace-nowrap"
                                  >
                                    {item.certificateLabel || 'View Certificate'}
                                  </a>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="no-print text-center text-[11px] text-slate-400 border-t border-slate-200 pt-2.5 mt-3 flex items-center justify-between">
                    <span>ATS Friendly Resume Preview</span>
                    <span>Page 1 of 1 (A4 Standard)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'my-resumes') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h1 className="text-3xl font-black">My Resumes</h1>
            <button
              onClick={() => setView('landing')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
            >
              Back to Landing
            </button>
          </div>
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <p className="text-slate-400 mb-6">No saved resumes found yet.</p>
            <button
              onClick={() => setView('editor')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold rounded-xl border border-white/40 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Build new Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#090E17] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Subtle Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* SECTION 1: Hero Banner */}
      <div className="max-w-7xl mx-auto w-full relative z-10 py-12 px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column - Text & Actions */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Make an ATS-Friendly <br />
              Resume in Minutes
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-xl">
              Craft a resume for free and get one step closer to your dream job with our ATS-friendly templates.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <motion.button
                onClick={() => setView('editor')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-600 text-white font-extrabold px-8 py-4 rounded-xl border-2 border-white/90 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] text-base sm:text-lg tracking-wide"
              >
                <span>Build new Resume</span>
              </motion.button>

              <Link to="/ats-checker" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold px-8 py-4 rounded-xl border-2 border-emerald-500/50 hover:border-emerald-500 transition-all shadow-lg text-base sm:text-lg tracking-wide"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Check ATS Score</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Mockup */}
          <div className="lg:col-span-6 relative flex justify-center items-center py-8">
            <div className="relative w-full max-w-lg">

              {/* FREE Badge Top Right */}
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [12, 14, 12] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-6 right-6 z-30 bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 font-black text-sm px-4 py-1.5 rounded-lg shadow-xl border border-emerald-200 dark:border-emerald-500/30 tracking-wider uppercase"
              >
                FREE
              </motion.div>

              {/* Avatar Badge Left */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -left-4 top-8 z-30 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-amber-600 dark:text-amber-300 font-bold"
              >
                <UserCog className="w-6 h-6" />
              </motion.div>

              {/* Avatar Badge Right */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="absolute -right-2 top-1/3 z-30 w-12 h-12 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-white"
              >
                <Users className="w-6 h-6" />
              </motion.div>

              {/* ATS Friendly Green Badge bottom left */}
              <motion.div
                animate={{ rotate: [-6, -4, -6] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-6 left-4 z-30 flex items-center gap-2"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl border border-white/40 shadow-xl text-sm tracking-wide">
                  ATS Friendly
                </div>
              </motion.div>

              {/* Tilted Resume Paper Mockup */}
              <div className="bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 -rotate-2 w-full">
                {/* Resume Header */}
                <div className="text-center border-b border-slate-200 pb-4 mb-4 flex flex-col items-center">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Ankit Sharma Avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md mb-2"
                  />
                  <h4 className="text-xl font-bold text-slate-900">Ankit Sharma</h4>
                  <p className="text-xs text-slate-500 mt-1">ankit.sharma@example.com | +91 1234567890 | Bengaluru</p>
                </div>

                {/* Resume Content Mockup */}
                <div className="space-y-4 text-left">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ACADEMIC DETAILS</div>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-slate-700">Bachelor of Tech in Computer Science Engineering - 2022</div>
                      <div className="text-slate-500">National Institute of Technology | CGPA: 8.5</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PROJECTS</div>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs">
                      <div className="font-bold text-slate-700">• Library Management System</div>
                      <div className="text-slate-500 mt-1">Built full-stack application using React, Node.js and PostgreSQL.</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">TECHNICAL SKILLS</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'].map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlaid Dark Editor Mockup on bottom-right */}
              <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-4 w-10/12 ml-auto -mt-16 z-20 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="text-xs font-bold text-orange-400">Resume Editor</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">ATS Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                    <div className="text-slate-400 mb-0.5">First Name *</div>
                    <div className="font-semibold text-white">Ankit</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                    <div className="text-slate-400 mb-0.5">Last Name *</div>
                    <div className="font-semibold text-white">Sharma</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Proven Professional Templates */}
      <div className="bg-[#F8FAFC] dark:bg-[#0B1320] text-slate-900 dark:text-white py-24 px-6 md:px-12 border-t border-slate-200 dark:border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

            {/* Left Column: 3 Overlapping/Stacked Resume Template Sheets */}
            <div className="lg:col-span-7 relative flex justify-center items-center py-10 min-h-[500px]">
              <div className="relative w-full max-w-lg flex justify-center items-center">

                {/* Back Left Template (Cipher Schools) */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 0.95, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.03, rotate: -4, zIndex: 30 }}
                  className="absolute -left-4 sm:-left-10 -top-6 w-[75%] bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-5 -rotate-6 transition-all duration-300 opacity-95 text-[10px] select-none"
                >
                  <div className="border-b border-slate-200 pb-2 mb-2 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Cipher Schools Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Cipher Schools</h4>
                        <p className="text-[9px] text-slate-400">cipherschools.com | India</p>
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-400 text-right">
                      <div>EDUCATION & TRAINING</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <div>
                      <div className="font-bold text-[9px] text-slate-400 uppercase mb-0.5">Education</div>
                      <div className="font-semibold text-slate-700">Netaji Subhash Engineering College</div>
                      <div className="text-slate-500 text-[8px]">Bachelor of Technology - Information Technology | CGPA: 8.85</div>
                    </div>
                    <div>
                      <div className="font-bold text-[9px] text-slate-400 uppercase mb-0.5">Skills Summary</div>
                      <div className="text-slate-600 text-[8px] leading-relaxed">
                        <span className="font-semibold">Languages:</span> Python, PHP, C++, JavaScript, SQL, Java, HTML/CSS <br />
                        <span className="font-semibold">Frameworks:</span> React, Node.js, Express, Tailwind CSS, Bootstrap
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Back Right Template (John Doe) */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 0.95, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.03, rotate: 4, zIndex: 30 }}
                  className="absolute -right-4 sm:-right-10 top-6 w-[75%] bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-5 rotate-6 transition-all duration-300 opacity-95 text-[10px] select-none"
                >
                  <div className="border-b border-slate-200 pb-2 mb-2 text-left flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="John Doe Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">John Doe</h4>
                      <p className="text-[9px] text-slate-400">johndoe@example.com | +1 (555) 019-2834</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <div>
                      <div className="font-bold text-[9px] text-slate-400 uppercase mb-1">Experience</div>
                      <div className="space-y-1.5">
                        <div>
                          <div className="font-bold text-slate-700">SOFTWARE ENGINEER</div>
                          <div className="text-[8px] text-slate-500">University of Texas, Austin | May 2023 - Present</div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">MACHINE LEARNING INTERN</div>
                          <div className="text-[8px] text-slate-500">Bengaluru Centre for Advanced Tech | Jun 2022 - Aug 2022</div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">DEVELOPMENT INTERN</div>
                          <div className="text-[8px] text-slate-500">Centre for Advanced Technology | 2021</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Front Center Template (Anurag Mishra) */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="relative z-20 w-[88%] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 p-6 sm:p-7 transition-all duration-300"
                >
                  <div className="text-center border-b border-slate-200 pb-3 mb-4 flex flex-col items-center">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                      alt="Anurag Mishra Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md mb-2"
                    />
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Anurag Mishra</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">anurag@example.com | +91 9876543210 | Mumbai, India</p>
                  </div>

                  <div className="space-y-3.5 text-left text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ACADEMIC DETAILS</div>
                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-0.5 border border-slate-100">
                        <div className="font-bold text-slate-800">Computer Science and Engineering</div>
                        <div className="text-slate-500 text-[11px]">Indian Institute of Technology | CGPA: 9.1</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">TECHNICAL SKILLS</div>
                      <div className="flex flex-wrap gap-1.5">
                        {['Python', 'C++', 'Java', 'React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'].map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">MAJOR PROJECTS AND SEMINAR</div>
                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 border border-slate-100">
                        <div>
                          <div className="font-bold text-slate-800">• Media Access Control Clustering (Research Project)</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">Objective: Performance analysis of MAC protocols over distributed networks.</div>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60">
                          <div className="font-bold text-slate-800">• Real-time Distributed Chat Application</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">Built using WebSockets, Node.js, React and Redis pub/sub.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Right Column: Heading & Subtitle */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recruiter-Approved Layouts</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                Make Your Resume with <br className="hidden sm:inline" />
                Proven Professional <br className="hidden sm:inline" />
                Templates.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Create a standout resume in minutes using expert-designed templates built to pass Applicant Tracking Systems and impress recruiters—no design skills needed.
              </p>

              <div className="pt-2">
                <motion.button
                  onClick={() => navigate('/cv-templates')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-600 text-white font-extrabold px-8 py-4 rounded-xl border-2 border-white/90 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] text-base sm:text-lg tracking-wide"
                >
                  <span>See more resumes</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* SECTION 3: How It Works */}
          <div className="mt-28 pt-20 border-t border-slate-200 dark:border-slate-800/80">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-left mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-wider uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simple 3-Step Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed font-medium">
                Create a professional resume in three simple steps: select a template, fill in your details, and download your ATS-friendly resume ready to impress recruiters and hiring systems.
              </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-6 mt-10">

              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -8 }}
                className="flex-1 w-full flex flex-col items-start text-left group cursor-pointer"
              >
                {/* Illustration 1: Pick a Template */}
                <div className="h-64 w-full flex items-center justify-center relative my-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-slate-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:via-slate-800/40 dark:to-teal-500/10 border border-slate-200/60 dark:border-slate-800 p-4 overflow-hidden transition-all duration-500 group-hover:border-emerald-500/50 group-hover:shadow-xl group-hover:shadow-emerald-500/10">
                  {/* Glowing background blob */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-500"></div>

                  {/* Back left template sheet */}
                  <motion.div
                    animate={{ rotate: [-6, -8, -6] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -translate-x-14 -translate-y-3 w-36 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-3 -rotate-6 opacity-85 select-none"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Template 1"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700/60 rounded"></div>
                      <div className="w-4/5 h-1 bg-slate-100 dark:bg-slate-700/60 rounded"></div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700/60 rounded"></div>
                    </div>
                  </motion.div>

                  {/* Back right template sheet */}
                  <motion.div
                    animate={{ rotate: [6, 8, 6] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    className="absolute translate-x-12 -translate-y-1 w-36 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-3 rotate-6 opacity-85 select-none"
                  >
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                        alt="Template 2"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700/60 rounded"></div>
                      <div className="w-4/5 h-1 bg-slate-100 dark:bg-slate-700/60 rounded"></div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700/60 rounded"></div>
                    </div>
                  </motion.div>

                  {/* Front center template sheet */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="relative z-10 w-40 h-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border-2 border-emerald-500/30 dark:border-emerald-500/40 p-4 flex flex-col justify-between select-none"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                          alt="Ankit Sharma"
                          className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                        />
                        <div>
                          <div className="w-16 h-2 bg-slate-800 dark:bg-slate-200 rounded mb-1"></div>
                          <div className="w-12 h-1.5 bg-emerald-500 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="w-5/6 h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="w-3/4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                    </div>

                    {/* Recruiter Approved Badge */}
                    <div className="flex items-center justify-between text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <span>ATS Approved</span>
                      <Sparkles className="w-3 h-3" />
                    </div>

                    {/* Green Checkmark Badge on Bottom-Right */}
                    <motion.div
                      animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.4)', '0 0 0 10px rgba(16, 185, 129, 0)', '0 0 0 0 rgba(16, 185, 129, 0)'] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-slate-900 z-20"
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Step Number + Title */}
                <h3 className="flex items-baseline gap-2 mt-4 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400">1.</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Pick a Template</span>
                </h3>
                {/* Step Description */}
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Choose from modern, recruiter-approved templates. Start editing instantly and see changes in real time.
                </p>
              </motion.div>

              {/* Arrow 1 -> 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:flex items-center justify-center self-center -mt-24 px-1 text-emerald-500 dark:text-emerald-400"
              >
                <div className="flex items-center gap-1.5">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-emerald-400/50"></motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-2 h-2 rounded-full bg-emerald-500/80"></motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-2 h-2 rounded-full bg-emerald-500"></motion.span>
                  <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                    <ArrowRight className="w-6 h-6 stroke-[3] -ml-0.5" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -8 }}
                className="flex-1 w-full flex flex-col items-start text-left group cursor-pointer"
              >
                {/* Illustration 2: Customize Your Layout */}
                <div className="h-64 w-full flex items-center justify-center relative my-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-slate-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:via-slate-800/40 dark:to-teal-500/10 border border-slate-200/60 dark:border-slate-800 p-4 overflow-hidden transition-all duration-500 group-hover:border-emerald-500/50 group-hover:shadow-xl group-hover:shadow-emerald-500/10">
                  {/* Glowing background blob */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl group-hover:bg-teal-500/25 transition-all duration-500"></div>

                  {/* Resume Layout Document Card */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative z-10 w-48 h-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border-2 border-emerald-500/30 dark:border-emerald-500/40 p-4 flex flex-col justify-between select-none"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                            alt="User Profile"
                            className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                          />
                          <div className="w-16 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="w-2 h-2" />
                          </div>
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>

                        {/* Animated Editable Progress / Layout bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                            <span>ATS OPTIMIZATION</span>
                            <span className="text-emerald-500">98%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ width: ["45%", "98%", "45%"] }}
                              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <div className="h-6 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700/60"></div>
                          <div className="h-6 bg-emerald-500/10 rounded border border-emerald-500/30 flex items-center justify-center text-[8px] font-bold text-emerald-500">
                            EDITED
                          </div>
                          <div className="h-6 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700/60"></div>
                        </div>
                      </div>
                    </div>

                    <div className="w-16 h-1.5 bg-emerald-500 rounded-full"></div>

                    {/* Floating Editor Profile Badge with Image */}
                    <motion.div
                      animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 text-white shadow-2xl border border-slate-700 rounded-2xl p-2.5 flex items-center gap-2 z-20"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Editor Avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-emerald-400"
                      />
                      <div className="text-left pr-1">
                        <div className="text-[10px] font-extrabold text-emerald-400 tracking-wide flex items-center gap-1">
                          <span>LIVE EDIT</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <div className="text-[8px] text-slate-300">Guided Builder</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Step Number + Title */}
                <h3 className="flex items-baseline gap-2 mt-4 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400">2.</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Customize Your Layout</span>
                </h3>
                {/* Step Description */}
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Add your personal, academic, and professional information—it's fast, easy, and guided.
                </p>
              </motion.div>

              {/* Arrow 2 -> 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden lg:flex items-center justify-center self-center -mt-24 px-1 text-emerald-500 dark:text-emerald-400"
              >
                <div className="flex items-center gap-1.5">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-emerald-400/50"></motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-2 h-2 rounded-full bg-emerald-500/80"></motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-2 h-2 rounded-full bg-emerald-500"></motion.span>
                  <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                    <ArrowRight className="w-6 h-6 stroke-[3] -ml-0.5" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -8 }}
                className="flex-1 w-full flex flex-col items-start text-left group cursor-pointer"
              >
                {/* Illustration 3: Hit 'Download!' */}
                <div className="h-64 w-full flex items-center justify-center relative my-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-slate-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:via-slate-800/40 dark:to-teal-500/10 border border-slate-200/60 dark:border-slate-800 p-4 overflow-hidden transition-all duration-500 group-hover:border-emerald-500/50 group-hover:shadow-xl group-hover:shadow-emerald-500/10">
                  {/* Glowing background blob */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-500"></div>

                  {/* Laptop Mockup */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative z-10 flex flex-col items-center select-none"
                  >
                    {/* Laptop Screen with Real Resume Image Preview Background */}
                    <div className="w-56 h-36 bg-slate-900 dark:bg-slate-950 rounded-t-xl border-4 border-slate-800 dark:border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
                      {/* Real resume document background image */}
                      <img
                        src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80"
                        alt="ATS Resume Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-950/40 backdrop-blur-[1px]"></div>

                      {/* Center Big Emerald Download Button Badge */}
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.4)', '0 0 0 10px rgba(16, 185, 129, 0)', '0 0 0 0 rgba(16, 185, 129, 0)'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="relative z-20 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-500/50 border border-white/30 cursor-pointer group/btn"
                      >
                        <Download className="w-6 h-6 stroke-[2.5] mb-0.5 group-hover/btn:translate-y-0.5 transition-transform" />
                        <span className="text-[7px] font-black uppercase tracking-wider">PDF Ready</span>
                      </motion.div>

                      {/* Floating Success ATS Score Badge */}
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute top-2 left-2 z-20 bg-emerald-500/90 text-white px-2 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-1 shadow-lg"
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>ATS 100/100</span>
                      </motion.div>
                    </div>

                    {/* Laptop Keyboard Base */}
                    <div className="w-64 h-3 bg-slate-700 dark:bg-slate-700 rounded-b-lg shadow-md relative flex items-center justify-center">
                      <div className="w-10 h-1 bg-slate-600 rounded-full"></div>
                    </div>

                    {/* Subtle shadow under laptop */}
                    <div className="w-52 h-3 bg-black/15 dark:bg-black/40 rounded-full blur-md -mt-1"></div>
                  </motion.div>
                </div>

                {/* Step Number + Title */}
                <h3 className="flex items-baseline gap-2 mt-4 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400">3.</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Hit 'Download!'</span>
                </h3>
                {/* Step Description */}
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Download your polished resume. Apply confidently and unlock better job opportunities.
                </p>
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden text-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
              <LockKeyhole className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Login Required to Download CV</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Please log in or create a free account to export your single-page ATS-optimized PDF resume. Your entered details will be preserved!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login', { state: { from: '/cv-builder?view=editor&autoDownload=true' } })}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Log In & Download</span>
              </button>
              <button
                onClick={() => navigate('/register', { state: { from: '/cv-builder?view=editor&autoDownload=true' } })}
                className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
