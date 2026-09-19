import React, { useState, useEffect } from "react";
import { StickyNote, Trash2, Loader } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";

export default function NotesManagement() {
  const [globalNotes, setGlobalNotes] = useState<any[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isFetchingNotes, setIsFetchingNotes] = useState(true);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    const fetchGlobalNotes = async () => {
      setIsFetchingNotes(true);
      try {
        const res = await axios.get(getApiUrl(`/api/v1/notes/admin/global-notes`), {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setGlobalNotes(res.data);
      } catch (err) {
        console.error("Failed to fetch global notes:", err);
      } finally {
        setIsFetchingNotes(false);
      }
    };
    fetchGlobalNotes();
  }, []);

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      return alert("Title and content are required");
    }
    setIsSubmittingNote(true);
    try {
      const res = await axios.post(getApiUrl(`/api/v1/notes/admin/global-notes`), {
        title: newNoteTitle,
        content: newNoteContent
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setGlobalNotes([res.data, ...globalNotes]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch (err) {
      console.error("Failed to create global note:", err);
      alert("Failed to create note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(getApiUrl(`/api/v1/notes/admin/notes/${noteId}`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setGlobalNotes(globalNotes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex-1 bg-surface dark:bg-[#111827] border border-border rounded-2xl flex flex-col overflow-hidden shadow-xl max-w-4xl mx-auto w-full">
        
        <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary flex items-center">
            <StickyNote className="w-6 h-6 mr-3 text-primary" />
            Global Notes Management
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Add Note Form */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-border space-y-4">
            <h4 className="font-semibold text-text-primary text-lg">Add New Global Note</h4>
            <p className="text-sm text-text-muted mb-2">This note will be visible to all students on the platform.</p>
            <input 
              type="text" 
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              placeholder="Note Title" 
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
            <textarea 
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              placeholder="Note content..."
              rows={5}
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
            />
            <button 
              onClick={handleCreateNote} 
              disabled={isSubmittingNote}
              className="bg-primary hover:bg-primary/90 text-text-inverse px-6 py-2.5 rounded-lg text-sm font-bold w-full md:w-auto transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmittingNote ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <StickyNote className="w-4 h-4 mr-2" />}
              {isSubmittingNote ? "Publishing..." : "Publish Global Note"}
            </button>
          </div>

          {/* Previous Notes List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-xl text-text-primary border-b border-border pb-3">All Global Notes</h4>
            {isFetchingNotes ? (
              <div className="flex justify-center p-12"><Loader className="w-8 h-8 animate-spin text-primary" /></div>
            ) : globalNotes.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-border">
                <StickyNote className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">No global notes found</h3>
                <p className="text-sm text-text-muted font-medium">Create one above to share with students.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {globalNotes.map(note => (
                  <div key={note.id} className="bg-white dark:bg-[#1a2333] border border-border rounded-xl p-6 hover:border-primary/30 transition-colors shadow-sm relative group">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="font-bold text-text-primary text-xl pr-10">{note.title}</h5>
                      <button 
                        onClick={() => handleDeleteNote(note.id)} 
                        className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                        title="Delete Note"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-base text-text-secondary whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="mt-6 pt-4 border-t border-border/50 text-sm text-text-muted flex justify-between items-center">
                      <span>Posted on {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}</span>
                      {note.admin && <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold">By: {note.admin.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
