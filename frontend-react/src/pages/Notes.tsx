import React, { useState, useEffect } from 'react';
import { Search, Download, Clock, StickyNote, FileText, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';

interface Note {
  id: string;
  title: string;
  content?: string;
  courseName?: string;
  pdfUrl?: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await axios.get(getApiUrl('/api/v1/notes/my-notes'), {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setNotes(res.data);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const handleDownload = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const element = document.createElement("a");
    const file = new Blob([note.content || ""], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePdfDownload = async (pdfUrl: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await axios.get(getApiUrl(pdfUrl), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF", error);
      alert("Failed to download PDF. The file may have been deleted or is missing from the server.");
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.courseName && n.courseName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <StickyNote className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            Important Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm font-medium">
            Important notes and announcements shared by the administrator.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-blue-600">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No notes available</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
            Notes added by the administrator will appear here for you to read and download.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map(note => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={note.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg rounded-xl flex flex-col h-full overflow-hidden transition-all group"
            >
              {/* TOP: Edge-to-edge Image */}
              {note.imageUrl ? (
                <div className="w-full h-48 relative bg-slate-100 dark:bg-slate-800 shrink-0 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                  <img src={note.imageUrl} alt={note.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {note.courseName && (
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                      {note.courseName}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 relative bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  {note.courseName && (
                    <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[11px] font-medium px-2.5 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                      {note.courseName}
                    </div>
                  )}
                </div>
              )}

              {/* BOTTOM: Content Padding */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">{note.title}</h3>
                  {note.content && !note.pdfUrl && (
                    <button
                      onClick={(e) => handleDownload(note, e)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
                      title="Download Note Text"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {note.content && !note.imageUrl && !note.pdfUrl ? (
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1 line-clamp-4 mt-1">
                    {note.content}
                  </p>
                ) : (
                  <div className="flex-1"></div>
                )}

                {note.pdfUrl && (
                  <div className="mt-5 flex gap-2 w-full">
                    <a
                      href={getApiUrl(note.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors px-4 py-2 rounded-lg shadow-sm"
                    >
                      <FileText className="w-4 h-4 mr-2 text-slate-400" />
                      View PDF
                    </a>
                    <button
                      onClick={(e) => handlePdfDownload(note.pdfUrl!, note.title, e)}
                      className="inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded-lg shadow-sm shrink-0"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                  {formatDate(note.updatedAt)}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredNotes.length === 0 && searchQuery && (
            <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
              No notes found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
