import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Link as LinkIcon, Briefcase, ChevronRight, Tags, Tag } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../../utils/apiConfig';

interface SampleCV {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: string | null;
  createdAt: string;
}

interface JobSkillMap {
  id: string;
  jobRole: string;
  skills: string[];
  createdAt: string;
}

export default function CvManagement() {
  const [activeTab, setActiveTab] = useState<'samples' | 'skills'>('samples');

  // Samples State
  const [samples, setSamples] = useState<SampleCV[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Skills State
  const [jobSkillMaps, setJobSkillMaps] = useState<JobSkillMap[]>([]);
  const [jobRole, setJobRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  });

  useEffect(() => {
    fetchSamples();
    fetchJobSkills();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/cv/samples`, getHeaders());
      setSamples(res.data);
    } catch (error) {
      console.error('Failed to fetch CV samples:', error);
    }
  };

  const fetchJobSkills = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/cv/skills`, getHeaders());
      setJobSkillMaps(res.data);
    } catch (error) {
      console.error('Failed to fetch job skills:', error);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return alert('Title and File are required');

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('file', file);

    try {
      await axios.post(`${API_URL}/api/v1/admin/cv/samples`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      alert('CV Sample uploaded successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
      fetchSamples();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSample = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sample?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/cv/samples/${id}`, getHeaders());
      alert('Deleted successfully');
      setSamples(samples.filter(s => s.id !== id));
    } catch (error) {
      alert('Failed to delete sample');
    }
  };

  const addSkillToCurrent = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills([...currentSkills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkillFromCurrent = (index: number) => {
    setCurrentSkills(currentSkills.filter((_, i) => i !== index));
  };

  const handleSaveJobSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim() || currentSkills.length === 0) {
      return alert('Job Role and at least one skill are required');
    }
    
    setIsSavingSkill(true);
    try {
      await axios.post(`${API_URL}/api/v1/admin/cv/skills`, {
        jobRole: jobRole.trim(),
        skills: currentSkills
      }, getHeaders());
      alert('Job skills saved successfully');
      setJobRole('');
      setCurrentSkills([]);
      fetchJobSkills();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save job skills');
    } finally {
      setIsSavingSkill(false);
    }
  };

  const deleteJobSkillMap = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job role mapping?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/cv/skills/${id}`, getHeaders());
      alert('Deleted successfully');
      setJobSkillMaps(jobSkillMaps.filter(m => m.id !== id));
    } catch (error) {
      alert('Failed to delete mapping');
    }
  };

  const removeIndividualSkill = async (mapId: string, skill: string) => {
    try {
        await axios.put(`${API_URL}/api/v1/admin/cv/skills/remove/${mapId}`, { skill }, getHeaders());
        fetchJobSkills();
    } catch (error) {
        alert('Failed to remove skill');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">CV Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage sample CV templates and job-specific skills mappings.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('samples')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'samples' 
            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Sample CVs
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'skills' 
            ? 'text-fuchsia-600 dark:text-fuchsia-400 border-b-2 border-fuchsia-500' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Job Skills
        </button>
      </div>

      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1 glass-card bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Plus className="w-5 h-5 mr-2" /> Upload Sample CV</h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. IT & Software"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">File (PDF/DOCX)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload Sample'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {samples.map(sample => (
                <div key={sample.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-lg">{sample.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{sample.description || 'No description'}</p>
                      {sample.category && (
                        <span className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-full">
                          {sample.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                    <a href={`${API_URL}/public${sample.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-500 text-sm font-bold flex items-center">
                      <LinkIcon className="w-4 h-4 mr-1" /> View File
                    </a>
                    <button onClick={() => deleteSample(sample.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {samples.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No sample CVs uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Job Role Form */}
          <div className="lg:col-span-1 glass-card bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-fuchsia-500" /> Map Job Skills</h2>
            <form onSubmit={handleSaveJobSkills} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Job Role</label>
                <input
                  type="text"
                  required
                  value={jobRole}
                  onChange={e => setJobRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="e.g. Backend Developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Add Skills</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkillToCurrent())}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-fuchsia-500"
                    placeholder="e.g. Node.js"
                  />
                  <button type="button" onClick={addSkillToCurrent} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 px-4 rounded-xl font-bold">Add</button>
                </div>
              </div>

              {currentSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentSkills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 px-3 py-1 rounded-full text-sm font-semibold">
                      <span>{skill}</span>
                      <button type="button" onClick={() => removeSkillFromCurrent(index)} className="hover:text-rose-500 ml-1">&times;</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingSkill}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
              >
                {isSavingSkill ? 'Saving...' : 'Save Job Skills'}
              </button>
            </form>
          </div>

          {/* List mapped skills */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {jobSkillMaps.map(map => (
                <div key={map.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <ChevronRight className="w-5 h-5 text-fuchsia-500 mr-1" />
                      {map.jobRole}
                    </h3>
                    <button onClick={() => deleteJobSkillMap(map.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-colors" title="Delete role map">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {map.skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 group">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{skill}</span>
                        <button onClick={() => removeIndividualSkill(map.id, skill)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {jobSkillMaps.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  No job skills mapped yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
