import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Layers, 
  Eye, 
  Plus,
  Briefcase,
  X
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../utils/apiConfig';
import DriveImage, { extractDriveId } from '../components/DriveImage';
import { useAuth } from '../context/AuthContext';

interface SampleCv {
  id: string;
  title: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  fileUrl?: string;
  redirectUrl?: string;
  createdAt?: string;
}

function getEmbedPreviewUrl(sample: SampleCv | null, apiUrl: string): { type: 'iframe' | 'image' | 'drive'; url: string } {
  if (!sample) return { type: 'image', url: '' };
  const rawUrl = sample.fileUrl || sample.imageUrl;
  if (!rawUrl) return { type: 'image', url: '' };

  const driveId = extractDriveId(rawUrl);
  if (driveId) {
    return {
      type: 'drive',
      url: `https://drive.google.com/file/d/${driveId}/preview`
    };
  }

  if (rawUrl.toLowerCase().endsWith('.pdf') || rawUrl.includes('/pdf/')) {
    return {
      type: 'iframe',
      url: rawUrl.startsWith('http') ? rawUrl : `${apiUrl}${rawUrl}`
    };
  }

  return {
    type: 'image',
    url: rawUrl.startsWith('http') ? rawUrl : `${apiUrl}${rawUrl}`
  };
}

export default function CVTemplates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [samples, setSamples] = useState<SampleCv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<SampleCv | null>(null);

  const handleStartBuilder = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { from: '/cv-builder?view=editor' } });
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/cv/samples`);
      setSamples(res.data || []);
    } catch (error) {
      console.error('Failed to fetch CV sample templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique categories dynamically from uploaded samples
  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    samples.forEach(s => {
      if (s.category && s.category.trim() !== '') {
        cats.add(s.category.trim());
      }
    });
    // Add default popular categories if list is small
    if (cats.size <= 1) {
      ['Software Engineer', 'Data Science', 'Full Stack', 'Fresher'].forEach(c => cats.add(c));
    }
    return Array.from(cats);
  }, [samples]);

  // Filter samples based on search query and category
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const matchesCategory = selectedCategory === 'All' || 
        sample.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
        sample.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sample.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sample.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [samples, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-12 px-4 sm:px-6 lg:px-12 transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-end mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/cv-builder?view=editor"
              onClick={handleStartBuilder}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create from Scratch</span>
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-wider uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recruiter-Approved CV Library</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            Explore Proven <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Resume Templates</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
          >
            Browse curated resume templates uploaded by our career mentors and admin team. Optimized to pass ATS screens and impress technical recruiters.
          </motion.p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 mb-10 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates by role or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1 hidden sm:block" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading resume collection...</p>
          </div>
        ) : filteredSamples.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            <AnimatePresence>
              {filteredSamples.map((sample) => {
                const isImage = sample.imageUrl || sample.fileUrl?.match(/\.(png|jpe?g|webp|gif)$/i);
                const destination = sample.redirectUrl || '/cv-builder';
                const previewUrl = sample.fileUrl 
                  ? (sample.fileUrl.startsWith('http') ? sample.fileUrl : `${API_URL}/public${sample.fileUrl}`)
                  : sample.imageUrl
                  ? (sample.imageUrl.startsWith('http') ? sample.imageUrl : `${API_URL}/public${sample.imageUrl}`)
                  : null;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -6 }}
                    key={sample.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg dark:shadow-xl flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                  >
                    <div>
                      {/* Preview Image / Google Drive Thumbnail / Card Graphic */}
                      <div className="mb-5 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-72 flex items-center justify-center border border-slate-200 dark:border-slate-700 relative group/img">
                        <DriveImage sample={sample} apiUrl={API_URL} />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedPreview(sample)}
                            className="p-3 rounded-full bg-white text-slate-900 hover:bg-emerald-500 hover:text-white transition-colors shadow-lg"
                            title="View Document"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Header info */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate" title={sample.title}>
                          {sample.title}
                        </h3>
                        {sample.category && (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full whitespace-nowrap">
                            {sample.category}
                          </span>
                        )}
                      </div>

                      {sample.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                          {sample.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(sample)}
                        className="flex-1 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={destination}
                        onClick={(e) => {
                          if (!sample.redirectUrl || sample.redirectUrl === '/cv-builder') {
                            e.preventDefault();
                            navigate('/cv-builder');
                          }
                        }}
                        target={sample.redirectUrl?.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="flex-[2] text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>Use this Template</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl mx-auto mb-16 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Resume Templates Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-8 font-medium">
              {searchQuery || selectedCategory !== 'All'
                ? 'We could not find any templates matching your filter criteria. Try clearing your filters or search terms.'
                : 'No custom CV templates have been uploaded by the admin yet. You can still create your professional resume using our interactive editor.'}
            </p>
            <div className="flex items-center justify-center gap-4">
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm transition-all"
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/cv-builder?view=editor"
                onClick={handleStartBuilder}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                Go to Resume Editor
              </Link>
            </div>
          </motion.div>
        )}

        {/* Footer CTA Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Need a Custom Resume?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                Build Your Resume From Scratch with ATS Formatting
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                Use our automated ATS checking tools, live interactive editor, and PDF exporter to craft an interview-ready resume.
              </p>
            </div>
            <Link
              to="/cv-builder?view=editor"
              onClick={handleStartBuilder}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-xl transition-all whitespace-nowrap"
            >
              Start Resume Builder
            </Link>
          </div>
        </div>

        {/* Interactive CV Preview Modal Dialog */}
        <AnimatePresence>
          {selectedPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPreview(null)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-10"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative"
              >
                {/* Modal Top Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md z-10 shrink-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {selectedPreview.title}
                      </h3>
                      {selectedPreview.category && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {selectedPreview.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        if (!user) {
                          setSelectedPreview(null);
                          navigate('/login', { state: { from: '/cv-builder?view=editor' } });
                          return;
                        }
                        const dest = selectedPreview.redirectUrl || '/cv-builder?view=editor';
                        if (!selectedPreview.redirectUrl || selectedPreview.redirectUrl === '/cv-builder') {
                          setSelectedPreview(null);
                          navigate('/cv-builder?view=editor');
                        } else {
                          window.open(dest, '_blank');
                        }
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2 px-5 rounded-xl text-sm shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Use this Template</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedPreview(null)}
                      className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Close preview"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Document Body */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto relative flex flex-col items-center justify-center">
                  {(() => {
                    const previewData = getEmbedPreviewUrl(selectedPreview, API_URL);
                    if (previewData.type === 'drive' || previewData.type === 'iframe') {
                      return (
                        <iframe
                          src={previewData.url}
                          title={selectedPreview.title}
                          className="w-full h-full border-0"
                          allow="autoplay"
                        />
                      );
                    }
                    if (previewData.type === 'image' && previewData.url) {
                      return (
                        <div className="p-6 w-full h-full overflow-auto flex items-start justify-center">
                          <img
                            src={previewData.url}
                            alt={selectedPreview.title}
                            className="max-w-full h-auto rounded-xl shadow-2xl border border-slate-300 dark:border-slate-800"
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="text-center py-16 text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No preview file available for this template.</p>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
