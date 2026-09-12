import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, FileText, Upload, Sparkles, CheckCircle2,
  AlertCircle, RefreshCw, FileUp, Download, Briefcase, Award, ArrowLeft, LockKeyhole, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { extractTextFromFile, parseResumeContent } from '../utils/cvParser';

const API_URL = getApiUrl('/api/v1/ats');

export default function ATSChecker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    // Reset previous results if uploading new file
    setResults(null);
    setAnalysisId(null);

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
        // Not valid JSON
      }

      const storedCvs = localStorage.getItem('codeskill_user_cvs');
      const parsedCvs = storedCvs ? JSON.parse(storedCvs) : [];
      const candidateEmail = localStorage.getItem('user_email') || 'candidate@codeskill.dev';
      const candidateName = (() => {
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
        if (candidateEmail) {
          const prefix = candidateEmail.split('@')[0];
          const cleaned = prefix.replace(/[0-9]+$/, '').replace(/[._-]+/g, ' ').trim();
          if (cleaned) {
            return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          }
          return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        return localStorage.getItem('user_name') || 'Candidate';
      })();
      const sizeKB = (file.size / 1024).toFixed(2);

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
          jobRole: 'ATS Scanner Resume Upload',
          jobCompany: 'CodeSkill Candidates'
        });
      }

      const newJsonCv = {
        id: `user-cv-${Date.now()}`,
        candidateName: resumeData.name || candidateName,
        candidateEmail: resumeData.email || candidateEmail,
        phone: resumeData.phone || '+91 98111 22334',
        appliedRole: 'ATS Scanner Resume Upload',
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
      console.error('Error saving CV to Admin pool:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeFile) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      // 1. Upload Resume
      const formData = new FormData();
      formData.append('resume', resumeFile);

      // Note: Assumes JWT auth token is stored in localStorage
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const resumeRes = await axios.post(`${API_URL}/upload-resume`, formData, { headers });
      const resumeId = resumeRes.data.resumeId;

      // 2. Upload Job Description
      const jdRes = await axios.post(`${API_URL}/upload-job`, { content: jobDescription }, { headers });
      const jobDescriptionId = jdRes.data.jobDescriptionId;

      // 3. Trigger Analysis
      const triggerRes = await axios.post(`${API_URL}/analyze`, { resumeId, jobDescriptionId }, { headers });
      setAnalysisId(triggerRes.data.analysisId);

    } catch (error: any) {
      console.error("Error triggering analysis:", error);
      const details = error.response?.data?.details || error.message;
      alert(`Failed to start analysis: ${details}`);
      setIsAnalyzing(false);
    }
  };

  // Poll for results
  useEffect(() => {
    let interval: any;
    if (analysisId && isAnalyzing) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await axios.get(`${API_URL}/analysis/${analysisId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.status === 'COMPLETED') {
            setResults(res.data);
            setIsAnalyzing(false);
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            alert("Analysis failed: " + res.data.errorMessage);
            setIsAnalyzing(false);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000); // poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [analysisId, isAnalyzing]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Green, Yellow, Red

  return (
    <div className="min-h-screen bg-background dark:bg-background text-text-primary dark:text-text-inverse pt-20 px-6 pb-20">
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">ATS Resume Scanner</h1>
          <p className="text-text-secondary dark:text-text-muted text-lg">
            AI-powered semantic matching and formatting analysis to beat the ATS.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface dark:bg-[#111827] border border-border dark:border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <FileText className="text-indigo-400" />
                1. Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="w-full h-48 bg-surface-secondary dark:bg-background border border-border dark:border-border rounded-xl p-4 outline-none focus:border-indigo-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div className="bg-surface dark:bg-[#111827] border border-border dark:border-border rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Upload className="text-primary" />
                  2. Your Resume
                </h2>
                <button
                  onClick={handleUploadClick}
                  className="text-sm bg-primary/10 text-primary dark:text-primary hover:bg-primary/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <FileUp className="w-4 h-4" />
                  Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
              </div>

              {resumeFile ? (
                <div className="p-8 border-2 border-dashed border-primary/50 rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-primary/5">
                  <FileText className="w-12 h-12 text-primary" />
                  <div>
                    <p className="font-bold">{resumeFile.name}</p>
                    <p className="text-sm text-text-muted">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setResumeFile(null)} className="text-red-500 text-sm hover:underline">Remove</button>
                </div>
              ) : (
                <div onClick={handleUploadClick} className="h-48 border-2 border-dashed border-border dark:border-border rounded-xl flex flex-col items-center justify-center text-text-muted cursor-pointer hover:border-primary hover:bg-background dark:hover:bg-slate-900 transition-colors">
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <p>Drag & Drop or Click to Upload</p>
                  <p className="text-xs mt-1">PDF or DOCX (Max 10MB)</p>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription || !resumeFile}
              className="w-full bg-gradient-to-r from-blue-800 to-green-800 hover:from-blue-700 hover:to-green-700 text-text-inverse font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(6,95,70,0.4)] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
              {isAnalyzing ? 'Analyzing with AI...' : 'Scan Resume'}
            </button>
          </div>

          {/* RIGHT: Results Dashboard */}
          <div className="lg:col-span-7 bg-surface dark:bg-[#111827] border border-border dark:border-border rounded-2xl p-6 lg:p-8 shadow-xl relative min-h-[600px] flex flex-col">

            <AnimatePresence mode="wait">
              {!results && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-text-muted dark:text-text-muted space-y-4"
                >
                  <ShieldCheck className="w-24 h-24 opacity-20" />
                  <p className="text-lg">Upload JD and Resume to view your comprehensive ATS Report.</p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center space-y-8"
                >
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 border-4 border-border dark:border-border rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      AI is generating your report...
                    </h3>
                    <p className="text-text-muted">Extracting semantic embeddings and formatting rules</p>
                  </div>
                </motion.div>
              )}

              {results && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 space-y-8"
                >

                  {/* Top Score Section */}
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border dark:border-border">
                    <div className="relative w-48 h-48 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-text-secondary dark:text-text-primary" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * results.overallScore) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={results.overallScore > 70 ? "#10B981" : results.overallScore > 40 ? "#F59E0B" : "#EF4444"} />
                            <stop offset="100%" stopColor={results.overallScore > 70 ? "#059669" : results.overallScore > 40 ? "#D97706" : "#DC2626"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black">{results.overallScore}</span>
                        <span className="text-sm text-text-muted font-bold uppercase tracking-widest mt-1">Overall</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        {results.overallScore > 80 ? 'Excellent Match 🎉' : results.overallScore > 50 ? 'Good Match 👍' : 'Needs Work ⚠️'}
                      </h3>
                      <p className="text-text-secondary dark:text-text-muted text-lg mb-4">
                        {results.overallScore > 80
                          ? 'Your resume is highly optimized for this role and will easily pass ATS systems.'
                          : 'Your resume lacks critical keywords and structure required for this position.'}
                      </p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        <Download className="w-4 h-4" /> Download Full PDF Report
                      </button>
                    </div>
                  </div>

                  {/* Breakdown Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-border dark:border-border">
                    <div className="h-64">
                      <h4 className="text-center font-bold text-text-muted mb-2">Score Breakdown</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: 'Keywords', A: results.keywordMatchScore, fullMark: 100 },
                          { subject: 'Semantic', A: results.semanticMatchScore, fullMark: 100 },
                          { subject: 'Formatting', A: results.formattingScore, fullMark: 100 },
                          { subject: 'Experience', A: results.experienceScore, fullMark: 100 },
                          { subject: 'Grammar', A: results.grammarScore, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="#475569" strokeOpacity={0.3} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="font-bold flex items-center gap-2 mb-4">
                        <Award className="text-amber-500" /> Key Insights
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-background dark:bg-background p-3 rounded-lg border border-slate-100 dark:border-border">
                          <span className="text-text-secondary dark:text-text-muted">Semantic Match</span>
                          <span className="font-bold text-indigo-500">{results.semanticMatchScore}%</span>
                        </div>
                        <div className="flex justify-between items-center bg-background dark:bg-background p-3 rounded-lg border border-slate-100 dark:border-border">
                          <span className="text-text-secondary dark:text-text-muted">Keywords Present</span>
                          <span className="font-bold text-primary">{results.matchedKeywords?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background dark:bg-background p-3 rounded-lg border border-slate-100 dark:border-border">
                          <span className="text-text-secondary dark:text-text-muted">Missing Keywords</span>
                          <span className="font-bold text-rose-500">{results.missingKeywords?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  {results.aiSuggestions && results.aiSuggestions.length > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-5 h-5" /> AI Improvement Suggestions
                      </h4>
                      <ul className="space-y-3">
                        {results.aiSuggestions.map((sug: string, i: number) => (
                          <li key={i} className="flex gap-3">
                            <span className="shrink-0 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">{i + 1}</span>
                            <span className="text-text-primary dark:text-text-secondary leading-relaxed">{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formatting Issues */}
                  {results.formattingIssues && results.formattingIssues.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-6">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-5 h-5" /> Formatting & Structure Issues
                      </h4>
                      <ul className="space-y-2">
                        {results.formattingIssues.map((issue: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-text-primary dark:text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Found Keywords */}
                    <div>
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                        <CheckCircle2 className="w-5 h-5" /> Found Keywords ({results.matchedKeywords?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.matchedKeywords?.map((kw: string, i: number) => (
                          <span key={i} className="bg-primary/10 text-primary dark:text-primary border border-primary/20 px-2.5 py-1 rounded-md text-sm font-medium">
                            {kw}
                          </span>
                        ))}
                        {(!results.matchedKeywords || results.matchedKeywords.length === 0) && <span className="text-text-muted text-sm">No significant keywords found.</span>}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-rose-500">
                        <AlertCircle className="w-5 h-5" /> Missing Keywords ({results.missingKeywords?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.missingKeywords?.map((kw: string, i: number) => (
                          <span key={i} className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-md text-sm font-medium">
                            {kw}
                          </span>
                        ))}
                        {(!results.missingKeywords || results.missingKeywords.length === 0) && <span className="text-text-muted text-sm">No missing keywords!</span>}
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
      
      {/* Login Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden text-text-inverse"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 border border-primary/20">
              <LockKeyhole className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-text-inverse mb-2">Login Required</h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              Please log in to upload your resume and run the AI ATS Scanner.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login', { state: { from: '/ats-checker' } })}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-sky-600 hover:from-blue-400 hover:to-sky-500 text-text-inverse font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-semibold text-text-muted hover:text-text-inverse transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
