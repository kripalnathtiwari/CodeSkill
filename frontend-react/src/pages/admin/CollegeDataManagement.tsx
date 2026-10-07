import React, { useState, useEffect, useRef } from 'react';
import { Building2, Upload, Search, Trash2, Plus, Users, Download, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type CollegeData = {
  id: string;
  collegeName: string;
  domain: string; // e.g. "lpu.in"
  students: { name: string; email: string; regNum?: string; phone?: string }[];
};

export default function CollegeDataManagement() {
  const { user } = useAuth();
  const [collegeDataList, setCollegeDataList] = useState<CollegeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create mode
  const [isCreating, setIsCreating] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  
  // CSV Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [uploadPromptId, setUploadPromptId] = useState<string | null>(null);
  const [csvDomainInput, setCsvDomainInput] = useState("");

  // Student View & Manual Add
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingStudentTo, setAddingStudentTo] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ name: "", emailPrefix: "", emailDomain: "", regNum: "", phone: "" });

  useEffect(() => {
    const saved = localStorage.getItem("admin_college_data");
    if (saved) {
      setCollegeDataList(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (data: CollegeData[]) => {
    setCollegeDataList(data);
    localStorage.setItem("admin_college_data", JSON.stringify(data));
  };

  const handleCreateCollege = () => {
    const finalDomain = user?.role === "COLLEGE_ADMIN" && user?.email 
      ? user.email.split('@')[1] 
      : newDomain;

    if (!newCollegeName || !finalDomain) return alert("College name and domain are required");
    const domainClean = finalDomain.trim().toLowerCase().replace(/^@/, "");
    
    const newEntry: CollegeData = {
      id: "cd_" + Date.now(),
      collegeName: newCollegeName,
      domain: domainClean,
      students: []
    };
    
    saveToStorage([...collegeDataList, newEntry]);
    setIsCreating(false);
    setNewCollegeName("");
    setNewDomain("");
  };

  const handleDeleteCollege = (id: string) => {
    if (window.confirm("Are you sure you want to delete this college and all its student data?")) {
      saveToStorage(collegeDataList.filter(c => c.id !== id));
    }
  };

  const triggerUpload = (id: string) => {
    if (!csvDomainInput.trim()) {
      return alert("Please enter the expected domain for the students in this CSV first.");
    }
    setUploadTargetId(id);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;

    const targetCollege = collegeDataList.find(c => c.id === uploadTargetId);
    if (!targetCollege) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert("File is empty or missing data rows. Ensure it has Name,Email,RegNum,Phone");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadTargetId(null);
        return;
      }

      const parsed: {name: string; email: string; regNum?: string; phone?: string}[] = [];
      let invalidCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 2 && cols[1]) {
          const email = cols[1];
          const studentDomain = email.split('@')[1];
          if (studentDomain && studentDomain.toLowerCase() === csvDomainInput.toLowerCase()) {
            parsed.push({
              name: cols[0] || "Unknown",
              email: email,
              regNum: cols[2],
              phone: cols[3]
            });
          } else {
            invalidCount++;
          }
        }
      }

      if (invalidCount > 0) {
        alert(`Found ${invalidCount} students with an invalid email domain. They were skipped. Only @${csvDomainInput} is allowed as you specified.`);
      }

      if (parsed.length > 0) {
        const updated = collegeDataList.map(c => {
          if (c.id === uploadTargetId) {
            // Check for duplicates by email
            const existingEmails = new Set(c.students.map(s => s.email.toLowerCase()));
            const newStudents = parsed.filter(p => !existingEmails.has(p.email.toLowerCase()));
            return { ...c, students: [...c.students, ...newStudents] };
          }
          return c;
        });
        saveToStorage(updated);
        alert(`Successfully added ${parsed.length} new students.`);
      } else if (invalidCount === 0) {
        alert("No valid student data found in the CSV.");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadTargetId(null);
      setUploadPromptId(null);
      setCsvDomainInput("");
    };
    reader.readAsText(file);
  };

  const handleAddManualStudent = (collegeId: string, domain: string) => {
    if (!newStudent.name || !newStudent.emailPrefix || !newStudent.emailDomain) {
      return alert("Name, Email Prefix, and Domain are required");
    }

    const fullEmail = `${newStudent.emailPrefix}@${newStudent.emailDomain}`.toLowerCase();

    const updated = collegeDataList.map(c => {
      if (c.id === collegeId) {
        // Check duplicate
        if (c.students.some(s => s.email.toLowerCase() === fullEmail)) {
          alert("Student with this email already exists");
          return c;
        }
        return {
          ...c,
          students: [...c.students, { 
            name: newStudent.name, 
            email: fullEmail, 
            regNum: newStudent.regNum, 
            phone: newStudent.phone 
          }]
        };
      }
      return c;
    });
    
    saveToStorage(updated);
    setNewStudent({ name: "", emailPrefix: "", emailDomain: "", regNum: "", phone: "" });
    setAddingStudentTo(null);
  };

  const handleDeleteStudent = (collegeId: string, email: string) => {
    if (window.confirm("Remove this student?")) {
      const updated = collegeDataList.map(c => {
        if (c.id === collegeId) {
          return { ...c, students: c.students.filter(s => s.email !== email) };
        }
        return c;
      });
      saveToStorage(updated);
    }
  };

  let userColleges = collegeDataList;
  if (user?.role === "COLLEGE_ADMIN" && user.email) {
    const userDomain = user.email.split('@')[1]?.toLowerCase();
    userColleges = collegeDataList.filter(c => c.domain === userDomain);
  }

  const filteredData = userColleges.filter(c => 
    (c.collegeName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.domain || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">College Data</h2>
          <p className="text-text-muted">Upload and manage student data securely by college domain.</p>
        </div>
        {!isCreating && (user?.role === "ADMIN" || (user?.role === "COLLEGE_ADMIN" && filteredData.length === 0)) && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{user?.role === "COLLEGE_ADMIN" ? "Initialize My College" : "Add College"}</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-surface dark:bg-[#111827] p-6 rounded-2xl border border-border shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-text-primary">Add New College Data Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">College Name *</label>
              <input 
                type="text" 
                value={newCollegeName} 
                onChange={e => setNewCollegeName(e.target.value)}
                placeholder="e.g. Lovely Professional University"
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Email Domain *</label>
              <input 
                type="text" 
                value={user?.role === "COLLEGE_ADMIN" && user?.email ? user.email.split('@')[1] : newDomain} 
                onChange={e => setNewDomain(e.target.value)}
                disabled={user?.role === "COLLEGE_ADMIN"}
                placeholder="e.g. lpu.in"
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex space-x-3 justify-end">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-text-muted hover:text-text-primary font-semibold">Cancel</button>
            <button onClick={handleCreateCollege} className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-xl font-bold">Save College</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by college name or domain..."
          className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {filteredData.length === 0 && !isCreating ? (
        <div className="bg-surface dark:bg-[#111827] p-12 text-center rounded-2xl border border-border">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
          <p className="text-text-muted font-medium mb-4">No college data entries found.</p>
          {user?.role === "COLLEGE_ADMIN" && (
             <button 
               onClick={() => setIsCreating(true)}
               className="bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center space-x-2 transition-colors"
             >
               <Plus className="w-5 h-5" />
               <span>Initialize My College</span>
             </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(college => (
            <div key={college.id} className="bg-surface dark:bg-[#111827] rounded-2xl border border-border p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">{college.collegeName}</h3>
                  <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                    @{college.domain}
                  </span>
                </div>
                {user?.role === "ADMIN" && (
                  <button onClick={() => handleDeleteCollege(college.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-text-muted mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">{college.students.length} Students Uploaded</span>
              </div>

              <div className="mt-auto pt-4 border-t border-border flex flex-col space-y-3">
                {uploadPromptId === college.id ? (
                  <div className="bg-background dark:bg-[#0B0F19] p-3 rounded-xl border border-border flex flex-col space-y-2">
                    <label className="text-xs font-bold text-text-muted">Expected Domain for CSV Students *</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="e.g. gmail.com" 
                        value={csvDomainInput} 
                        onChange={e => setCsvDomainInput(e.target.value)}
                        className="flex-1 bg-surface dark:bg-[#111827] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" 
                      />
                      <button 
                        onClick={() => triggerUpload(college.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        Browse
                      </button>
                    </div>
                    <button onClick={() => { setUploadPromptId(null); setCsvDomainInput(""); }} className="text-xs text-text-muted hover:text-text-primary text-left mt-1">Cancel</button>
                  </div>
                ) : (
                  <div className="flex space-x-3 w-full">
                    <button 
                      onClick={() => setUploadPromptId(college.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-xl font-bold transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload CSV</span>
                    </button>
                    <button 
                      onClick={() => setExpandedId(expandedId === college.id ? null : college.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-slate-800 text-text-primary hover:bg-slate-700 rounded-xl font-bold transition-colors text-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>{expandedId === college.id ? "Hide Students" : "View Students"}</span>
                    </button>
                  </div>
                )}
              </div>

              {expandedId === college.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="max-h-60 overflow-y-auto pr-2 mb-4 space-y-2">
                    {college.students.length === 0 ? (
                       <p className="text-sm text-text-muted text-center py-4">No students added yet.</p>
                    ) : (
                       college.students.map((student, idx) => (
                         <div key={idx} className="bg-background dark:bg-[#0B0F19] p-3 rounded-lg flex justify-between items-center border border-border">
                           <div>
                             <p className="text-sm font-bold text-text-primary">{student.name}</p>
                             <p className="text-xs text-text-muted">{student.email}</p>
                           </div>
                           <button onClick={() => handleDeleteStudent(college.id, student.email)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-md">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       ))
                    )}
                  </div>
                  
                  {addingStudentTo === college.id ? (
                    <div className="bg-background dark:bg-[#0B0F19] p-3 rounded-xl border border-border space-y-3">
                      <input type="text" placeholder="Student Name *" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full bg-surface dark:bg-[#111827] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                      
                      <div className="flex items-center space-x-2">
                        <input type="text" placeholder="Email Prefix *" value={newStudent.emailPrefix} onChange={e => setNewStudent({...newStudent, emailPrefix: e.target.value})} className="flex-1 bg-surface dark:bg-[#111827] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                        <span className="text-text-muted font-bold">@</span>
                        <input type="text" placeholder={`Domain (e.g. gmail.com) *`} value={newStudent.emailDomain} onChange={e => setNewStudent({...newStudent, emailDomain: e.target.value})} className="flex-1 bg-surface dark:bg-[#111827] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Reg Num" value={newStudent.regNum} onChange={e => setNewStudent({...newStudent, regNum: e.target.value})} className="w-full bg-surface dark:bg-[#111827] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                        <input type="text" placeholder="Phone" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="w-full bg-surface dark:bg-[#111827] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                      </div>
                      <div className="flex space-x-2 pt-1">
                        <button onClick={() => setAddingStudentTo(null)} className="flex-1 py-1.5 text-xs font-bold text-text-muted hover:text-text-primary border border-border rounded-lg">Cancel</button>
                        <button onClick={() => handleAddManualStudent(college.id, college.domain)} className="flex-1 py-1.5 text-xs font-bold bg-primary hover:bg-primary text-white rounded-lg">Save</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingStudentTo(college.id)} className="w-full py-2 border border-dashed border-primary text-primary hover:bg-primary/5 rounded-xl text-sm font-bold transition-colors">
                      + Add Student Manually
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
