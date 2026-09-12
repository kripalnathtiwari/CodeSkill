import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, X, Save, Clock, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (user) {
      const savedNotes = localStorage.getItem(`codeSklii_notes_${user.email}`);
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error("Failed to parse notes", e);
        }
      }
    }
  }, [user]);

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    if (user) {
      localStorage.setItem(`codeSklii_notes_${user.email}`, JSON.stringify(updatedNotes));
    }
    setNotes(updatedNotes);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const now = new Date().toISOString();
    
    if (currentNote) {
      // Update existing
      const updated = notes.map(n => 
        n.id === currentNote.id 
          ? { ...n, title, content, updatedAt: now } 
          : n
      );
      saveNotesToStorage(updated);
    } else {
      // Create new
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Untitled Note',
        content,
        createdAt: now,
        updatedAt: now
      };
      saveNotesToStorage([newNote, ...notes]);
    }

    closeEditor();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    saveNotesToStorage(updated);
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setCurrentNote(note);
      setTitle(note.title);
      setContent(note.content);
    } else {
      setCurrentNote(null);
      setTitle('');
      setContent('');
    }
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setCurrentNote(null);
    setTitle('');
    setContent('');
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
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
            My Notes
          </h1>
          <p className="text-text-muted mt-2 font-medium">Keep track of your learnings, snippets, and ideas.</p>
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
          
          <button 
            onClick={() => openEditor()}
            className="flex items-center gap-2 bg-primary text-text-inverse px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden border border-border"
            >
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-secondary dark:bg-slate-800/50">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="bg-transparent text-xl font-bold text-text-primary placeholder:text-text-muted/50 focus:outline-none w-full mr-4"
                  autoFocus
                />
                <button 
                  onClick={closeEditor}
                  className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Editor Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here... (Markdown supported mentally)"
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-text-secondary leading-relaxed"
                />
              </div>
              
              {/* Editor Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-secondary dark:bg-slate-800/50">
                <div className="text-sm text-text-muted">
                  {currentNote ? `Last updated: ${formatDate(currentNote.updatedAt)}` : 'Drafting new note'}
                </div>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-secondary/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-border/60">
          <StickyNote className="w-16 h-16 text-text-muted/30 mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No notes yet</h3>
          <p className="text-text-muted max-w-md mb-6">Create your first note to store important coding concepts, snippets, or ideas you want to revisit later.</p>
          <button 
            onClick={() => openEditor()}
            className="flex items-center gap-2 bg-surface border-2 border-primary/20 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-text-inverse hover:border-primary transition-all"
          >
            <Plus className="w-5 h-5" />
            Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map(note => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={note.id}
              onClick={() => openEditor(note)}
              className="bg-surface dark:bg-[#111827] border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 p-6 rounded-2xl flex flex-col h-64 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-text-primary text-lg line-clamp-1 flex-1 pr-2 group-hover:text-primary transition-colors">{note.title}</h3>
                <button 
                  onClick={(e) => handleDelete(note.id, e)}
                  className="text-text-muted/50 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed flex-1 line-clamp-5 whitespace-pre-wrap">
                {note.content}
              </p>
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
