import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Upload, Trash2, Edit2, Save, X, Search, FileText, Users, Building2, ChevronDown, ChevronUp, Download } from "lucide-react";

type StudentData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  regNum: string;
};

type Collection = {
  id: string;
  collegeEmail: string;
  collegeName?: string;
  category: string;
  uploadedAt: string;
  students: StudentData[];
};

export default function CollegeCollection({ targetCollegeName, targetCollegeEmail }: { targetCollegeName?: string, targetCollegeEmail?: string }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);

  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingManually, setIsAddingManually] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [adminCollegeEmailInput, setAdminCollegeEmailInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Student Entry State
  const [isAddingStudentTo, setIsAddingStudentTo] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", regNum: "", phone: "" });

  useEffect(() => {
    const saved = localStorage.getItem("admin_college_collections");
    if (saved) {
      setCollections(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (data: Collection[]) => {
    localStorage.setItem("admin_college_collections", JSON.stringify(data));
    setCollections(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processFile = () => {
    if (!categoryInput.trim()) {
      alert("Please provide a category for this collection (e.g., B.Tech, MCA).");
      return;
    }
    if (!selectedFile) {
      alert("Please select a CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("CSV file seems empty or missing data.");
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/["']/g, ''));
      // Expected headers: name, email, phone, regNum
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mob'));
      const regIdx = headers.findIndex(h => h.includes('reg') || h.includes('roll'));

      if (nameIdx === -1 || emailIdx === -1) {
        alert("CSV must contain at least 'Name' and 'Email' columns.");
        return;
      }

      const newStudents: StudentData[] = [];

      lines.slice(1).forEach((line, idx) => {
        // Handle basic CSV parsing (ignoring commas inside quotes for MVP)
        const cols = line.split(',').map(c => c.trim().replace(/["']/g, ''));
        if (cols[emailIdx]) {
          newStudents.push({
            id: `stu-${Date.now()}-${idx}`,
            name: cols[nameIdx] || "Unknown",
            email: cols[emailIdx],
            phone: phoneIdx !== -1 ? cols[phoneIdx] : "N/A",
            regNum: regIdx !== -1 ? cols[regIdx] : "N/A"
          });
        }
      });

      if (newStudents.length > 0) {
        // Check if category already exists for this college, if so update it, else create new
        const existingIdx = collections.findIndex(c => c.category.toLowerCase() === categoryInput.toLowerCase() && c.collegeEmail === user?.email);

        let updatedCollections = [...collections];
        if (existingIdx >= 0) {
          if (window.confirm(`A collection for category "${categoryInput}" already exists. Do you want to OVERWRITE it with this new file?`)) {
            updatedCollections[existingIdx].students = newStudents;
            updatedCollections[existingIdx].uploadedAt = new Date().toISOString();
            if (targetCollegeName) updatedCollections[existingIdx].collegeName = targetCollegeName;
          } else {
            return;
          }
        } else {
          updatedCollections.push({
            id: `colc-${Date.now()}`,
            collegeEmail: user?.email || "unknown@college.com",
            collegeName: targetCollegeName || (user as any)?.name || "Unknown College",
            category: categoryInput.trim(),
            uploadedAt: new Date().toISOString(),
            students: newStudents
          });
        }
        saveToStorage(updatedCollections);
        alert(`Successfully imported ${newStudents.length} students into category: ${categoryInput}!`);
        setIsUploading(false);
        setCategoryInput("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert("No valid student records found in the CSV.");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleCreateManualCollection = () => {
    if (!categoryInput.trim()) {
      return alert("Please provide a category for this collection.");
    }
    const targetEmail = user?.role === "ADMIN" ? (adminCollegeEmailInput.trim() || user?.email) : user?.email;
    if (!targetEmail) return alert("College Email is required.");

    const newCollection: Collection = {
      id: `colc-manual-${Date.now()}`,
      collegeEmail: targetEmail,
      collegeName: targetCollegeName || "Unknown College",
      category: categoryInput.trim(),
      uploadedAt: new Date().toISOString(),
      students: []
    };
    saveToStorage([...collections, newCollection]);
    setIsAddingManually(false);
    setCategoryInput("");
    setAdminCollegeEmailInput("");
  };

  const handleAddManualStudent = (collectionId: string) => {
    if (!newStudent.name || !newStudent.email) {
      return alert("Name and Email are required for a student.");
    }
    const updated = collections.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          students: [...c.students, {
            id: `stu-manual-${Date.now()}`,
            ...newStudent
          }],
          uploadedAt: new Date().toISOString()
        };
      }
      return c;
    });
    saveToStorage(updated);
    setNewStudent({ name: "", email: "", regNum: "", phone: "" });
    setIsAddingStudentTo(null);
  };

  const handleDeleteCollection = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entire collection?")) {
      saveToStorage(collections.filter(c => c.id !== id));
    }
  };

  const handleDownloadCSV = (collection: Collection) => {
    if (collection.students.length === 0) {
      return alert("No students in this collection to download.");
    }
    const headers = ["Name", "Email", "Phone", "RegNum"];
    const csvContent = [
      headers.join(","),
      ...collection.students.map(s => `"${s.name}","${s.email}","${s.phone}","${s.regNum}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${collection.category.replace(/\s+/g, '_')}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllCSV = () => {
    let allStudents: any[] = [];
    visibleCollections.forEach(c => {
      c.students.forEach(s => {
        allStudents.push({
          ...s,
          collegeName: c.collegeName || "Unknown College",
          category: c.category
        });
      });
    });

    if (allStudents.length === 0) {
      return alert("No students found to download.");
    }

    const headers = ["College Name", "Category", "Student Name", "Email", "Phone", "RegNum"];
    const csvContent = [
      headers.join(","),
      ...allStudents.map(s => `"${s.collegeName}","${s.category}","${s.name}","${s.email}","${s.phone}","${s.regNum}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = targetCollegeName
      ? `${targetCollegeName.replace(/\s+/g, '_')}_All_Students.csv`
      : `All_Colleges_Students.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Visibility logic: Global Admin sees everything, College Admin sees only their own
  let visibleCollections = user?.role === "ADMIN"
    ? collections
    : collections.filter(c => c.collegeEmail === user?.email || (c.collegeName && c.collegeName === (user as any)?.name));

  if (targetCollegeName) {
    visibleCollections = visibleCollections.filter(c =>
      c.collegeName === targetCollegeName ||
      c.category === targetCollegeName ||
      (targetCollegeEmail && c.collegeEmail === targetCollegeEmail)
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      {!targetCollegeName && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-inverse flex items-center gap-3">
              <Building2 className="w-6 h-6 text-indigo-500" />
              College Student Collections
            </h2>
            <p className="text-text-muted">
              {user?.role === "ADMIN"
                ? "View and manage all student data imported by partner colleges."
                : "Upload and manage your student lists, grouped by course category."}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {!isUploading && !isAddingManually && (
              <>
                {user?.role === "ADMIN" && (
                  <button
                    onClick={handleDownloadAllCSV}
                    className="bg-primary hover:bg-primary text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-colors whitespace-nowrap"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Download All</span>
                  </button>
                )}
                <button
                  onClick={() => setIsAddingManually(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-colors whitespace-nowrap"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Manually</span>
                </button>
                <button
                  onClick={() => setIsUploading(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors whitespace-nowrap"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload New CSV</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {targetCollegeName && !isUploading && !isAddingManually && (
        <div className="flex justify-end space-x-3">
          {user?.role === "ADMIN" && (
            <button
              onClick={handleDownloadAllCSV}
              className="bg-primary hover:bg-primary text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-colors whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Download All</span>
            </button>
          )}
          <button
            onClick={() => setIsAddingManually(true)}
            className="bg-slate-800 hover:bg-slate-700 text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-colors whitespace-nowrap"
          >
            <Edit2 className="w-5 h-5" />
            <span className="hidden sm:inline">Add Manual Collection</span>
          </button>
          <button
            onClick={() => setIsUploading(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-colors whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            <span>Upload CSV List</span>
          </button>
        </div>
      )}

      {/* Upload Form */}
      {isUploading && (
        <div className="bg-[#111827] rounded-3xl p-6 border border-border shadow-xl max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-inverse flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-400" />
              Upload Student Collection
            </h3>
            <button onClick={() => { setIsUploading(false); setSelectedFile(null); setCategoryInput(""); }} className="text-text-muted hover:text-text-inverse transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-text-muted block mb-1">Course Category *</label>
              <input
                type="text"
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value)}
                placeholder="e.g., B.Tech CSE, MCA, Full Stack Batch 1"
                className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <p className="text-xs text-text-muted mt-1">This will group the students under this category. Re-uploading with the same category will overwrite it.</p>
            </div>

            <div>
              <label className="text-sm font-bold text-text-muted block mb-1">CSV File *</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 transition-all cursor-pointer bg-[#0a1128] border border-border rounded-xl"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">Ensure the CSV has headers like Name, Email, Phone, RegNum.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={processFile} className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-colors">
                <Save className="w-5 h-5 mr-2" />
                Process & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Form */}
      {isAddingManually && (
        <div className="bg-[#111827] rounded-3xl p-6 border border-border shadow-xl max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-inverse flex items-center">
              <Edit2 className="w-5 h-5 mr-2 text-indigo-400" />
              Create Collection Manually
            </h3>
            <button onClick={() => { setIsAddingManually(false); setCategoryInput(""); setAdminCollegeEmailInput(""); }} className="text-text-muted hover:text-text-inverse transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {user?.role === "ADMIN" && !targetCollegeName && (
              <div>
                <label className="text-sm font-bold text-text-muted block mb-1">Target College Email *</label>
                <input
                  type="email"
                  value={adminCollegeEmailInput}
                  onChange={e => setAdminCollegeEmailInput(e.target.value)}
                  placeholder="e.g., admin@college.edu"
                  className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-bold text-text-muted block mb-1">Course Category *</label>
              <input
                type="text"
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value)}
                placeholder="e.g., B.Tech CSE"
                className="w-full bg-[#0a1128] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={handleCreateManualCollection} className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-colors">
                <Save className="w-5 h-5 mr-2" />
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="space-y-4">
        {visibleCollections.length === 0 ? (
          <div className="bg-[#111827] rounded-3xl border border-border p-16 text-center text-text-muted">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No student collections found. Upload a CSV to get started.</p>
          </div>
        ) : (
          visibleCollections.map(collection => (
            <div key={collection.id} className="bg-[#111827] rounded-2xl border border-border shadow-lg overflow-hidden transition-all">
              {/* Collection Header */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedId(expandedId === collection.id ? null : collection.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-inverse text-lg flex items-center gap-2">
                      {collection.category}
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                        {collection.students.length} Students
                      </span>
                    </h3>
                    <p className="text-sm text-text-muted flex items-center gap-2 mt-0.5">
                      {user?.role === "ADMIN" && (
                        <span className="text-indigo-300">[{collection.collegeEmail}]</span>
                      )}
                      <span>Uploaded: {new Date(collection.uploadedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadCSV(collection); }}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    title="Download CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id); }}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-text-muted hover:text-text-inverse transition-colors">
                    {expandedId === collection.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Student List */}
              {expandedId === collection.id && (
                <div className="border-t border-border bg-[#0a1128] p-4">
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm text-text-muted">
                      <thead className="bg-[#111827] text-xs uppercase text-text-secondary">
                        <tr>
                          <th className="px-4 py-3 border-b border-border">S.No</th>
                          <th className="px-4 py-3 border-b border-border">Name</th>
                          <th className="px-4 py-3 border-b border-border">Email</th>
                          <th className="px-4 py-3 border-b border-border">Reg No.</th>
                          <th className="px-4 py-3 border-b border-border">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collection.students.length === 0 && !isAddingStudentTo && (
                          <tr><td colSpan={5} className="px-4 py-4 text-center">No students added yet.</td></tr>
                        )}
                        {collection.students.map((student, idx) => (
                          <tr key={student.id} className="border-b border-border/50 hover:bg-slate-800/20">
                            <td className="px-4 py-3">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-text-inverse">{student.name}</td>
                            <td className="px-4 py-3 text-primary">{student.email}</td>
                            <td className="px-4 py-3 font-mono">{student.regNum}</td>
                            <td className="px-4 py-3 font-mono">{student.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Manual Student Form */}
                  <div className="mt-4">
                    {isAddingStudentTo === collection.id ? (
                      <div className="bg-[#1a2333] p-4 rounded-xl border border-border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                          <input type="text" placeholder="Name *" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="bg-[#0a1128] border border-border rounded-lg px-3 py-2 text-sm text-text-inverse" />
                          <input type="email" placeholder="Email *" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} className="bg-[#0a1128] border border-border rounded-lg px-3 py-2 text-sm text-text-inverse" />
                          <input type="text" placeholder="Reg Num" value={newStudent.regNum} onChange={e => setNewStudent({ ...newStudent, regNum: e.target.value })} className="bg-[#0a1128] border border-border rounded-lg px-3 py-2 text-sm text-text-inverse" />
                          <input type="text" placeholder="Phone" value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} className="bg-[#0a1128] border border-border rounded-lg px-3 py-2 text-sm text-text-inverse" />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => setIsAddingStudentTo(null)} className="px-4 py-1.5 text-sm text-text-muted hover:text-text-inverse border border-border rounded-lg">Cancel</button>
                          <button onClick={() => handleAddManualStudent(collection.id)} className="px-4 py-1.5 text-sm bg-primary hover:bg-primary text-text-inverse rounded-lg">Save Student</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingStudentTo(collection.id)}
                        className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center"
                      >
                        + Add Student Manually
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
