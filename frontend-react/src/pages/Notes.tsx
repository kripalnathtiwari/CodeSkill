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
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF", error);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <StickyNote className="w-8 h-8 text-primary" />
            Important Notes
          </h1>
          <p className="text-text-muted mt-2 font-medium">Important notes and announcements shared by the administrator.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          </div>
        </div>
      </div>



      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-primary">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-secondary/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-border/60">
          <FileText className="w-16 h-16 text-text-muted/30 mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No notes available</h3>
          <p className="text-text-muted max-w-md mb-6">Notes added by the administrator will appear here for you to read and download.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map(note => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={note.id}
              className="bg-surface dark:bg-[#111827] border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 p-6 rounded-2xl flex flex-col h-64 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-text-primary text-lg line-clamp-1 group-hover:text-primary transition-colors">{note.title}</h3>
                  {note.courseName && (
                    <span className="inline-block mt-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                      {note.courseName}
                    </span>
                  )}
                </div>
                {note.content && !note.pdfUrl && (
                  <button 
                    onClick={(e) => handleDownload(note, e)}
                    className="text-text-muted hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Download Note Text"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {note.content ? (
                <p className="text-text-secondary text-sm leading-relaxed flex-1 line-clamp-5 whitespace-pre-wrap">
                  {note.content}
                </p>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted/50 py-4">
                  <FileText className="w-8 h-8 mb-2" />
                  <span className="text-xs">PDF Document</span>
                </div>
              )}

              {note.pdfUrl && (
                <div className="mt-3 flex-shrink-0 flex gap-2">
                  <a 
                    href={getApiUrl(note.pdfUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center text-xs font-semibold text-primary hover:text-primary-dark transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    View PDF
                  </a>
                  <button
                    onClick={(e) => handlePdfDownload(note.pdfUrl!, note.title, e)}
                    className="inline-flex items-center justify-center text-xs font-semibold text-text-muted hover:text-primary transition-colors bg-surface-secondary hover:bg-primary/10 px-3 py-2 rounded-lg border border-border"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center text-xs font-medium text-text-muted gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(note.updatedAt)}
              </div>
            </motion.div>
          ))}
          
          {filteredNotes.length === 0 && searchQuery && (
            <div className="col-span-full py-12 text-center text-text-muted">
              No notes found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}

    </div>
  );
}
