import React, { useState, useEffect } from "react";
import { Search, StickyNote, Trash2, Loader, User } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiConfig";

export default function NotesManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(getApiUrl(`/api/v1/auth/users?t=${Date.now()}`));
        // Filter users if needed, or show all
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectUser = async (user: any) => {
    setSelectedUser(user);
    setIsFetchingNotes(true);
    try {
      const res = await axios.get(getApiUrl(`/api/v1/notes/admin/users/${user.id}/notes`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setUserNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setUserNotes([]);
    } finally {
      setIsFetchingNotes(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      return alert("Title and content are required");
    }
    setIsSubmittingNote(true);
    try {
      const res = await axios.post(getApiUrl(`/api/v1/notes/admin/users/${selectedUser.id}/notes`), {
        title: newNoteTitle,
        content: newNoteContent
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setUserNotes([res.data, ...userNotes]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch (err) {
      console.error("Failed to create note:", err);
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
      setUserNotes(userNotes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      
      {/* Users List Sidebar */}
      <div className="w-1/3 bg-surface dark:bg-[#111827] border border-border rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-text-primary mb-4">Select User</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingUsers ? (
            <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8 text-text-muted text-sm">No users found.</div>
          ) : (
            filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center space-x-3 ${selectedUser?.id === user.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${selectedUser?.id === user.id ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-text-primary'}`}>
                  {user.name?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden">
                  <div className={`font-semibold truncate ${selectedUser?.id === user.id ? 'text-primary' : 'text-text-primary'}`}>{user.name}</div>
                  <div className="text-xs text-text-muted truncate">{user.email}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Notes Area */}
      <div className="flex-1 bg-surface dark:bg-[#111827] border border-border rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-primary flex items-center">
                <StickyNote className="w-5 h-5 mr-2 text-primary" />
                Notes for {selectedUser.name}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Add Note Form */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-border space-y-3">
                <h4 className="font-semibold text-sm text-text-primary">Add New Note</h4>
                <input 
                  type="text" 
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title" 
                  className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
                <textarea 
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="Note content..."
                  rows={4}
                  className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
                />
                <button 
                  onClick={handleCreateNote} 
                  disabled={isSubmittingNote}
                  className="bg-primary hover:bg-primary/90 text-text-inverse px-4 py-2 rounded-lg text-sm font-bold w-full md:w-auto transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmittingNote ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <StickyNote className="w-4 h-4 mr-2" />}
                  {isSubmittingNote ? "Adding..." : "Save Note"}
                </button>
              </div>

              {/* Previous Notes List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-text-primary border-b border-border pb-2">Previous Notes</h4>
                {isFetchingNotes ? (
                  <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
                ) : userNotes.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-border">
                    <StickyNote className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
                    <p className="text-sm text-text-muted font-medium">No notes found for this user.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userNotes.map(note => (
                      <div key={note.id} className="bg-white dark:bg-[#1a2333] border border-border rounded-xl p-5 hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-bold text-text-primary text-lg">{note.title}</h5>
                          <button onClick={() => handleDeleteNote(note.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{note.content}</p>
                        <div className="mt-4 pt-3 border-t border-border/50 text-xs text-text-muted flex justify-between">
                          <span>Added on {new Date(note.createdAt).toLocaleDateString()}</span>
                          {note.admin && <span>By: {note.admin.name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
            <User className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">Select a User</h3>
            <p className="max-w-md">Choose a user from the list on the left to view and manage their notes.</p>
          </div>
        )}
      </div>

    </div>
  );
}
