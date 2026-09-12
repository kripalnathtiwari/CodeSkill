import React from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getCoursesByCategory } from "../../data/coursesData";

export default function FeaturedCourses() {
  return (
    <section className="py-20 px-6 w-full z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-14 text-center">
          <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary mb-4">Master Your Skills</h2>
          <p className="text-text-secondary dark:text-text-muted max-w-2xl">
            Explore our most popular self-paced courses designed by industry experts to help you land your dream tech job.
          </p>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {getCoursesByCategory("featured").map(course => (
            <motion.div
              key={course.id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.3 } }
              }}
              whileHover={{ y: -8 }}
              className="group bg-surface dark:bg-background rounded-2xl border border-border dark:border-border hover:border-primary/50 transition-all flex flex-col shadow-sm hover:shadow-2xl overflow-hidden"
            >
              {/* Course Image */}
              <div className="w-full aspect-video overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10`} />
                <img
                  src={course.image}
                  alt={course.title}
                  width="400"
                  height="225"
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-4 left-4 z-20 flex space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.color} p-[1px]`}>
                    <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                      <course.icon className="h-4 w-4 text-text-inverse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-sm font-bold ml-2 whitespace-nowrap">
                    {course.price}
                  </span>
                </div>
                <p className="text-sm text-text-secondary dark:text-text-muted mb-6 flex-1">
                  {course.description}
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-2 text-xs font-medium text-text-muted dark:text-text-muted">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>{course.students} Enrolled</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {course.tags.map((tag: string) => (
                      <span key={tag} className="bg-surface-secondary dark:bg-background text-text-secondary dark:text-text-muted text-[10px] px-2 py-1 rounded font-semibold tracking-wider uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link to={`/course/${course.id}`} className="block mt-4">
                    <button className="w-full py-2.5 rounded-lg border border-border dark:border-border text-text-primary dark:text-text-secondary font-bold hover:bg-primary hover:text-text-inverse dark:hover:bg-primary hover:border-primary transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <span>Explore Syllabus</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/courses-training">
            <button className="inline-flex items-center space-x-2 text-primary dark:text-primary font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <span>View all courses & summer training</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
