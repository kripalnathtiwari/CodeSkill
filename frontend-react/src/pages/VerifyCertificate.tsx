import React, { useState } from "react";
import { Search, CheckCircle, XCircle, Award, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyCertificate() {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setHasSearched(true);
    
    // In a real app, this would be an API call to a backend database.
    // Here we simulate checking the local mock database.
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      try {
        const parsed = JSON.parse(existingStr);
        const match = parsed.find((e: any) => e.certificateId === certId.trim());
        if (match) {
          setResult(match);
        } else {
          setResult(null);
        }
      } catch (e) {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  return (
    <div className="flex-1 bg-[#0B0F19] text-text-secondary w-full min-h-screen py-20 px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-text-inverse mb-4">Verify a Certificate</h1>
        <p className="text-text-muted">
          Enter the unique Certificate ID located at the bottom left of any valid CodeSkill certificate to verify its authenticity.
        </p>
      </div>

      <div className="max-w-xl w-full">
        <form onSubmit={handleVerify} className="relative mb-12">
          <input 
            type="text" 
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="e.g. CS-20260625-A8B9"
            className="w-full bg-[#111827] border border-border rounded-2xl py-4 pl-6 pr-32 text-lg text-text-inverse font-mono focus:outline-none focus:border-primary shadow-xl"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary text-text-inverse font-bold px-6 rounded-xl transition-colors flex items-center shadow-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Verify
          </button>
        </form>

        {hasSearched && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {result ? (
              <div className="bg-[#111827] border-2 border-primary/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <div className="flex items-center text-primary font-bold text-lg mb-6 pb-6 border-b border-border">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Authentic Certificate Found
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-text-muted mb-1 flex items-center">
                      <User className="w-4 h-4 mr-2" /> Recipient Name
                    </p>
                    <p className="text-xl font-bold text-text-inverse" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {result.certificateName}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-text-muted mb-1 flex items-center">
                      <Award className="w-4 h-4 mr-2" /> Course Completed
                    </p>
                    <p className="text-lg font-bold text-text-secondary">
                      {result.courseName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Registration Date
                    </p>
                    <p className="text-text-secondary font-mono">
                      {new Date(result.dateRegistered).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-primary/10 rounded-xl p-4 mt-6">
                    <p className="text-xs text-primary font-mono text-center tracking-widest">
                      CERTIFICATE ID: {result.certificateId}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#111827] border-2 border-rose-500/30 rounded-2xl p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-text-inverse mb-2">Certificate Not Found</h3>
                <p className="text-text-muted text-sm">
                  We couldn't find a certificate matching the ID <span className="font-mono text-text-inverse">"{certId}"</span>. 
                  Please ensure you've typed it exactly as it appears on the document.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
