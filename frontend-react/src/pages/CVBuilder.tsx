import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, User, Briefcase, GraduationCap, Award, Settings, Code, FileText } from 'lucide-react';

export default function CVBuilder() {
  const [data, setData] = useState({
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/johndoe',
    summary: 'Passionate and results-driven Software Engineer with 5+ years of experience in building scalable web applications. Proficient in React, Node.js, and Cloud Infrastructure.',
    experience: [
      {
        company: 'Tech Innovators Inc.',
        role: 'Full Stack Engineer',
        duration: 'Jan 2021 - Present',
        description: 'Led the migration of legacy monolithic architecture to microservices using Node.js and Docker. Improved system performance by 40%.'
      },
      {
        company: 'WebSolutions LLC',
        role: 'Frontend Developer',
        duration: 'Jun 2018 - Dec 2020',
        description: 'Developed highly interactive UI components using React.js and Redux. Mentored junior developers and established code review guidelines.'
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'B.S. in Computer Science',
        year: '2014 - 2018'
      }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExperience = [...data.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setData({ ...data, experience: newExperience });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:bg-white print:text-black pt-20">
      
      {/* LEFT PANEL - FORM CONTROLS (Hidden on Print) */}
      <div className="w-full lg:w-[45%] h-full lg:h-[calc(100vh-80px)] overflow-y-auto p-6 lg:p-8 border-r border-slate-200 dark:border-slate-800 print:hidden scrollbar-thin">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="text-emerald-500" /> 
            CV Builder
          </h1>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="space-y-8">
          {/* Personal Details */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <User className="w-5 h-5 text-indigo-400" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Full Name</label>
                <input type="text" name="name" value={data.name} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Professional Title</label>
                <input type="text" name="title" value={data.title} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Email Address</label>
                <input type="email" name="email" value={data.email} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Phone Number</label>
                <input type="text" name="phone" value={data.phone} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-500">LinkedIn / Portfolio URL</label>
                <input type="text" name="linkedin" value={data.linkedin} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </section>

          {/* Professional Summary */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Professional Summary
            </h2>
            <textarea name="summary" value={data.summary} onChange={handleInputChange} rows={4} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors resize-none"></textarea>
          </section>

          {/* Work Experience */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Briefcase className="w-5 h-5 text-indigo-400" /> Work Experience
            </h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0 last:mb-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">Company Name</label>
                    <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">Job Role</label>
                    <input type="text" value={exp.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1 text-slate-500">Duration (e.g. Jan 2020 - Present)</label>
                    <input type="text" value={exp.duration} onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1 text-slate-500">Description</label>
                    <textarea value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 text-sm resize-none"></textarea>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Institution</label>
                <input type="text" value={data.education[0].institution} onChange={(e) => {
                  const newEd = [...data.education];
                  newEd[0].institution = e.target.value;
                  setData({...data, education: newEd});
                }} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Degree</label>
                <input type="text" value={data.education[0].degree} onChange={(e) => {
                  const newEd = [...data.education];
                  newEd[0].degree = e.target.value;
                  setData({...data, education: newEd});
                }} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-500">Year</label>
                <input type="text" value={data.education[0].year} onChange={(e) => {
                  const newEd = [...data.education];
                  newEd[0].year = e.target.value;
                  setData({...data, education: newEd});
                }} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Code className="w-5 h-5 text-indigo-400" /> Technical Skills
            </h2>
            <textarea name="skills" value={data.skills} onChange={handleInputChange} rows={3} placeholder="Comma separated skills..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors resize-none"></textarea>
          </section>
        </div>
      </div>

      {/* RIGHT PANEL - A4 PREVIEW */}
      <div className="w-full lg:w-[55%] bg-slate-200 dark:bg-slate-900 p-8 flex justify-center items-start overflow-y-auto print:w-full print:bg-white print:p-0 print:overflow-visible">
        
        {/* A4 Document Container */}
        <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-auto print:min-h-0 mx-auto rounded-sm">
          
          {/* Header */}
          <div className="bg-slate-900 text-white px-10 py-12 print:bg-[#1a202c] print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{data.name || 'Your Name'}</h1>
            <h2 className="text-xl text-emerald-400 font-medium mb-6">{data.title || 'Professional Title'}</h2>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                {data.email}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                {data.phone}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                {data.linkedin}
              </span>
            </div>
          </div>

          <div className="p-10">
            {/* Summary */}
            {data.summary && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-4">Summary</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-6">Experience</h3>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-slate-800">{exp.role}</h4>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{exp.duration}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Skills Split */}
            <div className="grid grid-cols-2 gap-8">
              
              {/* Education */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-4">Education</h3>
                {data.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <div className="font-bold text-slate-800 text-sm mb-1">{edu.degree}</div>
                    <div className="text-sm text-slate-600 font-medium">{edu.institution}</div>
                    <div className="text-xs text-slate-500 mt-1">{edu.year}</div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 inline-block pb-1 mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.split(',').map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md"
                      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
            </div>

          </div>
        </div>
      </div>
      
      {/* Global styles to override standard layout for printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          nav, footer, button, .print\\:hidden {
            display: none !important;
          }
          .print\\:w-full, .print\\:w-full * {
            visibility: visible !important;
          }
          .print\\:w-full {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
