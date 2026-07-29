import React, { useState, useEffect, useRef } from "react";
import { Building2, Plus, Trash2, Edit2, Save, X, Phone, Mail, Calendar, User, BookOpen, ArrowLeft, ChevronRight, Search, Upload, Award, Download } from "lucide-react";
import CollegeCollection from "./CollegeCollection";
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
  const [collegeTab, setCollegeTab] = useState<"tutors" | "results" | "collections">("tutors");

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
    try {
      const response = await axios.get(`${API_URL}/api/v1/college-management`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      // The backend uses 'CollegeInstitution' and 'CollegeTutor' names but the structure is the same.
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const saveToStorage = async (data: College[]) => {
    // Legacy function, replaced by direct API calls.
    setColleges(data);
  };

  // --- College Actions ---
  const handleSaveCollege = async () => {
    if (!collegeNameInput.trim()) return alert("College Name is required!");
    
    try {
      if (editingCollegeId) {
        const college = colleges.find(c => c.id === editingCollegeId);
        if (college) {
          await axios.put(`${API_URL}/api/v1/college-management/${editingCollegeId}`, {
            name: collegeNameInput,
            adminEmail: college.adminEmail,
            tutors: college.tutors
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
        }
      } else {
        await axios.post(`${API_URL}/api/v1/college-management`, {
          name: collegeNameInput,
          tutors: []
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      }
      fetchColleges();
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
        await axios.delete(`${API_URL}/api/v1/college-management/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        fetchColleges();
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
          <div className="flex justify-between items-center bg-[#111827] p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => { setSelectedCollegeId(null); resetTutorForm(); setCollegeTab("tutors"); }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Building2 className="w-6 h-6 mr-3 text-emerald-500" />
                  {selectedCollege.name}
                </h2>
                <div className="flex space-x-4 mt-2">
                  <button 
                    onClick={() => setCollegeTab("tutors")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "tutors" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    Instructors
                  </button>
                  <button 
                    onClick={() => setCollegeTab("results")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "results" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    Test Results
                  </button>
                  <button 
                    onClick={() => setCollegeTab("collections")}
                    className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${collegeTab === "collections" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    Student Collections
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="hidden sm:inline">Import CSV</span>
                </button>
                <button 
                  onClick={() => setIsCreatingTutor(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors"
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
            <div className="bg-[#111827] rounded-3xl p-6 border border-slate-800 shadow-xl">
              <CollegeCollection targetCollegeName={selectedCollege.name} targetCollegeEmail={selectedCollege.adminEmail} />
            </div>
          )}

          {collegeTab === "tutors" && isCreatingTutor ? (
            <div className="bg-[#111827] rounded-3xl p-8 border border-slate-800 shadow-xl max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <User className="w-6 h-6 mr-3 text-emerald-500" />
                  {editingTutorId ? "Edit Instructor Details" : "Add New Instructor"}
                </h3>
                <button onClick={resetTutorForm} className="text-slate-500 hover:text-white transition-colors p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-400">Tutor Name *</label>
                  <input 
                    type="text" value={tutorName} onChange={e => setTutorName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-400">Domain / Subject</label>
                  <input 
                    type="text" value={domain} onChange={e => setDomain(e.target.value)}
                    placeholder="e.g. Full Stack MERN"
                    className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-400">Joining Date</label>
                  <input 
                    type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)}
                    className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-400">Phone Number</label>
                  <input 
                    type="tel" value={tutorPhone} onChange={e => setTutorPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label>
                  <input type="email" value={tutorEmail} onChange={e => setTutorEmail(e.target.value)} placeholder="Email" className="w-full bg-[#1a2333] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Section</label>
                  <input type="text" value={tutorSection} onChange={e => setTutorSection(e.target.value)} placeholder="e.g. Section A" className="w-full bg-[#1a2333] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button onClick={resetTutorForm} className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors border border-slate-700">
                  Cancel
                </button>
                <button onClick={handleSaveTutor} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-colors">
                  <Save className="w-5 h-5 mr-2" />
                  Save Instructor
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 relative max-w-2xl">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={tutorSearch} 
                  onChange={e => setTutorSearch(e.target.value)} 
                  placeholder="Search instructors by name, domain, email, phone, or ID..." 
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex flex-col space-y-4">
                {filteredTutors.length === 0 ? (
                  <div className="bg-[#111827] rounded-3xl border border-slate-800 p-16 text-center text-slate-500">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>{tutorSearch ? "No tutors found matching your search." : "No tutors have been dispatched to this college yet."}</p>
                  </div>
                ) : (
                  filteredTutors.map(tutor => (
                    <div key={tutor.id} className="bg-[#111827] rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between shadow-lg relative group transition-all hover:border-emerald-500/30 gap-4">
                      
                      {/* Left section: Icon + Name + Domain + Section */}
                      <div className="flex items-center space-x-4 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                          <User className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center">
                            {tutor.name}
                            {tutor.section && (
                              <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {tutor.section}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-emerald-400 font-bold tracking-wider">{tutor.domain || "No Domain Specified"}</p>
                        </div>
                      </div>

                      {/* Middle section: Details */}
                      <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-8 flex-1 text-sm justify-start lg:justify-center">
                        <div className="flex items-center text-slate-400">
                          <Award className="w-4 h-4 mr-2 text-slate-500" />
                          <span className="font-mono text-emerald-400 font-bold">{tutor.trainerId}</span>
                        </div>
                        <div className="flex items-center text-slate-400">
                          <Phone className="w-4 h-4 mr-2 text-slate-500" />
                          <span className="font-mono">{tutor.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-slate-400">
                          <Mail className="w-4 h-4 mr-2 text-slate-500" />
                          <span className="truncate max-w-[150px]" title={tutor.email || "N/A"}>{tutor.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-slate-400">
                          <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                          <span>{tutor.joiningDate ? new Date(tutor.joiningDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>

                      {/* Right section: Action Buttons */}
                      <div className="flex items-center space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 md:ml-4">
                        <button onClick={() => handleEditTutor(tutor)} className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Edit Instructor">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTutor(tutor.id)} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Delete Instructor">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      ) : (
        /* View: List of Colleges */
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Partner Colleges</h2>
              <p className="text-slate-400">Manage colleges and the tutors dispatched to them.</p>
            </div>
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
              {/* College search bar removed at user request */}
              
              {!isCreatingCollege && (
                <button 
                  onClick={() => setIsCreatingCollege(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add College</span>
                </button>
              )}
            </div>
          </div>

          {isCreatingCollege && (
            <div className="bg-[#111827] rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center space-x-4 max-w-2xl">
              <input 
                type="text" 
                value={collegeNameInput} 
                onChange={e => setCollegeNameInput(e.target.value)}
                placeholder="Enter College Name..."
                className="flex-1 bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <button onClick={() => {setIsCreatingCollege(false); setCollegeNameInput(""); setEditingCollegeId(null);}} className="p-3 text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <button onClick={handleSaveCollege} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-colors">
                Save
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredColleges.length === 0 ? (
              <div className="col-span-full bg-[#111827] rounded-3xl border border-slate-800 p-16 text-center text-slate-500">
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
                <div key={college.id} className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 cursor-pointer" onClick={() => setSelectedCollegeId(college.id)}>
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Building2 className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{college.name}</h3>
                        <p className="text-sm text-slate-500">{college.tutors.length} Tutor{college.tutors.length !== 1 && 's'} Dispatched</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCollegeId(college.id);
                          setCollegeNameInput(college.name);
                          setIsCreatingCollege(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
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
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {matchingTutors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <User className="w-3 h-3 mr-1" /> Matched Tutors
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matchingTutors.map(t => (
                          <span key={t.id} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )})
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CollegeResultsTab({ collegeName }: { collegeName: string }) {
  const [scores, setScores] = useState<any[]>([]);

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

  if (scores.length === 0) {
    return (
      <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-12 text-center text-slate-500">
        <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">No Results Yet</h3>
        <p>Students from this college have not completed any tests yet.</p>
      </div>
    );
  }

  // Group scores by Section Name
  const grouped: Record<string, any[]> = {};
  scores.forEach(s => {
    const sName = s.sectionName || "Global / Unassigned";
    if (!grouped[sName]) grouped[sName] = [];
    grouped[sName].push(s);
  });

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

  const generateAggregatedCSV = (targetScores: any[], filename: string) => {
    if (targetScores.length === 0) return;

    // 1. Group tests chronologically by testName + date
    const testEventsMap = new Map<string, any>();
    targetScores.forEach(s => {
      const key = `${s.testName}_${s.date}`;
      if (!testEventsMap.has(key)) {
        testEventsMap.set(key, { name: s.testName, date: s.date });
      }
    });

    const sortedEvents = Array.from(testEventsMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const eventToColumnMap = new Map<string, string>();
    sortedEvents.forEach((ev, idx) => {
      eventToColumnMap.set(`${ev.name}_${ev.date}`, `Test${idx + 1}`);
    });

    const testColumns = Array.from(new Set(eventToColumnMap.values()));

    // 2. Group by student (using name + email as unique identifier if email is unknown)
    const studentMap: Record<string, any> = {};
    targetScores.forEach(s => {
      const email = s.studentEmail || "unknown";
      const name = s.studentName || "N/A";
      const identifier = email === "unknown" ? `${name}-${email}` : email;
      
      if (!studentMap[identifier]) {
        studentMap[identifier] = {
          name: name,
          email: email,
          regNumber: s.regNumber || "N/A", // User mentioned reg number / roll number
          scores: {}
        };
      }
      
      const key = `${s.testName}_${s.date}`;
      const colName = eventToColumnMap.get(key) as string;
      // Save their score for this test as an integer (just the score) to prevent Excel from converting fractions (e.g. 1/1) into dates (1-Jan)
      studentMap[identifier].scores[colName] = s.score;
    });

    // 3. Build CSV string
    // Headers: Name, Email, Reg Number, Test1, Test2...
    const headers = ["Name", "Email", "Reg Number", ...testColumns];
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

  return (
    <div className="space-y-6">
      
      {/* Master Export Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => generateAggregatedCSV(scores, `${collegeName.replace(/\s+/g, '_')}_All_Test_Records`)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Export All College Records (CSV)</span>
        </button>
      </div>

      {Object.entries(grouped).map(([sectionName, students]) => {
        
        // Group students for UI within this section
        const sectionStudentsMap: Record<string, any> = {};
        students.forEach(s => {
          const email = s.studentEmail || "unknown";
          const name = s.studentName || "N/A";
          const identifier = email === "unknown" ? `${name}-${email}` : email;
          
          if (!sectionStudentsMap[identifier]) {
            sectionStudentsMap[identifier] = {
              name: name,
              email: email,
              regNumber: s.regNumber || "N/A",
              tests: []
            };
          }
          sectionStudentsMap[identifier].tests.push({
            testName: s.testName,
            score: s.score,
            totalQuestions: s.totalQuestions,
            date: s.date
          });
        });
        
        const groupedStudents = Object.values(sectionStudentsMap);

        return (
        <div key={sectionName} className="bg-[#111827] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-emerald-400 flex items-center">
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-sm mr-3 uppercase tracking-widest border border-emerald-500/30">
                Section
              </span>
              {sectionName}
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-500 font-bold bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                {groupedStudents.length} Students
              </span>
              <button 
                onClick={() => handleDeleteSectionResults(sectionName)}
                className="flex items-center space-x-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-rose-500/30"
                title={`Delete all test results for ${sectionName}`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button 
                onClick={() => generateAggregatedCSV(students, `Section_${sectionName.replace(/\s+/g, '_')}_Results`)}
                className="flex items-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-emerald-500/30"
              >
                <Download className="w-4 h-4" />
                <span>Download Section CSV</span>
              </button>
            </div>
          </div>
        </div>
      )})}
    </div>
  );
}
