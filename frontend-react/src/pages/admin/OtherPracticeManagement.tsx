import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Target, ArrowLeft, Save, X, BookOpen, Clock, Upload, Loader2, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type Question = {
  id: number;
  text: string;
  options: string[];
  answer: string;
};

export default function OtherPracticeManagement() {
  const { user } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("30 Mins");
  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now(), text: "", options: ["", "", "", ""], answer: "" }
  ]);
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [isManagingSubjects, setIsManagingSubjects] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const STORAGE_KEY = "admin_other_practice_tests";
  const SUBJECTS_KEY = "admin_subjects_data";

  const fetchTests = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setTests(JSON.parse(data));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTests();
    const storedSubjects = localStorage.getItem(SUBJECTS_KEY);
    if (storedSubjects) {
      try {
        const parsed = JSON.parse(storedSubjects);
        if (Array.isArray(parsed)) {
          setSubjects(parsed.filter(s => typeof s === 'string'));
        } else {
          setSubjects([]);
        }
      } catch (e) {
        setSubjects([]);
      }
    }
  }, []);

  const saveTests = (updatedTests: any[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTests));
    setTests(updatedTests);
  };

  const handleSave = () => {
    if (!title || !subject) return alert("Title and subject are required.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text) return alert(`Question ${i + 1} is missing text!`);
      if (q.options.some(o => !o)) return alert(`Question ${i + 1} has empty options!`);
      if (!q.answer || !q.options.includes(q.answer)) return alert(`Question ${i + 1} needs a correct answer selected!`);
    }

    const newTest = {
      id: "optest_" + Date.now(),
      title,
      subject,
      duration,
      questions,
      createdBy: user?.email,
      creatorName: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Admin",
      createdAt: new Date().toISOString()
    };

    const updated = [...tests, newTest];
    saveTests(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = tests.filter(t => t.id !== id);
    saveTests(updated);
    setDeleteConfirmId(null);
  };

  const resetForm = () => {
    setIsCreating(false);
    setTitle("");
    setSubject("");
    setDuration("30 Mins");
    setQuestions([{ id: Date.now(), text: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleAddQuestion = () =>
    setQuestions(prev => [...prev, { id: Date.now(), text: "", options: ["", "", "", ""], answer: "" }]);

  const handleRemoveQuestion = (id: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: number, index: number, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\\n";
      }

      // Regex-based parsing
      const parsedQuestions: Question[] = [];
      const lines = fullText.split("\\n").map(l => l.trim()).filter(l => l.length > 0);
      
      let currentQuestion: Question | null = null;
      
      const questionRegex = /^\\d+[\\.\\)]\\s*(.+)/;
      const optionRegex = /^[A-D][\\.\\)]\\s*(.+)/i;
      const answerRegex = /^answer[\\s:]*(.+)/i;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        const qMatch = line.match(questionRegex);
        if (qMatch) {
          if (currentQuestion) {
            while (currentQuestion.options.length < 4) currentQuestion.options.push("");
            parsedQuestions.push(currentQuestion);
          }
          currentQuestion = {
            id: Date.now() + Math.floor(Math.random() * 100000),
            text: qMatch[1],
            options: [],
            answer: ""
          };
          continue;
        }

        const oMatch = line.match(optionRegex);
        if (oMatch && currentQuestion && currentQuestion.options.length < 4) {
          currentQuestion.options.push(oMatch[1]);
          continue;
        }

        const aMatch = line.match(answerRegex);
        if (aMatch && currentQuestion) {
          currentQuestion.answer = aMatch[1];
          continue;
        }

        if (currentQuestion) {
           if (currentQuestion.options.length === 0 && !line.toLowerCase().startsWith('answer')) {
               currentQuestion.text += " " + line;
           }
        }
      }

      if (currentQuestion) {
        while (currentQuestion.options.length < 4) currentQuestion.options.push("");
        parsedQuestions.push(currentQuestion);
      }
      
      if (parsedQuestions.length === 0) {
          alert("Could not automatically extract any formatted questions from the PDF. Please make sure the questions follow standard format (1. Question, A) Option, Answer: A).");
          return;
      }
      
      setQuestions(prev => {
        if (prev.length === 1 && !prev[0].text) return parsedQuestions;
        return [...prev, ...parsedQuestions];
      });
      alert(`Successfully extracted ${parsedQuestions.length} questions from PDF!`);
    } catch (error: any) {
      console.error(error);
      alert("Error parsing PDF. " + (error.message || ""));
    } finally {
      setIsParsingPdf(false);
      e.target.value = "";
    }
  };

  const filteredTests = tests.filter(t => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (isManagingSubjects) {
    return (
      <div className="bg-[#111827] rounded-3xl border border-border p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setIsManagingSubjects(false)}
            className="flex items-center gap-2 text-text-muted hover:text-text-inverse transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
          <h2 className="text-2xl font-bold text-text-inverse">Manage Subjects</h2>
          <div className="w-24"></div>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex gap-4">
            <input 
              value={newSubject} onChange={e => setNewSubject(e.target.value)}
              className="flex-1 bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="New Subject Name"
            />
            <button 
              onClick={() => {
                const subjectList = Array.isArray(subjects) ? subjects : [];
                if (newSubject.trim() && !subjectList.includes(newSubject.trim())) {
                  const updated = [...subjectList, newSubject.trim()];
                  setSubjects(updated);
                  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
                  setNewSubject("");
                }
              }}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-md"
            >
              Add
            </button>
          </div>
          <div className="bg-[#0B0F19] rounded-xl border border-border divide-y divide-border overflow-hidden">
            {!(subjects && Array.isArray(subjects)) || subjects.length === 0 ? (
              <div className="p-8 text-center text-text-muted">No subjects added yet.</div>
            ) : (
              subjects.map(s => (
                <div key={s} className="flex justify-between items-center p-4 hover:bg-slate-800/30 transition-colors">
                  <span className="text-text-inverse font-medium">{String(s)}</span>
                  <button 
                    onClick={() => {
                      const updated = subjects.filter(sub => sub !== s);
                      setSubjects(updated);
                      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="bg-[#111827] rounded-3xl border border-border p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <button onClick={resetForm} className="flex items-center gap-2 text-text-muted hover:text-text-inverse transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
          <h2 className="text-2xl font-bold text-text-inverse">Create New Test</h2>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
          >
            <Save className="w-5 h-5" />
            <span>Save Test</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0B0F19] p-6 rounded-2xl border border-border space-y-6">
            <h3 className="text-xl font-bold text-text-inverse">Test Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Test Title</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-xl px-4 py-3 text-text-inverse focus:border-rose-500 transition-colors focus:outline-none"
                  placeholder="e.g. Arrays & Strings Test"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Subject</label>
                <select 
                  value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-xl px-4 py-3 text-text-inverse focus:border-rose-500 transition-colors focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Duration</label>
                <select 
                  value={duration} onChange={e => setDuration(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-xl px-4 py-3 text-text-inverse focus:border-rose-500 transition-colors focus:outline-none"
                >
                  <option>15 Mins</option>
                  <option>30 Mins</option>
                  <option>45 Mins</option>
                  <option>1 Hour</option>
                  <option>2 Hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0F19] p-6 rounded-2xl border border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-inverse">Questions</h3>
                <p className="text-text-muted mt-1">Add questions manually or auto-fill via PDF.</p>
              </div>
              <div className="flex items-center space-x-3">
                <input type="file" accept=".pdf" id="pdf-upload" className="hidden" onChange={handlePdfUpload} disabled={isParsingPdf} />
                <label 
                  htmlFor="pdf-upload"
                  className={`cursor-pointer bg-slate-800 hover:bg-slate-700 text-rose-500 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-2 border ${isParsingPdf ? 'border-rose-500 opacity-70' : 'border-rose-500/30'}`}
                >
                  {isParsingPdf ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</span>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Auto-fill via PDF</span>
                    </>
                  )}
                </label>
                <button 
                  onClick={handleAddQuestion}
                  className="bg-slate-800 hover:bg-slate-700 text-text-inverse font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-2 border border-border"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Question manually</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-5 border border-border bg-[#111827] rounded-xl relative group">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                    {qIndex + 1}
                  </div>
                  {questions.length > 1 && (
                    <button 
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-text-muted mb-2">Question Text</label>
                      <textarea
                        value={q.text}
                        onChange={e => updateQuestion(q.id, "text", e.target.value)}
                        className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse min-h-[80px] focus:outline-none focus:border-rose-500"
                        placeholder="Enter the question..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-3">
                          <input 
                            type="radio" 
                            name={`answer-${q.id}`}
                            checked={q.answer === opt && opt !== ""}
                            onChange={() => opt !== "" && updateQuestion(q.id, "answer", opt)}
                            className="w-5 h-5 text-rose-500 focus:ring-rose-500 cursor-pointer"
                          />
                          <input 
                            type="text"
                            value={opt}
                            onChange={e => updateOption(q.id, oIndex, e.target.value)}
                            className="flex-1 bg-[#0B0F19] border border-border rounded-xl px-4 py-2 text-text-inverse focus:outline-none focus:border-rose-500"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            More Practice Management
          </h2>
          <p className="text-text-secondary mt-1">Manage tests and assessments for the More Practice section.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsManagingSubjects(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-border shadow-sm"
          >
            <BookOpen className="w-5 h-5" />
            <span>Manage Subjects</span>
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
          >
            <Plus className="w-5 h-5" />
            <span>Create Test</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111827] rounded-3xl border border-border p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
            <input 
              type="text"
              placeholder="Search tests by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0F19] border border-border rounded-xl pl-12 pr-4 py-3 text-text-inverse focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#0B0F19] rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Target className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-inverse mb-2">No Tests Found</h3>
              <p className="text-text-secondary">Click "Create Test" to build your first practice test.</p>
            </div>
          ) : (
            filteredTests.map(t => (
              <div key={t.id} className="group relative overflow-hidden bg-[#0B0F19] rounded-2xl border border-border hover:border-border-hover transition-colors p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {t.subject && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                        {t.subject}
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-text-muted text-xs font-bold bg-slate-800 px-2.5 py-0.5 rounded-full border border-border">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-text-muted text-xs font-bold bg-slate-800 px-2.5 py-0.5 rounded-full border border-border">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.questions?.length || 0} Qs</span>
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-text-inverse">{t.title}</h4>
                </div>

                <div className="flex items-center gap-3">
                  {deleteConfirmId === t.id ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(t.id)}
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
                      onClick={() => setDeleteConfirmId(t.id)}
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
