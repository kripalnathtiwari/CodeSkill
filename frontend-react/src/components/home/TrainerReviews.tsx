import React from "react";
import { motion } from "framer-motion";

export default function TrainerReviews() {
  return (
    <section className="py-20 px-6 w-full z-10 relative border-t border-border dark:border-border/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary mb-4">
            What Colleges Say About Our Trainers
          </h2>
          <p className="text-text-secondary dark:text-text-muted max-w-2xl mx-auto">
            Read authentic feedback from institutions and students who have experienced our transformative on-campus training programs.
          </p>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              quote: "The on-campus corporate training module was exactly what our final year students needed. The industry trainer gave them real-world scenarios to solve, helping over 60% of the batch secure placements instantly.",
              name: "Dr. Sharma",
              role: "HOD, Computer Science",
              course: "Custom Placement Training Bootcamps",
              initial: "D"
            },
            {
              quote: "The trainer assigned to our campus was phenomenal. Handling Redis, Docker, and CI/CD pipelines in a hands-on lab environment boosted our students' practical confidence immensely.",
              name: "Prof. Priya Patel",
              role: "Placement Coordinator",
              course: "DevOps & Cloud Workshop",
              initial: "P"
            },
            {
              quote: "Bringing CodeSklii experts for a 3-day hackathon completely transformed the coding culture here. The trainer's 7+ years of active field experience really showed during the 1-on-1 mentoring sessions.",
              name: "Amit Kumar",
              role: "College Tech Lead",
              course: "Full-Stack Web Development Hackathon",
              initial: "A"
            }
          ].map((review, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: "spring" } }
              }}
              whileHover={{ y: -8 }}
              className="bg-surface dark:bg-background/80 backdrop-blur-sm border border-border dark:border-border rounded-3xl p-8 flex flex-col justify-between shadow-lg dark:shadow-2xl hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300"
            >
              <div>
                <div className="flex space-x-1 mb-6 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-text-secondary dark:text-text-secondary italic mb-8 leading-relaxed text-[15px] font-medium">
                  "{review.quote}"
                </p>
              </div>

              <div className="flex items-center pt-6 border-t border-slate-100 dark:border-border/80">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-sky-600 flex items-center justify-center text-text-inverse font-bold text-lg mr-4 flex-shrink-0 shadow-md">
                  {review.initial}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary dark:text-text-primary text-[15px]">{review.name}</h4>
                  <p className="text-text-muted dark:text-text-muted text-xs mt-0.5">{review.role}</p>
                  <p className="text-primary dark:text-primary text-xs font-bold mt-1 pr-2 line-clamp-1">{review.course}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
