import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CampusDrives() {
  return (
    <section className="py-20 px-6 w-full z-10 relative border-t border-border dark:border-border/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        {/* Left Side Content */}
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
            Campus Drives & Workshops
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-text-primary leading-tight">
            Colleges: Elevate Student Readiness with Custom Trainer Bookings
          </h2>

          <p className="text-lg text-text-secondary dark:text-text-muted leading-relaxed">
            Bring industry subject-matter experts to your campus. Schedule interactive bootcamps, hands-on hackathons, or custom placement training modules tailored to your engineering curriculum.
          </p>

          <ul className="space-y-4 pt-2 pb-4">
            {[
              "Vetted corporate trainers with 5+ years of active field experience",
              "Complete syllabus alignment & training material distribution",
              "Lab assignments, hackathons, and placement certifications"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start text-text-primary dark:text-text-secondary">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-[15px]">{item}</span>
              </li>
            ))}
          </ul>

          <Link to="/contact">
            <button className="bg-primary hover:bg-primary text-text-inverse font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]">
              Request Session Now
            </button>
          </Link>
        </div>

        {/* Right Side Workflow Card */}
        <div className="relative">
          {/* Green border accent on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>

          <div className="bg-[#111827] border border-border/50 rounded-2xl p-8 md:p-10 shadow-2xl relative z-10 overflow-hidden">
            <h3 className="text-2xl font-bold text-text-inverse mb-8">Trainer Allocation Workflow</h3>

            <div className="space-y-8">
              {[
                {
                  num: "1",
                  title: "Submit Requirements:",
                  desc: "Define topic, expected attendance, preferred dates and session type."
                },
                {
                  num: "2",
                  title: "Trainer Mapping:",
                  desc: "Our admins select and assign the optimal available trainer based on skills and background."
                },
                {
                  num: "3",
                  title: "On-Campus Execution:",
                  desc: "Trainer executes the training session, manages materials, and conducts hands-on labs."
                }
              ].map((step, idx) => (
                <div key={idx} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                      {step.num}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-300 text-[15px] leading-relaxed">
                      <span className="font-bold text-white">{step.title}</span> {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
