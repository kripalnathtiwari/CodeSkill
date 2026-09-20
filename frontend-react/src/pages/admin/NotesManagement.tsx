import React, { useState, useEffect, useRef } from "react";
import { StickyNote, Trash2, Loader, Upload, FileText, Pencil, X } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";

export default function NotesManagement() {
  const [globalNotes, setGlobalNotes] = useState<any[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmitNote = async () => {
    if (!newNoteTitle.trim()) {
      return alert("Title is required");
    }
    setIsSubmittingNote(true);
    try {
      if (editingNoteId) {
        const payload = {
          title: newNoteTitle,
          content: newNoteContent,
          courseName: newCourseName,
          imageUrl: imageUrl
        };
        const res = await axios.put(getApiUrl(`/api/v1/notes/admin/notes/${editingNoteId}`), payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setGlobalNotes(globalNotes.map(n => n.id === editingNoteId ? res.data : n));
      } else {
        const formData = new FormData();
        formData.append("title", newNoteTitle);
        formData.append("content", newNoteContent);
        formData.append("courseName", newCourseName);
        if (imageUrl) formData.append("imageUrl", imageUrl);
        if (pdfFile) {
          formData.append("pdf", pdfFile);
        }

        const res = await axios.post(getApiUrl(`/api/v1/notes/admin/global-notes`), formData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setGlobalNotes([res.data, ...globalNotes]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save global note:", err);
      alert("Failed to save note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const resetForm = () => {
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewCourseName("");
    setImageUrl("");
    setPdfFile(null);
    setEditingNoteId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditNote = (note: any) => {
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content || "");
    setNewCourseName(note.courseName || "");
    setImageUrl(note.imageUrl || "");
    setEditingNoteId(note.id);
    setPdfFile(null); // Updating PDF is not supported currently
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-border space-y-4 relative">
            {editingNoteId && (
              <button 
                onClick={resetForm}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Cancel Edit"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <h4 className="font-semibold text-text-primary text-lg">
              {editingNoteId ? "Edit Global Note" : "Add New Global Note"}
            </h4>
            <p className="text-sm text-text-muted mb-2">
              {editingNoteId ? "Update the details for this note." : "This note will be visible to all students on the platform."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder="Note Title *" 
                className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <input 
                type="text" 
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                placeholder="Course Name (Optional)" 
                className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <input 
                type="url" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Cover Image URL (Optional)" 
                className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary md:col-span-2"
              />
            </div>
            
            <textarea 
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              placeholder="Note content... (Optional if PDF is uploaded)"
              rows={4}
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
            />
            
            <div className="flex items-center space-x-4 bg-white dark:bg-[#1a2333] border border-border rounded-lg p-3">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPdfFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center text-sm font-medium text-text-secondary hover:text-primary transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select PDF Document
              </button>
              <span className="text-sm text-text-muted truncate">
                {pdfFile ? pdfFile.name : (editingNoteId ? "Cannot update PDF currently (Optional)" : "No file selected (Optional)")}
              </span>
            </div>

            <button 
              onClick={handleSubmitNote} 
              disabled={isSubmittingNote}
              className="bg-primary hover:bg-primary/90 text-text-inverse px-6 py-2.5 rounded-lg text-sm font-bold w-full md:w-auto transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmittingNote ? <Loader className="w-4 h-4 animate-spin mr-2" /> : (editingNoteId ? <Pencil className="w-4 h-4 mr-2" /> : <StickyNote className="w-4 h-4 mr-2" />)}
              {isSubmittingNote ? (editingNoteId ? "Saving..." : "Publishing...") : (editingNoteId ? "Save Changes" : "Publish Global Note")}
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
                      <div>
                        <h5 className="font-bold text-text-primary text-xl">{note.title}</h5>
                        {note.courseName && (
                          <span className="inline-block mt-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded">
                            {note.courseName}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditNote(note)} 
                          className="text-text-muted hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                          title="Edit Note"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note.id)} 
                          className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {note.imageUrl && (
                      <div className="w-full h-40 mb-4 rounded-xl overflow-hidden">
                        <img src={note.imageUrl} alt={note.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {note.content && (
                      <p className="text-base text-text-secondary whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    )}
                    
                    {note.pdfUrl && (
                      <div className="mt-4">
                        <a 
                          href={getApiUrl(note.pdfUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors bg-primary/10 px-4 py-2 rounded-lg"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Attached PDF
                        </a>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-border/50 text-sm text-text-muted flex justify-between items-center">
                      <span>Posted on {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}</span>
                      {note.admin && <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold">By: {note.admin.profile?.firstName} {note.admin.profile?.lastName}</span>}
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
