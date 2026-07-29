import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";
import { User, Mail, Phone, Save, ShieldAlert } from "lucide-react";

export default function EditProfile() {
  const { user, login } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.profile?.firstName || "");
      setLastName(user.profile?.lastName || "");
      setPhoneNumber((user as any).phoneNumber || (user.profile as any)?.phoneNumber || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      await axios.put(
        getApiUrl("/api/v1/auth/profile"),
        { firstName, lastName, phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = {
        ...user,
        phoneNumber,
        profile: {
          ...user.profile,
          firstName,
          lastName,
        }
      };

      const refreshToken = localStorage.getItem("refreshToken") || "";
      login(token || "", refreshToken, updatedUser as any);
      
      setMessage({ text: "Profile successfully updated!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: "Failed to update profile.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent inline-block">Edit Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Update your personal information and contact details.</p>
        </div>

        <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {message.text && (
            <div className={`p-4 rounded-xl mb-6 flex items-center space-x-3 ${message.type === 'error' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
              {message.type === 'error' ? <ShieldAlert className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span className="font-semibold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <User className="w-4 h-4 mr-2" /> First Name
                </label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <User className="w-4 h-4 mr-2" /> Last Name
                </label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Phone className="w-4 h-4 mr-2" /> Phone Number
              </label>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Mail className="w-4 h-4 mr-2" /> Email Address
              </label>
              <input 
                type="email" 
                value={user?.email || ""}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                title="Email cannot be changed"
              />
              <p className="text-xs text-slate-500 mt-1">Your email address is fixed and cannot be changed.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
