import React, { useState, useEffect, useRef } from "react";
import { Search, Shield, Ban, CheckCircle, UserX, UserCheck, Loader, Upload, FileText, Trash2, Plus, X, Save, ChevronDown } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [uploadRole, setUploadRole] = useState("STUDENT");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSection, setFilterSection] = useState("ALL");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manual User Creation State
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("STUDENT");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(getApiUrl(`/api/v1/auth/users?t=${Date.now()}`));
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesStatus = filterStatus === "ALL" || u.status === filterStatus;
    const matchesSection = filterSection === "ALL" || (u.section || "New User") === filterSection;
    return matchesSearch && matchesRole && matchesStatus && matchesSection;
  });

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u));
  };

  const toggleRole = async (id: string) => {
    let newRole = '';
    let updatedEmail = '';
    let updatedName = '';

    setUsers(users.map(u => {
      if (u.id === id) {
        const nextRole = u.role === 'STUDENT' ? 'INSTRUCTOR'
          : u.role === 'INSTRUCTOR' ? 'COLLEGE_ADMIN'
            : u.role === 'COLLEGE_ADMIN' ? 'ADMIN'
              : 'STUDENT';

        newRole = nextRole;
        updatedEmail = u.email;
        updatedName = u.name;

        return { ...u, role: nextRole };
      }
      return u;
    }));

    try {
      await axios.put(getApiUrl(`/api/v1/auth/users/${id}/role`), { role: newRole });

      if (newRole === 'COLLEGE_ADMIN' && updatedEmail) {
        const savedColc = localStorage.getItem("admin_college_collections");
        let colc = savedColc ? JSON.parse(savedColc) : [];
        if (!colc.some((c: any) => c.collegeEmail === updatedEmail)) {
          colc.push({
            id: `colc-auto-${Date.now()}`,
            collegeEmail: updatedEmail,
            collegeName: updatedName || "Unknown College",
            category: updatedName || "Main Collection",
            uploadedAt: new Date().toISOString(),
            students: []
          });
          localStorage.setItem("admin_college_collections", JSON.stringify(colc));
        }

        // Also auto-create a College entity in College Management
        const savedColleges = localStorage.getItem("admin_colleges_v2");
        let collegesV2 = savedColleges ? JSON.parse(savedColleges) : [];
        if (!collegesV2.some((c: any) => c.name === updatedName)) {
          collegesV2.push({
            id: "col-auto-" + Date.now(),
            name: updatedName || "Unknown College",
            tutors: []
          });
          localStorage.setItem("admin_colleges_v2", JSON.stringify(collegesV2));
        }
      }
    } catch (error) {
      console.error("Failed to update user role in database:", error);
      alert("Failed to sync role change with the server. Please refresh.");
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await axios.delete(getApiUrl(`/api/v1/auth/users/${id}`), {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleManualCreate = () => {
    if (!newName.trim() || !newEmail.trim()) {
      return alert("Name and Email are required!");
    }
    if (users.some(u => u.email?.toLowerCase() === newEmail.toLowerCase())) {
      return alert("A user with this email already exists!");
    }

    const newUser = {
      id: "man-" + Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: "active",
      phoneNumber: newPhone || "—",
      joined: new Date().toISOString().split('T')[0],
      lastLoginAt: null
    };

    setUsers(prev => [newUser, ...prev]);
    setIsCreatingUser(false);
    setNewName(""); setNewEmail(""); setNewPhone("");

    if (newRole === 'COLLEGE_ADMIN' && newEmail) {
      const savedColc = localStorage.getItem("admin_college_collections");
      let colc = savedColc ? JSON.parse(savedColc) : [];
      if (!colc.some((c: any) => c.collegeEmail === newEmail)) {
        colc.push({
          id: `colc-auto-${Date.now()}`,
          collegeEmail: newEmail,
          collegeName: newName || "Unknown College",
          category: newName || "Main Collection",
          uploadedAt: new Date().toISOString(),
          students: []
        });
        localStorage.setItem("admin_college_collections", JSON.stringify(colc));
      }

      const savedColleges = localStorage.getItem("admin_colleges_v2");
      let collegesV2 = savedColleges ? JSON.parse(savedColleges) : [];
      if (!collegesV2.some((c: any) => c.name === newName)) {
        collegesV2.push({
          id: "col-auto-" + Date.now(),
          name: newName || "Unknown College",
          tutors: []
        });
        localStorage.setItem("admin_colleges_v2", JSON.stringify(collegesV2));
      }
    }

    alert("User successfully created!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        if (nameIdx === -1 || emailIdx === -1) {
          alert("CSV must contain 'name' and 'email' columns.");
          return;
        }

        const existingEmails = new Set(users.map(u => u.email?.toLowerCase()));
        const newUsers: any[] = [];
        let duplicatesSkipped = 0;

        lines.slice(1).forEach((line, idx) => {
          const cols = line.split(',').map(c => c.trim());
          const name = cols[nameIdx] || "Unknown";
          const email = cols[emailIdx]?.toLowerCase();

          if (!email || existingEmails.has(email)) {
            duplicatesSkipped++;
            return;
          }

          existingEmails.add(email);
          newUsers.push({
            id: "csv-" + Date.now() + idx,
            name: name,
            email: cols[emailIdx], // preserve original casing
            role: uploadRole,
            status: "active",
            phoneNumber: "—",
            joined: new Date().toISOString().split('T')[0]
          });
        });

        if (newUsers.length > 0) {
          setUsers(prev => [...newUsers, ...prev]);
        }

        let alertMsg = `Successfully imported ${newUsers.length} users and assigned them the ${uploadRole} role!`;
        if (duplicatesSkipped > 0) {
          alertMsg += ` Skipped ${duplicatesSkipped} duplicate or invalid emails.`;
        }
        alert(alertMsg);
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (file) {
      alert("Please select a valid CSV file.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-1">User Management</h2>
          <p className="text-text-muted">View registered users, change roles, and manage access.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative" ref={roleDropdownRef}>
            <div
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center bg-white dark:bg-[#1a2333] border border-border rounded-lg p-1 cursor-pointer hover:border-slate-600 transition-colors"
            >
              <span className="text-xs text-text-muted px-2 font-bold uppercase">Assign:</span>
              <div className="flex items-center text-primary font-bold px-2 py-1 text-sm select-none">
                {uploadRole === 'STUDENT' ? 'Student' : uploadRole === 'INSTRUCTOR' ? 'Instructor' : uploadRole === 'COLLEGE_ADMIN' ? 'College Admin' : 'Admin'}
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isRoleDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1a2333] border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <button onClick={() => { setUploadRole('STUDENT'); setIsRoleDropdownOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-primary font-bold transition-colors">Student</button>
                <button onClick={() => { setUploadRole('INSTRUCTOR'); setIsRoleDropdownOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-primary font-bold transition-colors">Instructor</button>
                <button onClick={() => { setUploadRole('COLLEGE_ADMIN'); setIsRoleDropdownOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-primary font-bold transition-colors">College Admin</button>
                <button onClick={() => { setUploadRole('ADMIN'); setIsRoleDropdownOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-primary font-bold transition-colors">Admin</button>
              </div>
            )}
          </div>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary text-text-inverse px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors text-sm shadow-lg shadow-blue-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          {!isCreatingUser && (
            <button
              onClick={() => setIsCreatingUser(true)}
              className="bg-primary hover:bg-primary text-text-inverse px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors text-sm shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {isCreatingUser && (
        <div className="bg-surface dark:bg-[#111827] rounded-2xl p-6 border border-border shadow-xl mb-6">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              Add New User
            </h3>
            <button onClick={() => setIsCreatingUser(false)} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">Full Name *</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">Email Address *</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="e.g. john@example.com" className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">Phone Number</label>
              <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. +91 9876543210" className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary">
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="COLLEGE_ADMIN">College Admin</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleManualCreate} className="bg-primary hover:bg-primary text-text-inverse px-6 py-2 rounded-lg font-bold flex items-center shadow-lg transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save User
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white dark:bg-[#1a2333] border border-border text-text-secondary px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary w-full sm:w-auto cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="COLLEGE_ADMIN">College Admin</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white dark:bg-[#1a2333] border border-border text-text-secondary px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary w-full sm:w-auto cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>

              <select 
                value={filterSection} 
                onChange={(e) => setFilterSection(e.target.value)}
                className="bg-white dark:bg-[#1a2333] border border-border text-text-secondary px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary w-full sm:w-auto cursor-pointer"
              >
                <option value="ALL">All Sections</option>
                <option value="New User">New User</option>
                <option value="College Student">College Student</option>
              </select>
            </div>
          </div>
          <span className="text-sm font-medium text-text-muted whitespace-nowrap">Total: {filtered.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white dark:bg-[#1a2333] text-text-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted">No users found matching your search.</td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-text-primary font-bold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">{user.name}</div>
                        <div className="text-xs text-text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRole(user.id)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' :
                          user.role === 'INSTRUCTOR' ? 'bg-primary/10 text-primary hover:bg-primary/20' :
                            user.role === 'COLLEGE_ADMIN' ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' :
                              'bg-slate-200 dark:bg-slate-700 text-text-secondary hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      title="Click to cycle role"
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-text-secondary rounded-full whitespace-nowrap">
                      {user.section || "New User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center text-xs font-bold ${user.status === 'active' ? 'text-primary' : 'text-rose-500'}`}>
                      {user.status === 'active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-text-muted">{user.phoneNumber || "—"}</td>
                  <td className="px-6 py-4 font-mono text-text-muted">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</td>
                  <td className="px-6 py-4 font-mono text-text-muted">{user.joined}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`p-2 rounded-lg transition-colors inline-block ${user.status === 'active' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-primary hover:bg-primary/10'}`}
                      title={user.status === 'active' ? 'Ban User' : 'Unban User'}
                    >
                      {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 rounded-lg transition-colors text-rose-500 hover:bg-rose-500/10 inline-block"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
