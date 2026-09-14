import React, { useState, useEffect, useRef } from "react";
import { Building2, Plus, Trash2, Edit2, Save, X, Phone, Mail, Calendar, User, BookOpen, ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Search, Upload, Award, Download, Layers, ListFilter, FileText, CheckCircle2, XCircle, BarChart2 } from "lucide-react";
import CollegeCollection from "./CollegeCollection";
import CourseCategorySection from "./CourseCategorySection";
import axios from "axios";
import { API_BASE_URL as API_URL } from "../../utils/apiConfig";

type Tutor = {
  id: string;
  name: string;
  phone: string;
  domain: string;
  joiningDate: string;
  email: string;
  section?: string;
  trainerId?: string;
};

type College = {
  id: string;
  name: string;
  tutors: Tutor[];
  adminEmail?: string;
};

export default function CollegeManagement() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [collegeTab, setCollegeTab] = useState<"tutors" | "results" | "collections" | "courseCategories">("tutors");

  // College Form
  const [isCreatingCollege, setIsCreatingCollege] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null);
  const [collegeNameInput, setCollegeNameInput] = useState("");

  // Tutor Form
  const [isCreatingTutor, setIsCreatingTutor] = useState(false);
  const [editingTutorId, setEditingTutorId] = useState<string | null>(null);
  const [tutorName, setTutorName] = useState("");
  const [tutorPhone, setTutorPhone] = useState("");
  const [domain, setDomain] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");
  const [tutorSection, setTutorSection] = useState("");

  const tutorCsvRef = useRef<HTMLInputElement>(null);

  // Search States
  const [collegeSearch, setCollegeSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);
  // API_URL imported from apiConfig

  const fetchColleges = async () => {
    let apiColleges: College[] = [];
    try {
      const response = await axios.get(`${API_URL}/api/v1/college-management`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (Array.isArray(response.data)) {
        apiColleges = response.data;
      }
    } catch (error) {
      console.warn('Backend API fetch failed, loading from local storage:', error);
    }

    const localColleges: College[] = JSON.parse(localStorage.getItem("admin_colleges_v2") || "[]");
    const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");

    const mergedMap = new Map<string, College>();

    // 1. Existing localStorage colleges
    localColleges.forEach(c => {
      if (c && c.id) mergedMap.set(String(c.id), c);
    });

    // 2. Override/enrich with API colleges
    apiColleges.forEach(c => {
      if (c && c.id) {
        const existing = mergedMap.get(String(c.id));
        mergedMap.set(String(c.id), {
          ...existing,
          ...c,
          tutors: c.tutors || existing?.tutors || []
        });
      }
    });

    // 3. Ensure colleges created in CollegeCollection are included
    collections.forEach((colc: any) => {
      if (colc.collegeName) {
        const exists = Array.from(mergedMap.values()).some(
          c => c.name?.toLowerCase() === colc.collegeName?.toLowerCase()
        );
        if (!exists) {
          const newId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          mergedMap.set(newId, {
            id: newId,
            name: colc.collegeName,
            tutors: []
          });
        }
      }
    });

    const mergedList = Array.from(mergedMap.values());
    setColleges(mergedList);
    localStorage.setItem("admin_colleges_v2", JSON.stringify(mergedList));
  };

  const saveToStorage = async (data: College[]) => {
    setColleges(data);
    localStorage.setItem("admin_colleges_v2", JSON.stringify(data));
  };

  // --- College Actions ---
  const handleSaveCollege = async () => {
    if (!collegeNameInput.trim()) return alert("College Name is required!");

    try {
      if (editingCollegeId) {
        const college = colleges.find(c => c.id === editingCollegeId);
        if (college) {
          try {
            await axios.put(`${API_URL}/api/v1/college-management/${editingCollegeId}`, {
              name: collegeNameInput,
              adminEmail: college.adminEmail,
              tutors: college.tutors
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
          } catch (e) {
            console.warn("Backend update failed, saving locally:", e);
          }
          const updated = colleges.map(c => c.id === editingCollegeId ? { ...c, name: collegeNameInput } : c);
          setColleges(updated);
          localStorage.setItem("admin_colleges_v2", JSON.stringify(updated));
        }
      } else {
        let newId = `col_${Date.now()}`;
        try {
          const res = await axios.post(`${API_URL}/api/v1/college-management`, {
            name: collegeNameInput,
            tutors: []
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (res.data && res.data.id) {
            newId = res.data.id;
          }
        } catch (e) {
          console.warn("Backend post failed, saving locally:", e);
        }
        const newCollege: College = { id: newId, name: collegeNameInput, tutors: [] };
        const updated = [...colleges, newCollege];
        setColleges(updated);
        localStorage.setItem("admin_colleges_v2", JSON.stringify(updated));
      }
      await fetchColleges();
      setCollegeNameInput("");
      setIsCreatingCollege(false);
      setEditingCollegeId(null);
    } catch (error) {
      console.error('Error saving college:', error);
      alert('Failed to save college');
    }
  };

  const handleDeleteCollege = async (id: string) => {
    if (window.confirm("Are you sure? This will delete the college and all its tutors.")) {
      try {
        try {
          await axios.delete(`${API_URL}/api/v1/college-management/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
        } catch (e) {
          console.warn("Backend delete failed, deleting locally:", e);
        }
        const updated = colleges.filter(c => c.id !== id);
        setColleges(updated);
        localStorage.setItem("admin_colleges_v2", JSON.stringify(updated));
        await fetchColleges();
        if (selectedCollegeId === id) setSelectedCollegeId(null);
      } catch (error) {
        console.error('Error deleting college:', error);
        alert('Failed to delete college');
      }
    }
  };

  // --- Tutor Actions ---
  const resetTutorForm = () => {
    setTutorName(""); setTutorPhone(""); setTutorEmail("");
    setDomain(""); setJoiningDate("");
    setTutorSection("");
    setIsCreatingTutor(false); setEditingTutorId(null);
  };

  const handleSaveTutor = async () => {
    if (!tutorName.trim()) return alert("Tutor Name is required!");
    if (!tutorEmail.trim()) return alert("Email Address is required!");

    // Ensure email is unique across all tutors in all colleges
    const emailLower = tutorEmail.toLowerCase();
    const isDuplicate = colleges.some(c =>
      c.tutors.some(t => (t.email || "").toLowerCase() === emailLower && t.id !== editingTutorId)
    );

    if (isDuplicate) {
      return alert("This email is already assigned to another tutor! Tutor emails must be unique across all colleges.");
    }

    const college = colleges.find(c => c.id === selectedCollegeId);
    if (!college) return;

    const newTutor: Tutor = {
      id: editingTutorId || "tut-" + Date.now(),
      trainerId: editingTutorId
        ? (college.tutors.find(t => t.id === editingTutorId)?.trainerId || `TRN-${Math.floor(100000 + Math.random() * 900000)}`)
        : `TRN-${Math.floor(100000 + Math.random() * 900000)}`,
      name: tutorName, phone: tutorPhone, email: tutorEmail, domain, joiningDate, section: tutorSection
    };

    let updatedTutors;
    if (editingTutorId) {
      updatedTutors = college.tutors.map(t => t.id === editingTutorId ? newTutor : t);
    } else {
      updatedTutors = [...college.tutors, newTutor];
    }

    try {
      await axios.put(`${API_URL}/api/v1/college-management/${selectedCollegeId}`, {
        name: college.name,
        adminEmail: college.adminEmail,
        tutors: updatedTutors
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      fetchColleges();
      resetTutorForm();
    } catch (error) {
      console.error('Error saving tutor:', error);
      alert('Failed to save tutor');
    }
  };

  const handleEditTutor = (tutor: Tutor) => {
    setEditingTutorId(tutor.id);
    setIsCreatingTutor(true);
    setTutorName(tutor.name);
    setTutorPhone(tutor.phone);
    setTutorEmail(tutor.email);
    setDomain(tutor.domain);
    setJoiningDate(tutor.joiningDate);
    setTutorSection(tutor.section || "");
  };

  const handleDeleteTutor = async (tutorId: string) => {
    if (window.confirm("Delete this tutor?")) {
      const college = colleges.find(c => c.id === selectedCollegeId);
      if (!college) return;

      try {
        await axios.delete(`${API_URL}/api/v1/college-management/${selectedCollegeId}/tutors/${tutorId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        fetchColleges();
      } catch (error: any) {
        console.error('Error deleting tutor:', error);
        alert(`Failed to delete tutor: ${error.response?.data?.details || error.message}`);
      }
    }
  };

  const handleTutorCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          alert("CSV file seems empty or missing data.");
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const nameIdx = headers.indexOf('name');
        const emailIdx = headers.indexOf('email');
        const phoneIdx = headers.indexOf('phone');
        const domainIdx = headers.indexOf('domain');
        const sectionIdx = headers.indexOf('section');

        if (nameIdx === -1 || emailIdx === -1) {
          alert("CSV must contain at least 'name' and 'email' columns.");
          return;
        }

        let duplicatesSkipped = 0;
        const newTutors: Tutor[] = [];

        const allExistingEmails = new Set<string>();
        colleges.forEach(c => c.tutors.forEach(t => {
          if (t.email) allExistingEmails.add(t.email.toLowerCase());
        }));

        lines.slice(1).forEach((line, idx) => {
          const cols = line.split(',').map(c => c.trim());
          const email = cols[emailIdx]?.toLowerCase();

          if (!email || allExistingEmails.has(email)) {
            duplicatesSkipped++;
            return;
          }

          allExistingEmails.add(email);
          newTutors.push({
            id: "csv-tut-" + Date.now() + "-" + idx,
            name: cols[nameIdx] || "Unknown",
            email: cols[emailIdx],
            phone: phoneIdx !== -1 ? cols[phoneIdx] : "",
            domain: domainIdx !== -1 ? cols[domainIdx] : "",
            section: sectionIdx !== -1 ? cols[sectionIdx] : "",
            joiningDate: new Date().toISOString().split('T')[0],
            trainerId: `TRN-${Math.floor(100000 + Math.random() * 900000)}`
          });
        });

        if (newTutors.length > 0) {
          const college = colleges.find(c => c.id === selectedCollegeId);
          if (college) {
            axios.put(`${API_URL}/api/v1/college-management/${selectedCollegeId}`, {
              name: college.name,
              adminEmail: college.adminEmail,
              tutors: [...college.tutors, ...newTutors]
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            }).then(() => {
              fetchColleges();
              let alertMsg = `Successfully imported ${newTutors.length} instructors!`;
              if (duplicatesSkipped > 0) {
                alertMsg += ` Skipped ${duplicatesSkipped} duplicate/invalid emails to maintain uniqueness.`;
              }
              alert(alertMsg);
            }).catch(error => {
              console.error('Error importing tutors:', error);
              alert('Failed to import tutors');
            });
          }
        }
      };
      reader.readAsText(file);
      if (tutorCsvRef.current) tutorCsvRef.current.value = "";
    } else if (file) {
      alert("Please select a valid CSV file.");
    }
  };

  const selectedCollege = colleges.find(c => c.id === selectedCollegeId);

  const searchLower = collegeSearch.toLowerCase();
  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchLower) ||
    c.tutors.some(t => t.name.toLowerCase().includes(searchLower)) ||
    c.tutors.some(t => (t.section || "").toLowerCase().includes(searchLower))
  );

  const filteredTutors = selectedCollege?.tutors.filter(t => {
    const s = tutorSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(s) ||
      (t.section || "").toLowerCase().includes(s) ||
      (t.email || "").toLowerCase().includes(s) ||
      (t.domain || "").toLowerCase().includes(s) ||
      (t.phone || "").toLowerCase().includes(s) ||
      (t.trainerId || "").toLowerCase().includes(s)
    );
  }) || [];

  return (
    <div className="space-y-8">
      {selectedCollege ? (
        <>
          <div className="flex justify-between items-center bg-surface dark:bg-[#111827] p-6 rounded-3xl border border-border shadow-xl">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => { setSelectedCollegeId(null); resetTutorForm(); setCollegeTab("tutors"); }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-text-muted hover:text-text-inverse transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-text-primary flex items-center">
                  <Building2 className="w-6 h-6 mr-3 text-primary" />
                  {selectedCollege.name}
                </h2>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => setCollegeTab("tutors")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "tutors" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-secondary"}`}
                  >
                    Instructors
                  </button>
                  <button
                    onClick={() => setCollegeTab("results")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "results" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-secondary"}`}
                  >
                    Test Results
                  </button>
                  <button
                    onClick={() => setCollegeTab("collections")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "collections" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-secondary"}`}
                  >
                    Student Collections
                  </button>
                  <button
                    onClick={() => setCollegeTab("courseCategories")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "courseCategories" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-secondary"}`}
                  >
                    Course Categories
                  </button>
                </div>
              </div>
            </div>
            {!isCreatingTutor && collegeTab === "tutors" && (
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept=".csv"
                  ref={tutorCsvRef}
                  onChange={handleTutorCsvUpload}
                  className="hidden"
                />
                <button
                  onClick={() => tutorCsvRef.current?.click()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="hidden sm:inline">Import CSV</span>
                </button>
                <button
                  onClick={() => setIsCreatingTutor(true)}
                  className="bg-primary hover:bg-primary text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Instructor</span>
                </button>
              </div>
            )}
          </div>

          {collegeTab === "results" && (
            <CollegeResultsTab collegeName={selectedCollege.name} />
          )}

          {collegeTab === "collections" && (
            <div className="bg-surface dark:bg-[#111827] rounded-3xl p-6 border border-border shadow-xl">
              <CollegeCollection targetCollegeName={selectedCollege.name} targetCollegeEmail={selectedCollege.adminEmail} />
            </div>
          )}

          {collegeTab === "courseCategories" && (
            <div className="bg-surface dark:bg-[#111827] rounded-3xl p-6 border border-border shadow-xl">
              <CourseCategorySection
                collegeName={selectedCollege.name}
                collegeEmail={selectedCollege.adminEmail}
                tutors={selectedCollege.tutors}
              />
            </div>
          )}

          {collegeTab === "tutors" && (isCreatingTutor ? (
            <div className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border shadow-xl max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
                <h3 className="text-xl font-bold text-text-primary flex items-center">
                  <User className="w-6 h-6 mr-3 text-primary" />
                  {editingTutorId ? "Edit Instructor Details" : "Add New Instructor"}
                </h3>
                <button onClick={resetTutorForm} className="text-text-muted hover:text-text-primary transition-colors p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-muted">Tutor Name *</label>
                  <input
                    type="text" value={tutorName} onChange={e => setTutorName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-muted">Domain / Subject</label>
                  <input
                    type="text" value={domain} onChange={e => setDomain(e.target.value)}
                    placeholder="e.g. Full Stack MERN"
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-muted">Joining Date</label>
                  <input
                    type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-muted">Phone Number</label>
                  <input
                    type="tel" value={tutorPhone} onChange={e => setTutorPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted block mb-1">Email Address</label>
                  <input type="email" value={tutorEmail} onChange={e => setTutorEmail(e.target.value)} placeholder="Email" className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted block mb-1">Section</label>
                  <input type="text" value={tutorSection} onChange={e => setTutorSection(e.target.value)} placeholder="e.g. Section A" className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button onClick={resetTutorForm} className="px-6 py-2.5 rounded-xl font-bold text-text-muted hover:text-text-primary transition-colors border border-border">
                  Cancel
                </button>
                <button onClick={handleSaveTutor} className="bg-primary hover:bg-primary text-text-inverse px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-colors">
                  <Save className="w-5 h-5 mr-2" />
                  Save Instructor
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 relative max-w-2xl">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-text-muted" />
                <input
                  type="text"
                  value={tutorSearch}
                  onChange={e => setTutorSearch(e.target.value)}
                  placeholder="Search instructors by name, domain, email, phone, or ID..."
                  className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-12 pr-4 py-3 text-text-primary focus:outline-none focus:border-primary shadow-sm"
                />
              </div>
              <div className="flex flex-col space-y-4">
                {filteredTutors.length === 0 ? (
                  <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border p-16 text-center text-text-muted">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>{tutorSearch ? "No tutors found matching your search." : "No tutors have been dispatched to this college yet."}</p>
                  </div>
                ) : (
                  filteredTutors.map(tutor => (
                    <div key={tutor.id} className="bg-surface dark:bg-[#111827] rounded-2xl p-5 border border-border flex flex-col md:flex-row md:items-center justify-between shadow-lg relative group transition-all hover:border-primary/30 gap-4">

                      {/* Left section: Icon + Name + Domain + Section */}
                      <div className="flex items-center space-x-4 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-text-primary flex items-center">
                            {tutor.name}
                            {tutor.section && (
                              <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {tutor.section}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-primary font-bold tracking-wider">{tutor.domain || "No Domain Specified"}</p>
                        </div>
                      </div>

                      {/* Middle section: Details */}
                      <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-8 flex-1 text-sm justify-start lg:justify-center">
                        <div className="flex items-center text-text-muted">
                          <Award className="w-4 h-4 mr-2 text-text-muted" />
                          <span className="font-mono text-primary font-bold">{tutor.trainerId}</span>
                        </div>
                        <div className="flex items-center text-text-muted">
                          <Phone className="w-4 h-4 mr-2 text-text-muted" />
                          <span className="font-mono">{tutor.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-text-muted">
                          <Mail className="w-4 h-4 mr-2 text-text-muted" />
                          <span className="truncate max-w-[150px]" title={tutor.email || "N/A"}>{tutor.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-text-muted">
                          <Calendar className="w-4 h-4 mr-2 text-text-muted" />
                          <span>{tutor.joiningDate ? new Date(tutor.joiningDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>

                      {/* Right section: Action Buttons */}
                      <div className="flex items-center space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 md:ml-4">
                        <button onClick={() => handleEditTutor(tutor)} className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-text-inverse rounded-lg transition-colors" title="Edit Instructor">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTutor(tutor.id)} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-text-inverse rounded-lg transition-colors" title="Delete Instructor">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ))}
        </>
      ) : (
        /* View: List of Colleges */
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Partner Colleges</h2>
              <p className="text-text-muted">Manage colleges and the tutors dispatched to them.</p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              {/* College search bar removed at user request */}

              {!isCreatingCollege && (
                <button
                  onClick={() => setIsCreatingCollege(true)}
                  className="bg-primary hover:bg-primary text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add College</span>
                </button>
              )}
            </div>
          </div>

          {isCreatingCollege && (
            <div className="bg-surface dark:bg-[#111827] rounded-3xl p-6 border border-border shadow-xl flex items-center space-x-4 max-w-2xl">
              <input
                type="text"
                value={collegeNameInput}
                onChange={e => setCollegeNameInput(e.target.value)}
                placeholder="Enter College Name..."
                className="flex-1 bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary"
                autoFocus
              />
              <button onClick={() => { setIsCreatingCollege(false); setCollegeNameInput(""); setEditingCollegeId(null); }} className="p-3 text-text-muted hover:text-text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
              <button onClick={handleSaveCollege} className="bg-primary hover:bg-primary text-text-inverse px-6 py-3 rounded-xl font-bold shadow-lg transition-colors">
                Save
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredColleges.length === 0 ? (
              <div className="col-span-full bg-surface dark:bg-[#111827] rounded-3xl border border-border p-16 text-center text-text-muted">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{collegeSearch ? "No colleges found matching your search." : "No colleges found. Click \"Add College\" to create your first partner."}</p>
              </div>
            ) : (
              filteredColleges.map(college => {
                const matchingTutors = collegeSearch
                  ? college.tutors.filter(t =>
                    t.name.toLowerCase().includes(searchLower) ||
                    (t.section || "").toLowerCase().includes(searchLower)
                  )
                  : [];

                return (
                  <div key={college.id} className="bg-surface dark:bg-[#111827] rounded-2xl p-5 border border-border shadow-lg flex flex-col justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 cursor-pointer" onClick={() => setSelectedCollegeId(college.id)}>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <Building2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary text-lg group-hover:text-primary transition-colors">{college.name}</h3>
                          <p className="text-sm text-text-muted">{college.tutors.length} Tutor{college.tutors.length !== 1 && 's'} Dispatched</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingCollegeId(college.id);
                            setCollegeNameInput(college.name);
                            setIsCreatingCollege(true);
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit College Name"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college.id)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete College"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedCollegeId(college.id)}
                          className="p-2 text-text-muted hover:text-text-inverse hover:bg-slate-800 rounded-lg transition-colors ml-2"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {matchingTutors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center">
                          <User className="w-3 h-3 mr-1" /> Matched Tutors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchingTutors.map(t => (
                            <span key={t.id} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

type StudentMasterRecord = {
  id: string;
  name: string;
  email: string;
  regNum: string;
  courseName: string;
  sectionName: string;
  dsaAttempted: number;
  dsaCorrect: number;
  dsaWrong: number;
  aptAttempted: number;
  aptCorrect: number;
  aptWrong: number;
};

function CollegeResultsTab({ collegeName }: { collegeName: string }) {
  const [scores, setScores] = useState<any[]>([]);
  const [resultsSubTab, setResultsSubTab] = useState<"categoryWise" | "allRecord">("categoryWise");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStudentStats, setEditingStudentStats] = useState<StudentMasterRecord | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    email: "",
    regNum: "",
    courseName: "B.Tech",
    sectionName: "General Section",
    dsaAttempted: 0,
    dsaCorrect: 0,
    dsaWrong: 0,
    aptAttempted: 0,
    aptCorrect: 0,
    aptWrong: 0,
  });

  useEffect(() => {
    const data = localStorage.getItem("all_student_scores");
    if (data) {
      let allScores = JSON.parse(data);
      let needsSave = false;

      // GENERIC MIGRATION: Fix orphaned scores that were saved before the inheritance fix
      const savedTests = localStorage.getItem("admin_custom_tests");
      const allColleges = JSON.parse(localStorage.getItem("admin_colleges_v2") || "[]");

      if (savedTests) {
        const tests = JSON.parse(savedTests);
        allScores = allScores.map((s: any) => {
          if (s.sectionName === "N/A" || s.collegeName === "Global / Not Selected") {
            const t = tests.find((x: any) => String(x.id) === String(s.testId));
            if (t) {
              if (t.collegeId && t.collegeId !== "all") {
                const found = allColleges.find((c: any) => String(c.id) === String(t.collegeId));
                if (found) {
                  s.collegeName = found.name;
                  needsSave = true;
                }
              }
              if (t.section && t.section !== "all") {
                s.sectionName = t.section;
                needsSave = true;
              }
            }
          }
          return s;
        });
      }

      if (needsSave) {
        localStorage.setItem("all_student_scores", JSON.stringify(allScores));
      }

      // Filter only scores that belong to this college
      const collegeScores = allScores.filter((s: any) => s.collegeName === collegeName);
      setScores(collegeScores);
    }
  }, [collegeName]);

  const [expandedCategories, setExpandedCategories] = useState<{ [catName: string]: boolean }>({});

  const toggleCategoryExpand = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const getTestMetadataMaps = () => {
    const testIdToCategoryMap: Record<string, string> = {};
    const testNameToCategoryMap: Record<string, string> = {};
    const testIdToSectionMap: Record<string, string> = {};
    const testNameToSectionMap: Record<string, string> = {};

    try {
      const customTests = JSON.parse(localStorage.getItem("admin_custom_tests") || "[]");
      customTests.forEach((t: any) => {
        if (t.category && t.category !== "all") {
          if (t.id) testIdToCategoryMap[String(t.id)] = t.category;
          if (t.title) testNameToCategoryMap[t.title] = t.category;
        }
        if (t.section && t.section !== "all") {
          if (t.id) testIdToSectionMap[String(t.id)] = t.section;
          if (t.title) testNameToSectionMap[t.title] = t.section;
        }
      });
    } catch (e) {
      // ignore
    }

    return { testIdToCategoryMap, testNameToCategoryMap, testIdToSectionMap, testNameToSectionMap };
  };

  const resolveScoreMetadata = (
    s: any,
    sectionToCategoryMap: Record<string, string> = {},
    maps?: ReturnType<typeof getTestMetadataMaps>
  ) => {
    const { testIdToCategoryMap, testNameToCategoryMap, testIdToSectionMap, testNameToSectionMap } =
      maps || getTestMetadataMaps();

    let secName = s.sectionName || testIdToSectionMap[String(s.testId)] || testNameToSectionMap[s.testName] || "All Sections";
    if (secName === "N/A" || secName === "all" || secName === "Global / Unassigned" || secName === "Global / Not Selected") {
      secName = "All Sections";
    }

    let catName =
      s.courseCategory ||
      s.courseName ||
      testIdToCategoryMap[String(s.testId)] ||
      testNameToCategoryMap[s.testName] ||
      sectionToCategoryMap[secName];

    if (!catName || catName === "General Course") {
      if (sectionToCategoryMap[secName]) {
        catName = sectionToCategoryMap[secName];
      } else if (!catName) {
        catName = "General Course";
      }
    }

    return { catName, secName };
  };

  const getStudentRegNumberByEmail = (email: string, targetScores?: any[]): string => {
    if (!email || email === "unknown") return "N/A";
    const targetEmail = email.toLowerCase().trim();

    // 1. Check admin_college_collections
    try {
      const collStr = localStorage.getItem("admin_college_collections");
      if (collStr) {
        const collections = JSON.parse(collStr);
        if (Array.isArray(collections)) {
          for (const coll of collections) {
            if (Array.isArray(coll.students)) {
              for (const stu of coll.students) {
                if ((stu.email || "").toLowerCase().trim() === targetEmail) {
                  const reg = stu.regNum || stu.regNumber || stu.regNo || stu.rollNumber || stu.rollNo || stu.registrationNumber;
                  if (reg && reg !== "N/A" && String(reg).trim() !== "") {
                    return String(reg).trim();
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error checking collections for regNum:", e);
    }

    // 2. Check admin_course_categories_* across localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("admin_course_categories_")) {
          const catStr = localStorage.getItem(key);
          if (catStr) {
            const categories = JSON.parse(catStr);
            if (Array.isArray(categories)) {
              for (const cat of categories) {
                if (Array.isArray(cat.students)) {
                  for (const stu of cat.students) {
                    if ((stu.email || "").toLowerCase().trim() === targetEmail) {
                      const reg = stu.regNum || stu.regNumber || stu.regNo || stu.rollNumber || stu.rollNo || stu.registrationNumber;
                      if (reg && reg !== "N/A" && String(reg).trim() !== "") {
                        return String(reg).trim();
                      }
                    }
                  }
                }
                if (Array.isArray(cat.classes)) {
                  for (const cls of cat.classes) {
                    if (Array.isArray(cls.students)) {
                      for (const stu of cls.students) {
                        if ((stu.email || "").toLowerCase().trim() === targetEmail) {
                          const reg = stu.regNum || stu.regNumber || stu.regNo || stu.rollNumber || stu.rollNo || stu.registrationNumber;
                          if (reg && reg !== "N/A" && String(reg).trim() !== "") {
                            return String(reg).trim();
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error checking categories for regNum:", e);
    }

    // 3. Check scores list for any existing reg number
    try {
      const allScoresStr = localStorage.getItem("all_student_scores");
      const scoresList = allScoresStr ? JSON.parse(allScoresStr) : (targetScores || []);
      if (Array.isArray(scoresList)) {
        for (const sc of scoresList) {
          if ((sc.studentEmail || "").toLowerCase().trim() === targetEmail) {
            const reg = sc.regNum || sc.regNumber || sc.regNo || sc.rollNumber || sc.rollNo || sc.registrationNumber;
            if (reg && reg !== "N/A" && String(reg).trim() !== "") {
              return String(reg).trim();
            }
          }
        }
      }
    } catch (e) {
      console.error("Error checking scores for regNum:", e);
    }

    return "N/A";
  };

  // Build categories and sections tree
  const buildCategoryTree = () => {
    const savedCategoriesStr = localStorage.getItem(`admin_course_categories_${collegeName}`);
    let courseCategories: any[] = [];
    if (savedCategoriesStr) {
      try {
        courseCategories = JSON.parse(savedCategoriesStr);
      } catch (e) {
        courseCategories = [];
      }
    }

    const sectionToCategoryMap: Record<string, string> = {};
    const tree: Record<string, Record<string, any[]>> = {};

    // First, initialize tree with all known course categories and their assigned classes/sections
    courseCategories.forEach((cat: any) => {
      const cName = cat.courseName || "General";
      if (!tree[cName]) {
        tree[cName] = {};
      }
      if (Array.isArray(cat.classes) && cat.classes.length > 0) {
        cat.classes.forEach((cls: any) => {
          if (cls.className) {
            sectionToCategoryMap[cls.className] = cName;
            if (!tree[cName][cls.className]) {
              tree[cName][cls.className] = [];
            }
          }
        });
      } else {
        if (!tree[cName]["General Section (Default)"]) {
          tree[cName]["General Section (Default)"] = [];
        }
      }
    });

    const maps = getTestMetadataMaps();

    // Next, assign all scores into the tree
    scores.forEach((s) => {
      const { catName, secName } = resolveScoreMetadata(s, sectionToCategoryMap, maps);

      if (!tree[catName]) {
        tree[catName] = {};
      }
      if (!tree[catName][secName]) {
        tree[catName][secName] = [];
      }
      tree[catName][secName].push(s);
    });

    return tree;
  };

  const categoryTree = buildCategoryTree();

  const handleDeleteSectionResults = (sectionName: string) => {
    if (window.confirm(`Are you sure you want to delete ALL test results for Section ${sectionName}? This action cannot be undone.`)) {
      const data = localStorage.getItem("all_student_scores");
      if (data) {
        const allScores = JSON.parse(data);
        const newScores = allScores.filter((s: any) => !(s.collegeName === collegeName && (s.sectionName || "Global / Unassigned") === sectionName));
        localStorage.setItem("all_student_scores", JSON.stringify(newScores));
        setScores(newScores.filter((s: any) => s.collegeName === collegeName));
      }
    }
  };

  const handleDeleteCategoryResults = (categoryName: string, sectionsMap: Record<string, any[]>) => {
    const sectionNames = Object.keys(sectionsMap);
    if (window.confirm(`Are you sure you want to delete ALL test results for Course Category "${categoryName}"? This action cannot be undone.`)) {
      const data = localStorage.getItem("all_student_scores");
      if (data) {
        const allScores = JSON.parse(data);
        const maps = getTestMetadataMaps();
        const newScores = allScores.filter((s: any) => {
          if (s.collegeName !== collegeName) return true;
          const { catName, secName } = resolveScoreMetadata(s, {}, maps);
          if (catName === categoryName) return false;
          if (sectionNames.includes(secName)) return false;
          return true;
        });
        localStorage.setItem("all_student_scores", JSON.stringify(newScores));
        setScores(newScores.filter((s: any) => s.collegeName === collegeName));
      }
    }
  };

  const handleDeleteSingleResult = (target: any) => {
    if (window.confirm(`Are you sure you want to delete the test result "${target.testName}" for ${target.studentName || target.studentEmail}? This will allow them to re-attempt the test.`)) {
      const data = localStorage.getItem("all_student_scores");
      if (data) {
        const allScores = JSON.parse(data);
        const newScores = allScores.filter((s: any) => !(
          s.collegeName === target.collegeName &&
          s.testName === target.testName &&
          (s.studentEmail === target.studentEmail || s.studentName === target.studentName) &&
          s.date === target.date
        ));
        localStorage.setItem("all_student_scores", JSON.stringify(newScores));
        setScores(newScores.filter((s: any) => s.collegeName === collegeName));

        // Also remove local browser attempt key (testResult_*) if any, so student can re-attempt on this browser
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("testResult_") && (key.includes(`_${target.testId}`) || !target.testId)) {
            if (
              !target.studentEmail ||
              target.studentEmail === "Unknown" ||
              key.toLowerCase().includes(target.studentEmail.toLowerCase()) ||
              key.includes("_guest_")
            ) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    }
  };

  const generateAggregatedCSV = (targetScores: any[], filename: string) => {
    if (targetScores.length === 0) return;

    // 1. Group tests chronologically by testName + date
    const testEventsMap = new Map<string, any>();
    const maps = getTestMetadataMaps();
    targetScores.forEach(s => {
      const key = `${s.testName}_${s.date}`;
      if (!testEventsMap.has(key)) {
        const { catName } = resolveScoreMetadata(s, {}, maps);
        const name = s.testName || "Untitled Test";
        testEventsMap.set(key, { name, date: s.date || "N/A", course: catName });
      }
    });

    const sortedEvents = Array.from(testEventsMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const eventToColumnMap = new Map<string, string>();
    sortedEvents.forEach((ev) => {
      const prefix = ev.course && !ev.name.toLowerCase().includes(ev.course.toLowerCase()) && ev.course !== "General Course" ? `${ev.course} - ` : "";
      const colTitle = `${prefix}${ev.name} (${ev.date})`;
      eventToColumnMap.set(`${ev.name}_${ev.date}`, colTitle);
    });

    const testColumns = Array.from(new Set(eventToColumnMap.values()));

    // 2. Group by student (using name + email as unique identifier if email is unknown)
    const studentMap: Record<string, any> = {};
    targetScores.forEach(s => {
      const email = s.studentEmail || "unknown";
      const name = s.studentName || "N/A";
      const identifier = email === "unknown" ? `${name}-${email}` : email;

      if (!studentMap[identifier]) {
        const sReg = s.regNumber || s.regNum || s.regNo || s.rollNumber || s.rollNo;
        const fetchedReg = getStudentRegNumberByEmail(email, targetScores);
        const bestReg = (sReg && sReg !== "N/A" && String(sReg).trim() !== "") ? String(sReg).trim() : fetchedReg;
        studentMap[identifier] = {
          name: name,
          email: email,
          regNumber: bestReg || "N/A",
          scores: {}
        };
      } else if (!studentMap[identifier].regNumber || studentMap[identifier].regNumber === "N/A") {
        const sReg = s.regNumber || s.regNum || s.regNo || s.rollNumber || s.rollNo;
        const fetchedReg = getStudentRegNumberByEmail(email, targetScores);
        const bestReg = (sReg && sReg !== "N/A" && String(sReg).trim() !== "") ? String(sReg).trim() : fetchedReg;
        if (bestReg && bestReg !== "N/A") {
          studentMap[identifier].regNumber = bestReg;
        }
      }

      const key = `${s.testName}_${s.date}`;
      const colName = eventToColumnMap.get(key) as string;
      // Save their score for this test as an integer (just the score) to prevent Excel from converting fractions (e.g. 1/1) into dates (1-Jan)
      studentMap[identifier].scores[colName] = s.score;
    });

    // 3. Build CSV string
    // Headers: Name, Email, Reg Number, and each test column with Course Name, Test Name, and Date in the first row
    const headers = ["Name", "Email", "Reg Number", ...testColumns].map(
      h => `"${String(h).replace(/"/g, '""')}"`
    );
    const rows = [headers.join(",")];

    Object.values(studentMap).forEach(student => {
      const row = [
        `"${student.name}"`,
        `"${student.email}"`,
        `"${student.regNumber}"`
      ];
      // Add score for each test column
      testColumns.forEach(test => {
        row.push(`"${student.scores[test] !== undefined ? student.scores[test] : 0}"`);
      });
      rows.push(row.join(","));
    });

    // 4. Trigger download
    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buildMasterStudentList = (): StudentMasterRecord[] => {
    const studentMap: Record<string, StudentMasterRecord> = {};
    const savedCategoriesStr = localStorage.getItem(`admin_course_categories_${collegeName}`);
    let courseCategories: any[] = [];
    if (savedCategoriesStr) {
      try {
        courseCategories = JSON.parse(savedCategoriesStr);
      } catch (e) {
        courseCategories = [];
      }
    }

    let customStats: Record<string, any> = {};
    try {
      const statsStr = localStorage.getItem(`college_student_stats_${collegeName}`);
      if (statsStr) customStats = JSON.parse(statsStr);
    } catch (e) {
      customStats = {};
    }

    // 1. Gather all students added to this college in Course Categories & Sections
    courseCategories.forEach((cat: any) => {
      const cName = cat.courseName || "General Course";
      if (Array.isArray(cat.classes)) {
        cat.classes.forEach((cls: any) => {
          const sName = cls.className || "General Section";
          if (Array.isArray(cls.students)) {
            cls.students.forEach((stu: any) => {
              const key = (stu.email || stu.name || "").toLowerCase();
              if (key && !studentMap[key]) {
                const sReg = stu.regNum || stu.regNumber || stu.regNo || stu.rollNumber || stu.rollNo;
                const reg = (sReg && sReg !== "N/A" && String(sReg).trim() !== "") ? String(sReg).trim() : getStudentRegNumberByEmail(stu.email, scores);
                studentMap[key] = {
                  id: stu.id || key,
                  name: stu.name || "Unnamed Student",
                  email: stu.email || "unknown",
                  regNum: reg || "N/A",
                  courseName: cName,
                  sectionName: sName,
                  dsaAttempted: 0,
                  dsaCorrect: 0,
                  dsaWrong: 0,
                  aptAttempted: 0,
                  aptCorrect: 0,
                  aptWrong: 0,
                };
              }
            });
          }
        });
      }
    });

    // 2. Gather from scores and count DSA & Aptitude solved automatically
    const maps = getTestMetadataMaps();
    scores.forEach((s: any) => {
      const key = (s.studentEmail || s.studentName || "").toLowerCase();
      if (key) {
        const { catName, secName } = resolveScoreMetadata(s, {}, maps);
        if (!studentMap[key]) {
          const sReg = s.regNumber || s.regNum || s.regNo || s.rollNumber || s.rollNo;
          const reg = (sReg && sReg !== "N/A" && String(sReg).trim() !== "") ? String(sReg).trim() : getStudentRegNumberByEmail(s.studentEmail, scores);
          studentMap[key] = {
            id: key,
            name: s.studentName || "Unnamed Student",
            email: s.studentEmail || "unknown",
            regNum: reg || "N/A",
            courseName: catName,
            sectionName: secName,
            dsaAttempted: 0,
            dsaCorrect: 0,
            dsaWrong: 0,
            aptAttempted: 0,
            aptCorrect: 0,
            aptWrong: 0,
          };
        } else if (!studentMap[key].regNum || studentMap[key].regNum === "N/A") {
          const sReg = s.regNumber || s.regNum || s.regNo || s.rollNumber || s.rollNo;
          const reg = (sReg && sReg !== "N/A" && String(sReg).trim() !== "") ? String(sReg).trim() : getStudentRegNumberByEmail(s.studentEmail, scores);
          if (reg && reg !== "N/A") {
            studentMap[key].regNum = reg;
          }
        }
        const isAptitude = /aptitude|quant|logical|reasoning|math|verbal/i.test(
          (s.testName || "") + " " + (s.courseCategory || catName || "")
        );
        const totalQ = Number(s.totalQuestions || 10);
        const corr = Number(s.score || 0);
        const wrg = Math.max(0, totalQ - corr);

        if (isAptitude) {
          studentMap[key].aptAttempted += totalQ;
          studentMap[key].aptCorrect += corr;
          studentMap[key].aptWrong += wrg;
        } else {
          studentMap[key].dsaAttempted += totalQ;
          studentMap[key].dsaCorrect += corr;
          studentMap[key].dsaWrong += wrg;
        }
      }
    });

    // 3. Apply custom/edited stats from localStorage
    Object.values(studentMap).forEach((rec) => {
      const key = rec.email.toLowerCase();
      if (customStats[key]) {
        rec.dsaAttempted = Number(customStats[key].dsaAttempted ?? rec.dsaAttempted);
        rec.dsaCorrect = Number(customStats[key].dsaCorrect ?? rec.dsaCorrect);
        rec.dsaWrong = Number(customStats[key].dsaWrong ?? rec.dsaWrong);
        rec.aptAttempted = Number(customStats[key].aptAttempted ?? rec.aptAttempted);
        rec.aptCorrect = Number(customStats[key].aptCorrect ?? rec.aptCorrect);
        rec.aptWrong = Number(customStats[key].aptWrong ?? rec.aptWrong);
      }
    });

    return Object.values(studentMap);
  };

  const masterStudentList = buildMasterStudentList();
  const filteredMasterStudents = masterStudentList.filter((s) => {
    const q = searchQuery.toLowerCase();
    const name = (s.name || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const reg = (s.regNum || "").toLowerCase();
    const course = (s.courseName || "").toLowerCase();
    const sec = (s.sectionName || "").toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      reg.includes(q) ||
      course.includes(q) ||
      sec.includes(q)
    );
  });

  const handleSaveStudentStats = (updated: StudentMasterRecord) => {
    let customStats: Record<string, any> = {};
    try {
      const statsStr = localStorage.getItem(`college_student_stats_${collegeName}`);
      if (statsStr) customStats = JSON.parse(statsStr);
    } catch (e) {
      customStats = {};
    }
    customStats[updated.email.toLowerCase()] = {
      dsaAttempted: Number(updated.dsaAttempted),
      dsaCorrect: Number(updated.dsaCorrect),
      dsaWrong: Number(updated.dsaWrong),
      aptAttempted: Number(updated.aptAttempted),
      aptCorrect: Number(updated.aptCorrect),
      aptWrong: Number(updated.aptWrong),
    };
    localStorage.setItem(`college_student_stats_${collegeName}`, JSON.stringify(customStats));
    setEditingStudentStats(null);
    setStatsVersion((v) => v + 1);
  };

  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.email.trim()) return;

    const savedCategoriesStr = localStorage.getItem(`admin_course_categories_${collegeName}`);
    let courseCategories: any[] = [];
    if (savedCategoriesStr) {
      try {
        courseCategories = JSON.parse(savedCategoriesStr);
      } catch (e) {
        courseCategories = [];
      }
    }

    let catIndex = courseCategories.findIndex(
      (c: any) => c.courseName?.toLowerCase() === newStudentForm.courseName.trim().toLowerCase()
    );
    if (catIndex === -1) {
      courseCategories.push({
        id: "cat-" + Date.now(),
        courseName: newStudentForm.courseName.trim(),
        classes: [],
      });
      catIndex = courseCategories.length - 1;
    }

    let clsIndex = (courseCategories[catIndex].classes || []).findIndex(
      (cls: any) => cls.className?.toLowerCase() === newStudentForm.sectionName.trim().toLowerCase()
    );
    if (clsIndex === -1) {
      if (!Array.isArray(courseCategories[catIndex].classes)) {
        courseCategories[catIndex].classes = [];
      }
      courseCategories[catIndex].classes.push({
        id: "cls-" + Date.now(),
        categoryId: courseCategories[catIndex].id,
        className: newStudentForm.sectionName.trim(),
        students: [],
      });
      clsIndex = courseCategories[catIndex].classes.length - 1;
    }

    if (!Array.isArray(courseCategories[catIndex].classes[clsIndex].students)) {
      courseCategories[catIndex].classes[clsIndex].students = [];
    }

    const newStu = {
      id: "stu-" + Date.now(),
      name: newStudentForm.name.trim(),
      email: newStudentForm.email.trim(),
      regNum: newStudentForm.regNum.trim() || "N/A",
      classId: courseCategories[catIndex].classes[clsIndex].id,
    };
    courseCategories[catIndex].classes[clsIndex].students.push(newStu);
    localStorage.setItem(`admin_course_categories_${collegeName}`, JSON.stringify(courseCategories));

    let customStats: Record<string, any> = {};
    try {
      const statsStr = localStorage.getItem(`college_student_stats_${collegeName}`);
      if (statsStr) customStats = JSON.parse(statsStr);
    } catch (e) {
      customStats = {};
    }
    customStats[newStudentForm.email.toLowerCase()] = {
      dsaAttempted: Number(newStudentForm.dsaAttempted),
      dsaCorrect: Number(newStudentForm.dsaCorrect),
      dsaWrong: Number(newStudentForm.dsaWrong),
      aptAttempted: Number(newStudentForm.aptAttempted),
      aptCorrect: Number(newStudentForm.aptCorrect),
      aptWrong: Number(newStudentForm.aptWrong),
    };
    localStorage.setItem(`college_student_stats_${collegeName}`, JSON.stringify(customStats));

    setIsAddStudentModalOpen(false);
    setNewStudentForm({
      name: "",
      email: "",
      regNum: "",
      courseName: "B.Tech",
      sectionName: "General Section",
      dsaAttempted: 0,
      dsaCorrect: 0,
      dsaWrong: 0,
      aptAttempted: 0,
      aptCorrect: 0,
      aptWrong: 0,
    });
    setStatsVersion((v) => v + 1);
  };

  const generateAllStudentRecordsCSV = (studentList: StudentMasterRecord[]) => {
    if (studentList.length === 0) return;
    const headers = [
      "Student Name",
      "Reg Number",
      "Email",
      "Course Category",
      "Section",
      "DSA Attempted",
      "DSA Correct",
      "DSA Wrong",
      "Aptitude Attempted",
      "Aptitude Correct",
      "Aptitude Wrong",
    ];
    const rows = studentList.map((s) => [
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.regNum || "").replace(/"/g, '""')}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"${(s.courseName || "").replace(/"/g, '""')}"`,
      `"${(s.sectionName || "").replace(/"/g, '""')}"`,
      s.dsaAttempted,
      s.dsaCorrect,
      s.dsaWrong,
      s.aptAttempted,
      s.aptCorrect,
      s.aptWrong,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${collegeName.replace(/\s+/g, "_")}_All_Student_Records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Test Results Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface dark:bg-[#111827] p-4 rounded-2xl border border-border shadow-lg">
        {/* Sub-tabs: Category Wise & All Record */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setResultsSubTab("categoryWise")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${resultsSubTab === "categoryWise"
                ? "bg-purple-600 text-text-primary shadow-md shadow-purple-600/30"
                : "bg-slate-800/80 hover:bg-slate-800 text-text-secondary hover:text-text-inverse"
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Category Wise</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-black/30 font-semibold">
              {Object.keys(categoryTree).length}
            </span>
          </button>

          <button
            onClick={() => setResultsSubTab("allRecord")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${resultsSubTab === "allRecord"
                ? "bg-purple-600 text-text-primary shadow-md shadow-purple-600/30"
                : "bg-slate-800/80 hover:bg-slate-800 text-text-secondary hover:text-text-inverse"
              }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>All Record</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-black/30 font-semibold">
              {scores.length}
            </span>
          </button>
        </div>

        {/* Master Export Button */}
        {scores.length > 0 && (
          <button
            onClick={() => generateAggregatedCSV(scores, `${collegeName.replace(/\s+/g, '_')}_All_Test_Records`)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-text-inverse px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Export All College Records (CSV)</span>
          </button>
        )}
      </div>

      {resultsSubTab === "categoryWise" ? (
        /* Category Wise View */
        <div className="space-y-6">
          {Object.entries(categoryTree).length === 0 ? (
            <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border p-12 text-center text-text-muted">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-text-muted mb-2">No Course Categories Found</h3>
              <p>Create Course Categories and Sections first, or assign tests to students.</p>
            </div>
          ) : (
            Object.entries(categoryTree).map(([categoryName, sectionsMap]) => {
              const allCategoryScores = Object.values(sectionsMap).flat();
              const uniqueCategoryStudents = new Set(allCategoryScores.map((s) => s.studentEmail || s.studentName));
              const isExpanded = expandedCategories[categoryName] === true; // Minimized by default

              return (
                <div key={categoryName} className="bg-surface dark:bg-[#111827] rounded-3xl border border-border shadow-xl overflow-hidden transition-all">
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategoryExpand(categoryName)}
                    className="bg-slate-800/60 hover:bg-slate-800/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer border-b border-border/80 transition-all select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-text-secondary">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                      <h3 className="text-xl font-bold text-primary flex items-center">
                        <span className="bg-primary/20 text-blue-300 px-3 py-1 rounded-lg text-sm mr-3 uppercase tracking-widest border border-primary/30">
                          Course Category
                        </span>
                        {categoryName}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <span className="text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 text-sm">
                        {uniqueCategoryStudents.size} Students
                      </span>
                      <span className="text-purple-400 font-bold bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 text-sm">
                        {allCategoryScores.length} Records
                      </span>
                      <span className="text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 text-sm">
                        {Object.keys(sectionsMap).length} Sections
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateAggregatedCSV(allCategoryScores, `Course_${categoryName.replace(/\s+/g, "_")}_All_Results`);
                        }}
                        disabled={allCategoryScores.length === 0}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md ${allCategoryScores.length > 0
                            ? "bg-primary hover:bg-primary text-text-inverse shadow-blue-600/20"
                            : "bg-slate-800 text-text-muted cursor-not-allowed border border-border"
                          }`}
                        title="Download CSV for this entire Course Category"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Category CSV</span>
                      </button>
                      {allCategoryScores.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategoryResults(categoryName, sectionsMap);
                          }}
                          className="flex items-center space-x-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 px-3 py-2 rounded-xl text-sm font-bold transition-colors border border-rose-500/30"
                          title={`Delete all test results for ${categoryName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Assigned Sections List when Expanded */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-950/40 space-y-4">
                      {Object.keys(sectionsMap).length === 0 ? (
                        <div className="p-6 text-center text-text-muted text-sm">
                          No sections assigned to this category yet.
                        </div>
                      ) : (
                        Object.entries(sectionsMap)
                          .sort(([aName], [bName]) => {
                            const isAAll = /^all sections|all|general section|n\/a/i.test(aName);
                            const isBAll = /^all sections|all|general section|n\/a/i.test(bName);
                            if (isAAll && !isBAll) return -1;
                            if (!isAAll && isBAll) return 1;
                            return aName.localeCompare(bName);
                          })
                          .map(([sectionName, sectionScores]) => {
                            const uniqueSectionStudents = new Set(sectionScores.map((s) => s.studentEmail || s.studentName));

                            return (
                              <div
                                key={sectionName}
                                className="bg-slate-900/80 border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/30 transition-all"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                    <Layers className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs uppercase tracking-wider font-bold bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                                        Assigned Section
                                      </span>
                                      <h4 className="text-lg font-bold text-text-primary">{sectionName}</h4>
                                    </div>
                                    <p className="text-xs text-text-muted mt-1 font-medium">
                                      {uniqueSectionStudents.size} Students â€¢ {sectionScores.length} Test Records
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() =>
                                      generateAggregatedCSV(
                                        sectionScores,
                                        `${categoryName.replace(/\s+/g, "_")}_Section_${sectionName.replace(/\s+/g, "_")}_Results`
                                      )
                                    }
                                    disabled={sectionScores.length === 0}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md ${sectionScores.length > 0
                                        ? "bg-primary hover:bg-primary text-text-inverse shadow-blue-600/20"
                                        : "bg-slate-800 text-text-muted cursor-not-allowed border border-border"
                                      }`}
                                    title="Download CSV for this assigned section"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download Section CSV</span>
                                  </button>

                                  {sectionScores.length > 0 && (
                                    <button
                                      onClick={() => handleDeleteSectionResults(sectionName)}
                                      className="flex items-center space-x-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 p-2.5 rounded-xl text-sm font-bold transition-colors border border-rose-500/20"
                                      title={`Delete all test results for ${sectionName}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : masterStudentList.length === 0 ? (
        <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border shadow-xl overflow-hidden p-12 text-center text-text-muted">
          <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-text-muted mb-2">No Student Records Found</h3>
          <p className="mb-6">Students added in Course Categories or who complete tests will appear here with their DSA & Aptitude solved stats.</p>
          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary text-text-inverse font-bold rounded-xl transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Student Record</span>
          </button>
        </div>
      ) : (
        /* All Record View */
        <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border shadow-xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-text-primary flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-400" />
                All College Student Records ({masterStudentList.length})
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Track DSA and Aptitude question solving stats for every student added to {collegeName}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search student, reg no, email, course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary text-text-inverse font-bold rounded-xl text-sm transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student Record</span>
              </button>
              {masterStudentList.length > 0 && (
                <button
                  onClick={() => generateAllStudentRecordsCSV(filteredMasterStudents)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-text-primary font-bold rounded-xl text-sm transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Records (CSV)</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                  <th className="pb-3 pr-4 font-bold">Student Name</th>
                  <th className="pb-3 px-4 font-bold">Reg Number</th>
                  <th className="pb-3 px-4 font-bold">Email</th>
                  <th className="pb-3 px-4 font-bold">Course & Section</th>
                  <th className="pb-3 px-4 font-bold">DSA Solved</th>
                  <th className="pb-3 px-4 font-bold">Aptitude Solved</th>
                  <th className="pb-3 pl-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredMasterStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pr-4 font-bold text-text-primary">{s.name || "N/A"}</td>
                    <td className="py-4 px-4 text-text-secondary font-mono">{s.regNum || "N/A"}</td>
                    <td className="py-4 px-4 text-text-muted">{s.email || "unknown"}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary font-semibold">{s.courseName}</div>
                      <div className="text-xs text-text-muted">{s.sectionName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 bg-slate-800 text-text-secondary rounded text-xs font-semibold">
                          Att: {s.dsaAttempted}
                        </span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-bold">
                          âœ“ {s.dsaCorrect}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-bold">
                          âœ— {s.dsaWrong}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 bg-slate-800 text-text-secondary rounded text-xs font-semibold">
                          Att: {s.aptAttempted}
                        </span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-bold">
                          âœ“ {s.aptCorrect}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-bold">
                          âœ— {s.aptWrong}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => setEditingStudentStats({ ...s })}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-xs font-semibold border border-border transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        <span>Edit Stats</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Stats Modal */}
      {editingStudentStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface dark:bg-[#111827] border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Edit Question Records - <span className="text-purple-400">{editingStudentStats.name}</span>
              </h3>
              <button
                onClick={() => setEditingStudentStats(null)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-primary mb-2">DSA Questions Solved</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Attempted</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudentStats.dsaAttempted}
                      onChange={(e) =>
                        setEditingStudentStats({
                          ...editingStudentStats,
                          dsaAttempted: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Correct</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudentStats.dsaCorrect}
                      onChange={(e) =>
                        setEditingStudentStats({
                          ...editingStudentStats,
                          dsaCorrect: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Wrong</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudentStats.dsaWrong}
                      onChange={(e) =>
                        setEditingStudentStats({
                          ...editingStudentStats,
                          dsaWrong: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-purple-400 mb-2">Aptitude Questions Solved</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Attempted</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudentStats.aptAttempted}
                      onChange={(e) =>
                        setEditingStudentStats({
                          ...editingStudentStats,
                          aptAttempted: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Correct</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudentStats.aptCorrect}
                      onChange={(e) =>
                        setEditingStudentStats({
                          ...editingStudentStats,
                          aptCorrect: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Wrong</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudentStats.aptWrong}
                      onChange={(e) =>
                        setEditingStudentStats({
                          ...editingStudentStats,
                          aptWrong: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditingStudentStats(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-text-secondary rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveStudentStats(editingStudentStats)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-text-primary rounded-xl text-sm font-bold shadow-lg"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddNewStudent}
            className="bg-surface dark:bg-[#111827] border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary" />
                Add Student & Solved Record
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Reg Number</label>
                <input
                  type="text"
                  placeholder="e.g. REG-10492"
                  value={newStudentForm.regNum}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, regNum: e.target.value })}
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-muted block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Course Category</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech / MCA"
                  value={newStudentForm.courseName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, courseName: e.target.value })}
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Section</label>
                <input
                  type="text"
                  placeholder="e.g. Section A"
                  value={newStudentForm.sectionName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, sectionName: e.target.value })}
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-primary mb-2">DSA Questions Solved</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Attempted</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentForm.dsaAttempted}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, dsaAttempted: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Correct</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentForm.dsaCorrect}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, dsaCorrect: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Wrong</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentForm.dsaWrong}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, dsaWrong: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-purple-400 mb-2">Aptitude Questions Solved</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Attempted</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentForm.aptAttempted}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, aptAttempted: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Correct</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentForm.aptCorrect}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, aptCorrect: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Wrong</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentForm.aptWrong}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, aptWrong: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-text-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-text-secondary rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary text-text-inverse rounded-xl text-sm font-bold shadow-lg"
              >
                Save Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
