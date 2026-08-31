import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL as API_URL } from "../../utils/apiConfig";
import {
  Plus, Edit, Trash2, Search, BrainCircuit, X, Save, ArrowLeft, AlertTriangle, Upload, FileJson, FileText, Lock, Loader2
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function AptitudeManagement() {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk Review State
  const [isReviewingBulk, setIsReviewingBulk] = useState(false);
  const [pendingBulkQuestions, setPendingBulkQuestions] = useState<any[]>([]);

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("");
  // API_URL imported from apiConfig

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/aptitude-problems?limit=50`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const dataToMap = response.data.data || response.data;
      const parsedProblems = dataToMap.map((p: any) => {
        let opts = p.options;
        try {
          while (typeof opts === 'string') {
            const parsed = JSON.parse(opts);
            if (parsed === opts || typeof parsed !== 'string' && typeof parsed !== 'object') break;
            opts = parsed;
          }
        } catch(e) {}
        
        return {
          ...p,
          _id: p.id,
          options: opts,
          correctOption: p.correctAnswer || p.correctOption
        };
      });
      setProblems(parsedProblems);
    } catch (error) {
      console.error('Error fetching aptitude problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text).map((p: any) => ({
          ...p,
          _id: "aptitude-" + Date.now() + Math.random().toString(36).substr(2, 9),
          type: "MCQ",
          correctOption: ""
        }));
        
        setPendingBulkQuestions(parsed);
        setIsReviewingBulk(true);
        setShowUploadModal(false);
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const text = await file.text();
        // Basic CSV Parsing for demo purposes
        const lines = text.split('\n').filter(l => l.trim() !== "");
        const parsed: any[] = [];
        // Skip header if it exists
        const startIdx = lines[0].toLowerCase().includes("title") ? 1 : 0;
        for (let i = startIdx; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 8) {
            parsed.push({
              _id: "aptitude-" + Date.now() + Math.random().toString(36).substr(2, 9),
              title: cols[0],
              difficulty: cols[1],
              description: cols[2],
              options: {
                A: cols[3],
                B: cols[4],
                C: cols[5],
                D: cols[6]
              },
              correctOption: "",
              company: cols[8] || "",
              type: "MCQ"
            });
          }
        }
        setPendingBulkQuestions(parsed);
        setIsReviewingBulk(true);
        setShowUploadModal(false);
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        if (!apiKey) {
          alert("Please provide a Gemini API Key to parse PDF files into structured questions.");
          setIsUploading(false);
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        const prompt = `Extract multiple choice aptitude/reasoning questions from the following text and format them as a JSON array. 
        Each object must have exactly these fields: {title, difficulty (Easy/Medium/Hard), description (string), options: {A, B, C, D}, correctOption (A/B/C/D), company (string, if mentioned, else empty string)}. 
        Here is the text:\n\n${fullText.substring(0, 15000)}`;
        
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        
        const textResponse = response.data.candidates[0].content.parts[0].text;
        const cleaned = textResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned).map((p: any) => ({
          ...p,
          _id: "aptitude-pdf-" + Date.now() + Math.random().toString(36).substr(2, 9),
          type: "MCQ",
          correctOption: ""
        }));
        
        setPendingBulkQuestions(parsed);
        setIsReviewingBulk(true);
        setShowUploadModal(false);
      } else {
        alert("Unsupported file format. Please upload a JSON, CSV, or PDF file.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error processing file. " + (e.message || ""));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const resetForm = () => {
    setTitle(""); 
    setDifficulty("Easy"); 
    setDescription("");
    setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
    setCorrectOption("A");
    setCompany("");
    setTopic("");
  };

  const openCreate = (defaultTopic: string | React.MouseEvent = "") => {
    resetForm();
    if (typeof defaultTopic === "string" && defaultTopic && defaultTopic !== "Uncategorized") {
      setTopic(defaultTopic);
    }
  };

  const handleOpenEditProblem = async (prob: any) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/aptitude-problems/${prob._id || prob.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const fullProb = response.data;
      
      let opts = fullProb.options;
      try {
        while (typeof opts === 'string') {
          const parsed = JSON.parse(opts);
          if (parsed === opts || typeof parsed !== 'string' && typeof parsed !== 'object') break;
          opts = parsed;
        }
      } catch(e) {}

      setEditingProblem({ ...fullProb, _id: fullProb.id, options: opts, correctOption: fullProb.correctAnswer });
      setTitle(fullProb.title || "");
      setDifficulty(fullProb.difficulty || "Easy");
      setDescription(fullProb.description || "");
      
      if (Array.isArray(opts)) {
        setOptionA(opts[0] || "");
        setOptionB(opts[1] || "");
        setOptionC(opts[2] || "");
        setOptionD(opts[3] || "");
      } else if (opts) {
        setOptionA(opts.A || opts[0] || "");
        setOptionB(opts.B || opts[1] || "");
        setOptionC(opts.C || opts[2] || "");
        setOptionD(opts.D || opts[3] || "");
      }

      setCorrectOption(fullProb.correctAnswer || fullProb.correctOption || "A");
      setCompany(fullProb.company || "");
      setTopic(fullProb.topic || "");
      setIsCreating(true);
    } catch (err) {
      console.error("Failed to fetch problem details for editing", err);
    }
  };



  const handleSave = async () => {
    if (!title || !description || !optionA || !optionB || !optionC || !optionD) {
      return alert("All fields are required!");
    }

    const payload = {
      title, 
      topic,
      difficulty, 
      description,
      options: JSON.stringify({
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD
      }),
      correctAnswer: correctOption, // backend expects correctAnswer
      company,
    };

    try {
      if (editingProblem) {
        await axios.put(`${API_URL}/api/v1/aptitude-problems/${editingProblem._id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      } else {
        await axios.post(`${API_URL}/api/v1/aptitude-problems`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      }
      
      fetchProblems();
      setIsCreating(false);
      setEditingProblem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('Failed to save aptitude problem');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProblem(null);
    resetForm();
  };

  const filtered = problems.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  const groupedByTopic = filtered.reduce((acc: any, problem: any) => {
    const t = problem.topic?.trim() || "Uncategorized";
    if (!acc[t]) acc[t] = [];
    acc[t].push(problem);
    return acc;
  }, {});

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await axios.delete(`${API_URL}/api/v1/aptitude-problems/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      fetchProblems();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete aptitude problem');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSaveBulk = async () => {
    const missingOption = pendingBulkQuestions.find(q => !q.correctOption);
    if (missingOption) {
      return alert("Please select a correct answer for all questions before saving.");
    }
    
    try {
      // Create all sequentially or in parallel
      await Promise.all(pendingBulkQuestions.map(q => 
        axios.post(`${API_URL}/api/v1/aptitude-problems`, {
          title: q.title, 
          topic: q.topic || "General Aptitude",
          difficulty: q.difficulty, 
          description: q.description,
          options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
          correctAnswer: q.correctOption,
          company: q.company || ""
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ));

      fetchProblems();
      setPendingBulkQuestions([]);
      setIsReviewingBulk(false);
      alert(`Successfully saved ${pendingBulkQuestions.length} questions!`);
    } catch (error) {
      console.error('Error saving bulk questions:', error);
      alert('Failed to save some or all questions.');
    }
  };

  // â”€â”€â”€ Bulk Review View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isReviewingBulk) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-inverse">Review Uploaded Questions</h2>
            <p className="text-text-muted text-sm">Please verify the extracted questions and select the correct option for each.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => { setIsReviewingBulk(false); setPendingBulkQuestions([]); }} className="px-5 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-inverse border border-border transition-colors">
              Discard Upload
            </button>
            <button onClick={handleSaveBulk} className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20">
              <Save className="w-4 h-4" />
              <span>Save All Questions</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {pendingBulkQuestions.map((q, idx) => (
            <div key={q._id} className="bg-[#111827] rounded-3xl p-6 border border-border shadow-xl space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-text-inverse text-lg leading-tight">Q{idx + 1}. {q.title}</h3>
                <span className={`text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${
                  q.difficulty === "Easy" ? "bg-primary/10 text-primary" :
                  q.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                  "bg-rose-500/10 text-rose-500"
                }`}>
                  {q.difficulty}
                </span>
              </div>
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{q.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div 
                    key={opt} 
                    className={`p-4 border-2 rounded-xl flex items-center space-x-3 cursor-pointer transition-all ${
                      q.correctOption === opt 
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-[#0B0F19] border-border hover:border-slate-500 hover:bg-slate-800'
                    }`} 
                    onClick={() => {
                      const newQs = [...pendingBulkQuestions];
                      newQs[idx].correctOption = opt;
                      setPendingBulkQuestions(newQs);
                    }}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      q.correctOption === opt ? 'border-primary' : 'border-slate-500'
                    }`}>
                      {q.correctOption === opt && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <span className={`font-bold ${q.correctOption === opt ? 'text-primary' : 'text-text-muted'}`}>{opt}.</span>
                    <span className="text-sm text-text-secondary">{q.options?.[opt]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // â”€â”€â”€ Editor / Create View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isCreating) {
    const isEditMode = !!editingProblem;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancel} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-text-muted hover:text-text-inverse transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-text-inverse">
                {isEditMode ? "Edit Aptitude Question" : "Add New Aptitude Question"}
              </h2>
              <p className="text-text-muted text-sm">
                {isEditMode ? "Update the question details and save." : "Fill in the fields to create a new question."}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-inverse border border-border hover:border-slate-500 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-colors">
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Question"}</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-[#111827] rounded-3xl p-8 border border-border shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Question Title *</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary"
                placeholder="e.g. Percentage Problem 1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Difficulty</label>
              <select
                value={difficulty} onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Topic</label>
              <input
                type="text" value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary"
                placeholder="e.g. Percentages, Algebra"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Company (Optional)</label>
              <input
                type="text" value={company} onChange={e => setCompany(e.target.value)}
                className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary"
                placeholder="e.g. TCS, Infosys"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">Question Description *</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary text-sm resize-none"
              placeholder="Write the full question statement..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Option A</label>
                <input
                  type="text" value={optionA} onChange={e => setOptionA(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-inverse focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. 15%"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Option B</label>
                <input
                  type="text" value={optionB} onChange={e => setOptionB(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-inverse focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. 20%"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Option C</label>
                <input
                  type="text" value={optionC} onChange={e => setOptionC(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-inverse focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. 25%"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Option D</label>
                <input
                  type="text" value={optionD} onChange={e => setOptionD(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-inverse focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. 30%"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-bold text-text-muted mb-2">Correct Option</label>
              <select
                value={correctOption} onChange={e => setCorrectOption(e.target.value)}
                className="w-full md:w-64 bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€â”€ List View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-inverse mb-1">Aptitude Questions</h2>
          <p className="text-text-muted">Manage multiple-choice aptitude and reasoning questions.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to clear all aptitude problems? This is dangerous!")) {
                try {
                  // The API doesn't have a clear all endpoint, so we have to delete one by one or create a new endpoint.
                  alert("Clear all via frontend is disabled for safety. Please delete individually.");
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Questions</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Topic / Question</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center bg-[#111827] border border-border rounded-2xl p-4 shadow-xl">
        <div className="relative w-80">
          <input
            type="text" placeholder="Search questions..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a2333] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-inverse focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
        </div>
        <span className="text-sm font-medium text-text-muted">Total: {filtered.length} questions</span>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading questions...</div>
        ) : Object.keys(groupedByTopic).length === 0 ? (
          <div className="p-12 text-center text-text-muted bg-[#111827] border border-border rounded-2xl">
            No aptitude questions found.
          </div>
        ) : (
          Object.keys(groupedByTopic).sort().map(topicName => (
            <div key={topicName} className="bg-[#111827] border border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-border flex justify-between items-center bg-slate-900/80">
                <h3 className="text-xl font-bold text-text-inverse flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  {topicName}
                  <span className="text-xs bg-slate-800 text-text-muted px-2 py-1 rounded-full font-medium ml-2">
                    {groupedByTopic[topicName].length} {groupedByTopic[topicName].length === 1 ? 'question' : 'questions'}
                  </span>
                </h3>
                <button
                  onClick={() => openCreate(topicName)}
                  className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-500 text-text-inverse px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-secondary">
                  <thead className="bg-[#1a2333] text-text-muted uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Answer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {groupedByTopic[topicName].map((problem: any, idx: number) => (
                      <tr key={problem._id || `fallback-key-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-text-inverse">
                          <span className="line-clamp-1">{problem.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            problem.difficulty === "Easy" ? "bg-primary/10 text-primary" :
                            problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-500"
                          }`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {problem.company ? (
                            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-text-secondary font-medium">
                              {problem.company}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
                            Option {problem.correctOption}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenEditProblem(problem)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Edit Question"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(problem._id)}
                              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-slate-900 border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button onClick={() => setDeleteConfirmId(null)} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-inverse hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-inverse">Delete Question?</h3>
                <p className="mt-1 text-sm text-text-muted">This action is <span className="text-rose-400 font-semibold">permanent</span>. The question will be removed immediately.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border text-text-secondary hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-text-inverse flex items-center space-x-2 shadow-lg shadow-rose-500/20 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete Question</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setShowUploadModal(false)} />
          <div className="relative bg-[#111827] border border-border rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <button onClick={() => setShowUploadModal(false)} disabled={isUploading} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-inverse transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-text-inverse mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Questions
            </h3>
            <p className="text-sm text-text-muted mb-6">Import questions via JSON, CSV, or let AI parse a PDF file.</p>
            
            <div className="space-y-4">
              <div className="bg-[#1a2333] p-4 rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                    <FileJson className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-inverse">JSON / CSV Upload</h4>
                    <p className="text-xs text-text-muted mt-1 mb-3">Upload a properly formatted JSON or CSV file to instantly add questions.</p>
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-text-inverse transition-colors">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Select JSON or CSV
                      <input type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2333] p-4 rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-text-inverse flex items-center justify-between">
                      AI PDF Parsing
                      <span className="text-[10px] uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">Powered by Gemini</span>
                    </h4>
                    <p className="text-xs text-text-muted mt-1 mb-3">Upload a PDF assignment or test paper. AI will automatically extract multiple choice questions.</p>
                    
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-text-muted mb-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Gemini API Key
                      </label>
                      <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-[#0B0F19] border border-border rounded-lg px-3 py-2 text-sm text-text-inverse focus:outline-none focus:border-primary"
                        disabled={isUploading}
                      />
                    </div>

                    <label className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-text-inverse transition-colors ${apiKey ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Parse PDF File
                      <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => apiKey && handleFileUpload(e)} disabled={!apiKey || isUploading} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
