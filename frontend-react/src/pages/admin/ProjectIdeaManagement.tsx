import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, Plus, Pencil, Trash2, X, AlertCircle, Save, Loader2, Link
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiConfig';

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: string;
  techStack: string[];
}

export default function ProjectIdeaManagement() {
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [techStackInput, setTechStackInput] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching project ideas:', err);
      setError('Failed to fetch project ideas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDomain('');
    setDifficulty('Beginner');
    setTechStackInput('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (project: ProjectIdea) => {
    setTitle(project.title);
    setDescription(project.description);
    setDomain(project.domain);
    setDifficulty(project.difficulty);
    setTechStackInput(project.techStack.join(', '));
    setEditingId(project.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project idea?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project idea:', err);
      alert('Failed to delete project idea.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !domain) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const techStackArray = techStackInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const payload = {
        title,
        description,
        domain,
        difficulty,
        techStack: techStackArray
      };

      if (editingId) {
        const res = await axios.put(`${API_BASE_URL}/api/v1/projects/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(prev => prev.map(p => p.id === editingId ? res.data : p));
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/v1/projects`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects([res.data, ...projects]);
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving project idea:', err);
      alert('Failed to save project idea.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface dark:bg-slate-800 p-6 rounded-2xl border border-border dark:border-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Project Ideas Management</h2>
            <p className="text-text-muted mt-1">Manage project ideas that users see on their dashboard.</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Project Idea
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-surface dark:bg-slate-800 rounded-2xl border border-dashed border-border text-text-muted">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No project ideas found.</p>
            <p className="text-sm mt-1">Click "Add Project Idea" to create one.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="p-6 bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-border flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-md uppercase tracking-wider">
                      {project.domain}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                      project.difficulty === 'Beginner' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      project.difficulty === 'Intermediate' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                      'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{project.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-text-secondary text-sm mt-3 line-clamp-3 flex-1">{project.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-text-secondary text-xs rounded-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-border dark:border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-border shrink-0">
              <h3 className="text-xl font-bold text-text-primary">
                {editingId ? 'Edit Project Idea' : 'Add Project Idea'}
              </h3>
              <button onClick={resetForm} className="p-2 text-text-muted hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Project Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., E-commerce Dashboard"
                  className="w-full px-4 py-3 bg-background border border-border dark:border-slate-700 rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Domain / Category</label>
                <input
                  required
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., Full Stack, AI/ML, Frontend"
                  className="w-full px-4 py-3 bg-background border border-border dark:border-slate-700 rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border dark:border-slate-700 rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="w-full px-4 py-3 bg-background border border-border dark:border-slate-700 rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Description</label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project goals, features, and learning outcomes..."
                  className="w-full px-4 py-3 bg-background border border-border dark:border-slate-700 rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-none"
                />
              </div>
            </form>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border dark:border-border shrink-0 bg-surface/50 dark:bg-slate-900/50 rounded-b-2xl">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 text-text-secondary font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
