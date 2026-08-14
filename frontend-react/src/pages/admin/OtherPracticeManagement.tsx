import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Target, ArrowLeft, Save, X } from "lucide-react";

export default function OtherPracticeManagement() {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");

  const STORAGE_KEY = "admin_other_practice_data";

  const fetchProblems = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setProblems(JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const saveProblems = (updatedProblems: any[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProblems));
    setProblems(updatedProblems);
  };

  const handleSave = () => {
    if (!title || !description || !topic) return;

    const newProblem = {
      _id: editingProblem?._id || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      difficulty,
      topic,
      company,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
      },
      correctOption
    };

    let updated = [...problems];
    if (editingProblem) {
      updated = updated.map(p => p._id === editingProblem._id ? newProblem : p);
    } else {
      updated.push(newProblem);
    }

    saveProblems(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = problems.filter(p => p._id !== id);
    saveProblems(updated);
    setDeleteConfirmId(null);
  };

  const startEdit = (p: any) => {
    setEditingProblem(p);
    setTitle(p.title || "");
    setDifficulty(p.difficulty || "Easy");
    setDescription(p.description || "");
    setOptionA(p.options?.A || "");
    setOptionB(p.options?.B || "");
    setOptionC(p.options?.C || "");
    setOptionD(p.options?.D || "");
    setCorrectOption(p.correctOption || "A");
    setTopic(p.topic || "");
    setCompany(p.company || "");
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingProblem(null);
    setIsCreating(false);
    setTitle("");
    setDifficulty("Easy");
    setDescription("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setTopic("");
    setCompany("");
  };

  const filteredProblems = problems.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.topic?.toLowerCase().includes(search.toLowerCase())
  );

  if (isCreating) {
    return (
      <div className="bg-[#111827] rounded-3xl border border-border p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={resetForm}
            className="flex items-center gap-2 text-text-muted hover:text-text-inverse transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
          <h2 className="text-2xl font-bold text-text-inverse">
            {editingProblem ? "Edit Practice Question" : "Create Practice Question"}
          </h2>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
          >
            <Save className="w-5 h-5" />
            <span>Save Question</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-text-secondary text-sm font-semibold mb-2">Question Title</label>
              <input 
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="e.g. Basic HTML Tags"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Topic (Category Box)</label>
                <input 
                  value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="e.g. Web Dev"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Difficulty</label>
                <select 
                  value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm font-semibold mb-2">Question Description</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                className="w-full h-32 bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors resize-none"
                placeholder="Enter the question text here..."
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm font-semibold mb-2">Company (Optional)</label>
              <input 
                value={company} onChange={e => setCompany(e.target.value)}
                className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="e.g. Google, Amazon"
              />
            </div>
          </div>

          <div className="space-y-6 bg-[#0a1128] p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-bold text-text-inverse mb-4">Options</h3>
            
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 cursor-pointer transition-colors ${correctOption === opt ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-border text-text-muted hover:border-text-secondary'}`} onClick={() => setCorrectOption(opt)}>
                    {opt}
                  </div>
                  <input 
                    value={opt === 'A' ? optionA : opt === 'B' ? optionB : opt === 'C' ? optionC : optionD}
                    onChange={e => {
                      if (opt === 'A') setOptionA(e.target.value);
                      if (opt === 'B') setOptionB(e.target.value);
                      if (opt === 'C') setOptionC(e.target.value);
                      if (opt === 'D') setOptionD(e.target.value);
                    }}
                    className={`flex-1 bg-[#111827] border ${correctOption === opt ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-border focus:border-rose-500'} rounded-xl px-4 py-2.5 text-text-inverse focus:outline-none transition-colors`}
                    placeholder={`Option ${opt} text`}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-text-muted mt-4">* Click the letter A/B/C/D to mark it as the correct answer.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-inverse flex items-center gap-2">
            <Target className="w-8 h-8 text-rose-500" />
            Other Practice Management
          </h2>
          <p className="text-text-secondary mt-1">Manage custom topics and questions for the Other Practice section.</p>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Question</span>
        </button>
      </div>

      <div className="bg-[#111827] rounded-3xl border border-border p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
            <input 
              type="text"
              placeholder="Search by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a1128] border border-border rounded-xl pl-12 pr-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#0a1128] rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Target className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-inverse mb-2">No Questions Found</h3>
              <p className="text-text-secondary">Click "Add Question" to create your first practice question.</p>
            </div>
          ) : (
            filteredProblems.map(p => (
              <div key={p._id} className="group relative overflow-hidden bg-[#0a1128] rounded-2xl border border-border hover:border-border-hover transition-colors p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider border border-rose-500/20">
                      {p.topic}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-text-inverse">{p.title}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => startEdit(p)}
                    className="p-2 bg-[#111827] text-text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors border border-border"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  {deleteConfirmId === p._id ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-bold border border-red-500/20"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-2 bg-[#111827] text-text-muted hover:text-text-inverse rounded-lg transition-colors border border-border"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeleteConfirmId(p._id)}
                      className="p-2 bg-[#111827] text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-border"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
