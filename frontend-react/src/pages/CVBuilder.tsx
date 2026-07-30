import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, User, Briefcase, GraduationCap, Award, Settings, Code, FileText, Sparkles, Download, X, Plus, Check, Layers } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';

interface SampleCV {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: string | null;
  createdAt: string;
}

interface JobSkillMap {
  id: string;
  jobRole: string;
  skills: string[];
  createdAt: string;
}

export default function CVBuilder() {
  const [samples, setSamples] = useState<SampleCV[]>([]);
  const [jobSkills, setJobSkills] = useState<JobSkillMap[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showSamplesModal, setShowSamplesModal] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  useEffect(() => {
    fetchSamplesAndSkills();
  }, []);

  const fetchSamplesAndSkills = async () => {
    try {
      const fetchEndpoint = async (url: string, fallbackUrl: string) => {
        try {
          const res = await axios.get(getApiUrl(url));
          return res.data || [];
        } catch {
          const res = await axios.get(getApiUrl(fallbackUrl));
          return res.data || [];
        }
      };

      const [samplesData, skillsData] = await Promise.all([
        fetchEndpoint('/api/v1/admin/cv/samples', '/api/v1/cv/samples'),
        fetchEndpoint('/api/v1/admin/cv/skills', '/api/v1/cv/skills')
      ]);
      setSamples(samplesData);
      setJobSkills(skillsData);
      if (samplesData && samplesData.length > 0) {
        setSelectedSampleId(samplesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching CV samples and skills:', error);
    }
  };

  const resolveFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return getApiUrl(url);
  };

  const activeSample = samples.find((s) => s.id === selectedSampleId) || (samples.length > 0 ? samples[0] : null);

  const getThemeClass = () => {
    if (!activeSample) return 'tech';
    const cat = (activeSample.category || '').toLowerCase();
    const title = (activeSample.title || '').toLowerCase();
    if (cat.includes('academic') || title.includes('harvard') || title.includes('minimal')) {
      return 'academic';
    }
    if (cat.includes('business') || cat.includes('exec') || title.includes('executive')) {
      return 'executive';
    }
    if (cat.includes('creative') || title.includes('creative') || title.includes('design')) {
      return 'creative';
    }
    return 'tech';
  };

  const activeTheme = getThemeClass();

  const applyAdminTemplateStructure = () => {
    if (!activeSample) return;
    const isAcademic = activeTheme === 'academic';
    const isExecutive = activeTheme === 'executive';

    setData((prev) => ({
      ...prev,
      title: prev.title || (isExecutive ? 'Chief Technical Executive' : isAcademic ? 'Computer Science & Engineering Graduate' : 'Senior Software Engineer'),
      summary: prev.summary || `Professional resume formatted according to the admin-approved ${activeSample.title} template (${activeSample.category || 'Standard'}). Experienced in designing scalable systems, collaborating with cross-functional teams, and delivering high-impact engineering results.`,
      skills: prev.skills || 'React, TypeScript, Node.js, System Architecture, Cloud Computing, PostgreSQL, UI/UX Design, Leadership'
    }));
  };

  const [data, setData] = useState({
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/johndoe',
    summary: 'Passionate and results-driven Software Engineer with 5+ years of experience in building scalable web applications. Proficient in React, Node.js, and Cloud Infrastructure.',
    experience: [
      {
        company: 'Tech Innovators Inc.',
        role: 'Full Stack Engineer',
        duration: 'Jan 2021 - Present',
        description: 'Led the migration of legacy monolithic architecture to microservices using Node.js and Docker. Improved system performance by 40%.'
      },
      {
        company: 'WebSolutions LLC',
        role: 'Frontend Developer',
        duration: 'Jun 2018 - Dec 2020',
        description: 'Developed highly interactive UI components using React.js and Redux. Mentored junior developers and established code review guidelines.'
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'B.S. in Computer Science',
        year: '2014 - 2018'
      }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExperience = [...data.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setData({ ...data, experience: newExperience });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:bg-white print:text-black pt-20">
      
      {/* LEFT PANEL - FORM CONTROLS (Hidden on Print) */}
      <div className="w-full lg:w-[45%] h-full lg:h-[calc(100vh-80px)] overflow-y-auto p-6 lg:p-8 border-r border-slate-200 dark:border-slate-800 print:hidden scrollbar-thin">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="text-emerald-500" /> 
            CV Builder
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSamplesModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
            >
              <Layers className="w-4 h-4" />
              CV Formats {samples.length > 0 && `(${samples.length})`}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
            >
              <Printer className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Sample CV Formats Banner */}
        {samples.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Admin Sample CV Formats Available</h3>
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                    {samples.length} {samples.length === 1 ? 'Format' : 'Formats'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Your CV preview on the right renders using the selected Admin template.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-xs font-semibold text-slate-500">Active Format:</span>
                  <select
                    value={selectedSampleId}
                    onChange={(e) => setSelectedSampleId(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 shadow-sm"
                  >
                    {samples.map((sample) => (
                      <option key={sample.id} value={sample.id}>
                        {sample.title} ({sample.category || 'Standard'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={applyAdminTemplateStructure}
                    className="text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    ✨ Apply Format Structure
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              {activeSample && (
                <a
                  href={resolveFileUrl(activeSample.fileUrl)}
                  download={`${activeSample.title || 'admin-cv-sample'}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Admin PDF
                </a>
              )}
              <button
                onClick={() => setShowSamplesModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Layers className="w-3.5 h-3.5" />
                All Formats
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Personal Details */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <User className="w-5 h-5 text-indigo-400" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Full Name</label>
                <input type="text" name="name" value={data.name} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Professional Title</label>
                <input type="text" name="title" value={data.title} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Email Address</label>
                <input type="email" name="email" value={data.email} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Phone Number</label>
                <input type="text" name="phone" value={data.phone} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-500">LinkedIn / Portfolio URL</label>
                <input type="text" name="linkedin" value={data.linkedin} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </section>

          {/* Professional Summary */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Professional Summary
            </h2>
            <textarea name="summary" value={data.summary} onChange={handleInputChange} rows={4} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors resize-none"></textarea>
          </section>

          {/* Work Experience */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Briefcase className="w-5 h-5 text-indigo-400" /> Work Experience
            </h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0 last:mb-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">Company Name</label>
                    <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">Job Role</label>
                    <input type="text" value={exp.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1 text-slate-500">Duration (e.g. Jan 2020 - Present)</label>
                    <input type="text" value={exp.duration} onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1 text-slate-500">Description</label>
                    <textarea value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm resize-none"></textarea>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Institution</label>
                <input type="text" value={data.education[0].institution} onChange={(e) => {
                  const newEd = [...data.education];
                  newEd[0].institution = e.target.value;
                  setData({...data, education: newEd});
                }} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Degree</label>
                <input type="text" value={data.education[0].degree} onChange={(e) => {
                  const newEd = [...data.education];
                  newEd[0].degree = e.target.value;
                  setData({...data, education: newEd});
                }} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-500">Year</label>
                <input type="text" value={data.education[0].year} onChange={(e) => {
                  const newEd = [...data.education];
                  newEd[0].year = e.target.value;
                  setData({...data, education: newEd});
                }} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Code className="w-5 h-5 text-indigo-400" /> Technical Skills
            </h2>

            {/* Admin Job Skills Suggestions */}
            {jobSkills.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Admin Recommended Skills by Job Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Select a Job Role --</option>
                    {jobSkills.map((js) => (
                      <option key={js.id} value={js.jobRole}>
                        {js.jobRole}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRole && (
                  <div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobSkills
                        .find((js) => js.jobRole === selectedRole)
                        ?.skills.map((skill, idx) => {
                          const isAlreadyAdded = data.skills
                            .split(',')
                            .map((s) => s.trim().toLowerCase())
                            .includes(skill.toLowerCase());

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  const current = data.skills.trim();
                                  const newSkills = current
                                    ? `${current}, ${skill}`
                                    : skill;
                                  setData({ ...data, skills: newSkills });
                                }
                              }}
                              disabled={isAlreadyAdded}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                isAlreadyAdded
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default opacity-75'
                                  : 'bg-white dark:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500 text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10'
                              }`}
                            >
                              {isAlreadyAdded ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Plus className="w-3 h-3 text-indigo-400" />
                              )}
                              {skill}
                            </button>
                          );
                        })}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const roleSkills =
                            jobSkills.find((js) => js.jobRole === selectedRole)
                              ?.skills || [];
                          const currentList = data.skills
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const currentLower = new Set(
                            currentList.map((s) => s.toLowerCase())
                          );
                          const added = roleSkills.filter(
                            (s) => !currentLower.has(s.toLowerCase())
                          );
                          if (added.length > 0) {
                            setData({
                              ...data,
                              skills: [...currentList, ...added].join(', '),
                            });
                          }
                        }}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        + Add All Remaining Suggested Skills
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <textarea name="skills" value={data.skills} onChange={handleInputChange} rows={3} placeholder="Comma separated skills..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors resize-none"></textarea>
          </section>
        </div>
      </div>

      {/* RIGHT PANEL - A4 PREVIEW */}
      <div className="w-full lg:w-[55%] bg-slate-200 dark:bg-slate-900 p-8 flex flex-col items-center overflow-y-auto print:w-full print:bg-white print:p-0 print:overflow-visible">
        
        {/* Admin Template Selector Bar (Above A4 Sheet) */}
        <div className="w-full max-w-[210mm] mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Admin Format:
            </span>
            <select
              value={selectedSampleId}
              onChange={(e) => setSelectedSampleId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors"
            >
              {samples.length > 0 ? (
                samples.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.title} ({sample.category || 'Standard'})
                  </option>
                ))
              ) : (
                <option value="">Default Professional Format</option>
              )}
            </select>
          </div>
          <div className="flex items-center gap-2">
            {activeSample && (
              <a
                href={resolveFileUrl(activeSample.fileUrl)}
                download={`${activeSample.title || 'admin-cv-template'}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                View Admin PDF
              </a>
            )}
            <button
              type="button"
              onClick={applyAdminTemplateStructure}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              ✨ Apply Format Structure
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* A4 Document Container */}
        <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-auto print:min-h-0 mx-auto rounded-sm relative">
          
          {/* Admin Template Watermark Header Badge */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-1.5 text-center text-[11px] font-bold text-emerald-800 uppercase tracking-widest print:hidden">
            ✨ Formatted Using Admin Template: {activeSample?.title || 'Sample CV'} ({activeSample?.category || 'Tech'}) — Approved Standard
          </div>

          {/* THEME 1: ACADEMIC / HARVARD / MINIMALIST */}
          {activeTheme === 'academic' && (
            <div className="p-12 font-serif text-slate-900">
              <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{data.name || 'Your Name'}</h1>
                <h2 className="text-base text-slate-700 font-semibold mb-3">{data.title || 'Professional Title'}</h2>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600">
                  <span>{data.email}</span>
                  <span>•</span>
                  <span>{data.phone}</span>
                  <span>•</span>
                  <span>{data.linkedin}</span>
                </div>
              </div>

              {data.summary && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-400 pb-1 mb-2">Professional Summary</h3>
                  <p className="text-xs leading-relaxed text-slate-800">{data.summary}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-400 pb-1 mb-3">Work Experience</h3>
                <div className="space-y-4">
                  {data.experience.map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-slate-900">{exp.role} — <span className="font-normal italic">{exp.company}</span></h4>
                        <span className="text-xs text-slate-600">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-slate-800 mt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-400 pb-1 mb-3">Education</h3>
                {data.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-baseline mb-2">
                    <div>
                      <span className="font-bold text-xs">{edu.degree}</span>
                      <span className="text-xs text-slate-700">, {edu.institution}</span>
                    </div>
                    <span className="text-xs text-slate-600">{edu.year}</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-400 pb-1 mb-2">Technical Skills</h3>
                <p className="text-xs text-slate-800 leading-relaxed">{data.skills}</p>
              </div>
            </div>
          )}

          {/* THEME 2: EXECUTIVE / BUSINESS */}
          {activeTheme === 'executive' && (
            <div>
              <div className="bg-[#1e293b] text-white px-10 py-10 border-b-4 border-amber-500" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <h1 className="text-4xl font-bold tracking-tight mb-1">{data.name || 'Your Name'}</h1>
                <h2 className="text-lg text-amber-400 font-medium mb-4">{data.title || 'Professional Title'}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-300">
                  <span>{data.email}</span>
                  <span>|</span>
                  <span>{data.phone}</span>
                  <span>|</span>
                  <span>{data.linkedin}</span>
                </div>
              </div>

              <div className="p-10">
                {data.summary && (
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider border-l-4 border-amber-500 pl-3 mb-3">Executive Summary</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider border-l-4 border-amber-500 pl-3 mb-4">Leadership & Experience</h3>
                  <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-slate-900">{exp.role}</h4>
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{exp.duration}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">{exp.company}</div>
                        <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider border-l-4 border-amber-500 pl-3 mb-3">Education</h3>
                    {data.education.map((edu, index) => (
                      <div key={index} className="mb-3">
                        <div className="font-bold text-slate-800 text-sm">{edu.degree}</div>
                        <div className="text-sm text-slate-600">{edu.institution}</div>
                        <div className="text-xs text-slate-400">{edu.year}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider border-l-4 border-amber-500 pl-3 mb-3">Core Competencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.split(',').map((skill, index) => (
                        <span key={index} className="bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* THEME 3: CREATIVE / SIDEBAR */}
          {activeTheme === 'creative' && (
            <div className="flex min-h-[297mm]">
              <div className="w-[35%] bg-slate-900 text-white p-8 flex flex-col justify-between" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wider leading-tight mb-2">{data.name || 'Your Name'}</h1>
                  <h2 className="text-sm text-emerald-400 font-medium mb-8">{data.title || 'Professional Title'}</h2>

                  <div className="mb-8 space-y-3 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Email</span>
                      {data.email}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Phone</span>
                      {data.phone}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">LinkedIn</span>
                      {data.linkedin}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 border-b border-slate-700 pb-1 mb-3">Education</h3>
                    {data.education.map((edu, index) => (
                      <div key={index} className="mb-4 text-xs">
                        <div className="font-bold text-white">{edu.degree}</div>
                        <div className="text-slate-400">{edu.institution}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{edu.year}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 border-b border-slate-700 pb-1 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.split(',').map((skill, index) => (
                        <span key={index} className="bg-slate-800 text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-[65%] p-10 bg-white">
                {data.summary && (
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b-2 border-emerald-500 inline-block pb-1 mb-3">Profile</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b-2 border-emerald-500 inline-block pb-1 mb-5">Experience</h3>
                  <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-slate-900">{exp.role}</h4>
                          <span className="text-xs font-semibold text-emerald-600">{exp.duration}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</div>
                        <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* THEME 4: TECH / MODERN (DEFAULT / "Sample CV") */}
          {activeTheme === 'tech' && (
            <div>
              {/* Header */}
              <div className="bg-slate-900 text-white px-10 py-12 print:bg-[#1a202c] print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{data.name || 'Your Name'}</h1>
                <h2 className="text-xl text-emerald-400 font-medium mb-6">{data.title || 'Professional Title'}</h2>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    {data.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    {data.phone}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    {data.linkedin}
                  </span>
                </div>
              </div>

              <div className="p-10">
                {/* Summary */}
                {data.summary && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-4">Summary</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {data.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-6">Experience</h3>
                  <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-slate-800">{exp.role}</h4>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{exp.duration}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Skills Split */}
                <div className="grid grid-cols-2 gap-8">
                  
                  {/* Education */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-4">Education</h3>
                    {data.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <div className="font-bold text-slate-800 text-sm mb-1">{edu.degree}</div>
                        <div className="text-sm text-slate-600 font-medium">{edu.institution}</div>
                        <div className="text-xs text-slate-500 mt-1">{edu.year}</div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-4">Core Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.split(',').map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md"
                          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Global styles to override standard layout for printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          nav, footer, button, .print\\:hidden {
            display: none !important;
          }
          .print\\:w-full, .print\\:w-full * {
            visibility: visible !important;
          }
          .print\\:w-full {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Sample CV Formats Modal */}
      <AnimatePresence>
        {showSamplesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                    <FileText className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sample CV Formats & Templates</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Verified CV structures uploaded by admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSamplesModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh] scrollbar-thin">
                {samples.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-base font-semibold">No CV formats uploaded yet</p>
                    <p className="text-xs mt-1">Check back soon for sample CV templates from admin.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {samples.map((sample) => (
                      <div
                        key={sample.id}
                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1">
                              {sample.title}
                            </h3>
                            {sample.category && (
                              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md shrink-0">
                                {sample.category}
                              </span>
                            )}
                          </div>
                          {sample.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                              {sample.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 mt-2">
                          <span className="text-[11px] text-slate-400">
                            {new Date(sample.createdAt).toLocaleDateString()}
                          </span>
                          <a
                            href={resolveFileUrl(sample.fileUrl)}
                            download={`${sample.title || 'sample-cv'}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download / View Format
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowSamplesModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
