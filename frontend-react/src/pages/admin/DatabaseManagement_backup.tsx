import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Archive, Search, RefreshCw, Eye, Trash2, ArrowLeft } from 'lucide-react';

interface ArchiveRecord {
  id: string;
  entityType: string;
  originalId: string;
  data: string;
  deletedBy: string | null;
  deletedAt: string;
}

export default function DatabaseManagement() {
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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

  const filteredArchives = Array.isArray(archives) ? archives.filter(r => 
    r.entityType?.toLowerCase().includes(search.toLowerCase()) || 
    r.data?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="p-6 bg-background dark:bg-[#0B0F19] min-h-screen text-slate-100 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Archive className="text-blue-500 w-8 h-8" />
            Database Archives
          </h1>
          <p className="text-slate-400 mt-2">View deleted records across all tables.</p>
        </div>
        <button 
          onClick={fetchArchives}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {!selectedRecord ? (
        <div className="bg-surface dark:bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search archives..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 uppercase text-sm font-semibold tracking-wider">
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
                    <td colSpan={4} className="p-8 text-center text-slate-400">Loading archives...</td>
                  </tr>
                ) : filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">No archived records found.</td>
                  </tr>
                ) : (
                  filteredArchives.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 font-medium">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {record.entityType}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{record.originalId.slice(0, 8)}...</td>
                      <td className="p-4 text-slate-400">{new Date(record.deletedAt).toLocaleString()}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedRecord(record)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface dark:bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setSelectedRecord(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Archives
            </button>
            <span className="px-3 py-1 rounded text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {selectedRecord.entityType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Archive ID</h3>
              <p className="font-mono text-sm">{selectedRecord.id}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Original ID</h3>
              <p className="font-mono text-sm">{selectedRecord.originalId}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Deleted At</h3>
              <p>{new Date(selectedRecord.deletedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-medium">Original Record Data</h3>
            </div>
            <div className="p-4 overflow-auto max-h-[500px]">
              <pre className="text-sm font-mono text-slate-300">
                {JSON.stringify(JSON.parse(selectedRecord.data), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
