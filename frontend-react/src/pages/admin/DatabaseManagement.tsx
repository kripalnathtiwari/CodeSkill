import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../../utils/apiConfig';
import { Archive, Search, RefreshCw, Eye, Trash2, ArrowLeft, AlertTriangle, Undo } from 'lucide-react';

interface ArchiveRecord {
  id: string;
  entityType: string;
  originalId: string;
  data: string;
  deletedBy: string | null;
  deletedAt: string;
  status?: string;
}

export default function DatabaseManagement() {
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [mainTab, setMainTab] = useState<'ARCHIVED' | 'RESTORED'>('ARCHIVED');
  // API_URL imported from apiConfig

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/archives`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setArchives(response.data);
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleDeleteArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this record? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/archives/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      fetchArchives();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting archive:', error);
      alert('Failed to delete archive record');
    }
  };

  const handleRestoreArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to restore this record back to the database?")) return;
    try {
      await axios.post(`${API_URL}/api/v1/archives/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Record restored successfully!');
      fetchArchives();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (error: any) {
      console.error('Error restoring archive:', error);
      alert(error.response?.data?.error || 'Failed to restore archive record');
    }
  };

  const handleClearArchives = async () => {
    if (!window.confirm("WARNING: Are you sure you want to PERMANENTLY DELETE ALL archived records? This cannot be undone!")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/archives/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      fetchArchives();
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error clearing archives:', error);
      alert('Failed to clear archives');
    }
  };

  const filteredArchives = Array.isArray(archives) ? archives.filter(r => {
    const matchesSearch = r.entityType?.toLowerCase().includes(search.toLowerCase()) || 
                          r.data?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'ALL' || r.entityType === activeTab;
    const matchesMain = mainTab === 'RESTORED' ? r.status === 'RESTORED' : r.status !== 'RESTORED';
    return matchesSearch && matchesTab && matchesMain;
  }) : [];

  const tabs = ['ALL', 'COLLEGE_INSTITUTION', 'COLLEGE_TUTOR', 'APTITUDE_PROBLEM', 'USER'];

  const formatTabName = (tab: string) => {
    if (tab === 'ALL') return 'All Records';
    if (tab === 'COLLEGE_INSTITUTION') return 'Colleges';
    if (tab === 'COLLEGE_TUTOR') return 'Instructors';
    if (tab === 'APTITUDE_PROBLEM') return 'Aptitude Problems';
    if (tab === 'USER') return 'Users/Students';
    return tab;
  };

  return (
    <div className="p-6 bg-background dark:bg-[#0B0F19] min-h-screen text-text-primary font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Archive className="text-primary w-8 h-8" />
            Database Archives
          </h1>
          <p className="text-text-muted mt-2">View and manage deleted records across all tables.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchArchives}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleClearArchives}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition-colors border border-red-500/20"
          >
            <AlertTriangle className="w-5 h-5" />
            Clear All
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => { setMainTab('ARCHIVED'); setSelectedRecord(null); }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mainTab === 'ARCHIVED' ? 'bg-primary text-text-inverse' : 'bg-slate-800 text-text-muted hover:bg-slate-700'
          }`}
        >
          Archived Data
        </button>
        <button
          onClick={() => { setMainTab('RESTORED'); setSelectedRecord(null); }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mainTab === 'RESTORED' ? 'bg-primary text-text-inverse' : 'bg-slate-800 text-text-muted hover:bg-slate-700'
          }`}
        >
          Restored Data
        </button>
      </div>

      {!selectedRecord ? (
        <div className="bg-surface dark:bg-[#111827] rounded-xl border border-border overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-primary text-text-inverse' 
                      : 'bg-slate-800 text-text-muted hover:bg-slate-700 hover:text-text-inverse'
                  }`}
                >
                  {formatTabName(tab)}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Search archives..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-border rounded-lg pl-10 pr-4 py-2 text-text-inverse focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-text-muted w-5 h-5" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-text-muted uppercase text-sm font-semibold tracking-wider">
                <tr>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Original ID</th>
                  <th className="p-4">Deleted At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted">Loading archives...</td>
                  </tr>
                ) : filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted">No archived records found.</td>
                  </tr>
                ) : (
                  filteredArchives.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 font-medium">
                        <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                          {record.entityType}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted text-sm">{record.originalId.slice(0, 8)}...</td>
                      <td className="p-4 text-text-muted">{new Date(record.deletedAt).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedRecord(record)}
                            title="View Data"
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-text-secondary transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {record.status !== 'RESTORED' && (
                            <button 
                              onClick={(e) => handleRestoreArchive(record.id, e)}
                              title="Restore Record"
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-green-500/20 hover:text-green-400 rounded-lg text-text-secondary transition-colors"
                            >
                              <Undo className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleDeleteArchive(record.id, e)}
                            title="Delete Permanently"
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-text-secondary transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface dark:bg-[#111827] rounded-xl border border-border overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setSelectedRecord(null)}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Archives
            </button>
            <div className="flex gap-4">
              <span className="px-3 py-1 rounded text-sm bg-primary/10 text-primary border border-primary/20">
                {selectedRecord.entityType}
              </span>
              {selectedRecord.status !== 'RESTORED' && (
                <button 
                  onClick={(e) => handleRestoreArchive(selectedRecord.id, e)}
                  className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 px-3 py-1 rounded-lg transition-colors border border-green-500/20 text-sm"
                >
                  <Undo className="w-4 h-4" /> Restore
                </button>
              )}
              <button 
                onClick={(e) => handleDeleteArchive(selectedRecord.id, e)}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1 rounded-lg transition-colors border border-red-500/20 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Archive ID</h3>
              <p className="font-mono text-sm">{selectedRecord.id}</p>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Original ID</h3>
              <p className="font-mono text-sm">{selectedRecord.originalId}</p>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Deleted At</h3>
              <p>{new Date(selectedRecord.deletedAt).toLocaleString()}</p>
            </div>
            {selectedRecord.deletedBy && (
              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Deleted By User ID</h3>
                <p className="font-mono text-sm">{selectedRecord.deletedBy}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-slate-100/50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-medium">Original Record Data</h3>
            </div>
            <div className="p-4 overflow-auto max-h-[500px]">
              <pre className="text-sm font-mono text-text-secondary">
                {JSON.stringify(JSON.parse(selectedRecord.data), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
