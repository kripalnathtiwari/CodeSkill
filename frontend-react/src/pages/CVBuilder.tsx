import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Search, 
  Layers, 
  Check, 
  Copy, 
  X, 
  Calendar, 
  HelpCircle, 
  BookOpen, 
  Briefcase, 
  Award, 
  ExternalLink 
} from 'lucide-react';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [previewSample, setPreviewSample] = useState<SampleCV | null>(null);
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

  useEffect(() => {
    fetchSamplesAndSkills();
  }, []);

  const fetchSamplesAndSkills = async () => {
    setLoading(true);
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
        fetchEndpoint('/api/v1/cv/samples', '/api/v1/admin/cv/samples'),
        fetchEndpoint('/api/v1/cv/skills', '/api/v1/admin/cv/skills')
      ]);

      setSamples(samplesData);
      setJobSkills(skillsData);
      if (skillsData && skillsData.length > 0) {
        setSelectedRole(skillsData[0].jobRole);
      }
    } catch (error) {
      console.error('Error fetching CV samples and skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return getApiUrl(url);
  };

  const categories = ['ALL', ...Array.from(new Set(samples.map((s) => (s.category || 'Standard').toUpperCase())))];

  const filteredSamples = samples.filter((sample) => {
    const matchesCategory =
      selectedCategory === 'ALL' || (sample.category || 'Standard').toUpperCase() === selectedCategory;
    const matchesSearch =
      sample.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sample.description && sample.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sample.category && sample.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopySkill = (skill: string) => {
    navigator.clipboard.writeText(skill);
    setCopiedSkill(skill);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Admin-Approved CV Templates
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Professional <span className="text-emerald-600 dark:text-emerald-500">CV Formats</span> & Gallery
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Download ATS-friendly CV templates verified and uploaded by administrators. Open the downloaded file on your computer and update it according to your personal profile.
          </p>
        </div>

        {/* 3-Step Guidance Banner */}
        <div className="mb-12 bg-gradient-to-r from-emerald-900/40 via-slate-900 to-indigo-900/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Browse Templates</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Explore curated CV structures uploaded by administrators for Tech, Executive, and Academic roles.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Download File</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Download the exact template file (.pdf, .docx, etc.) directly to your device with one click.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Update & Personalize</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open the template in Microsoft Word, Google Docs, or Adobe PDF Editor and fill in your details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CV formats by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CV Templates Showcase Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-500">Loading CV templates from admin...</p>
          </div>
        ) : filteredSamples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredSamples.map((sample) => (
              <motion.div
                key={sample.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Card Preview Banner */}
                <div className="h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <div className="flex items-center justify-between z-10">
                    <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                      {sample.category || 'Professional'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(sample.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="z-10 flex items-center gap-3 mt-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0 shadow-lg">
                      <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
                        {sample.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        ATS-Optimized Structure
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {sample.description ||
                      'Verified CV template structured by industry administrators. Ideal for modern job applications and applicant tracking systems.'}
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={resolveFileUrl(sample.fileUrl)}
                      download={`${sample.title || 'cv-template'}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs uppercase tracking-wide"
                    >
                      <Download className="w-4 h-4" />
                      Download CV Format
                    </a>
                    <button
                      type="button"
                      onClick={() => setPreviewSample(sample)}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-3.5 rounded-xl transition-all text-xs"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No CV Formats Available
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'No CV templates match your current search or category filter. Try clearing filters.'
                : 'The administrator has not uploaded any CV templates to the CV Management section yet. Check back soon!'}
            </p>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-500 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* ATS Keywords & Job Role Skill Recommendations */}
        {jobSkills.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full mb-2">
                  <Award className="w-3.5 h-3.5" /> ATS Keyword Reference
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Recommended Skills by Job Role
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Copy key industry skills uploaded by administrators and add them to your downloaded CV format.
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {jobSkills.map((roleMap) => (
                  <button
                    key={roleMap.id}
                    onClick={() => setSelectedRole(roleMap.jobRole)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 ${
                      selectedRole === roleMap.jobRole
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {roleMap.jobRole}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Role Skills List */}
            {jobSkills
              .filter((map) => map.jobRole === selectedRole)
              .map((roleMap) => (
                <div key={roleMap.id}>
                  <div className="flex flex-wrap gap-2.5">
                    {roleMap.skills.map((skill, idx) => {
                      const isCopied = copiedSkill === skill;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleCopySkill(skill)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isCopied
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                          title="Click to copy ATS skill"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                    <FileText className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {previewSample.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Category: {previewSample.category || 'Professional'} • Uploaded by Admin
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={resolveFileUrl(previewSample.fileUrl)}
                    download={`${previewSample.title || 'cv-template'}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                  <button
                    onClick={() => setPreviewSample(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Document Preview */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center min-h-[500px]">
                <iframe
                  src={resolveFileUrl(previewSample.fileUrl)}
                  className="w-full h-[650px] bg-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
                  title={previewSample.title}
                ></iframe>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Tip: If your browser does not render the document inline, click the Download File button above.
                </span>
                <button
                  onClick={() => setPreviewSample(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
