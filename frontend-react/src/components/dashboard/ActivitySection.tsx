import React from 'react';
import { PlayCircle, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ActivitySection({ enrollments, onGenerateCert, onViewCert }: { enrollments: any[], onGenerateCert: (idx: number, name: string) => void, onViewCert: (cert: any) => void }) {
  
  if (enrollments.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center shadow-sm">
        <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-xl font-bold text-text-primary mb-2">No Recent Activity</h3>
        <p className="text-text-secondary mb-6">You haven't enrolled in any courses yet.</p>
        <Link to="/courses-training" className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-xl font-bold transition-colors">
          Explore Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h3>
      
      {enrollments.slice(0, 5).map((course, idx) => {
        const isCompleted = course.status === 'completed' || course.status === 'Success';
        
        let colorClass = 'bg-primary-light text-primary';
        let bgClass = 'bg-surface';
        let borderColor = 'border-border';
        
        if (isCompleted) {
          colorClass = 'bg-success-bg text-success';
          borderColor = 'border-success/20';
        } else if (course.status === 'UNPAID') {
          colorClass = 'bg-warning-bg text-warning';
          borderColor = 'border-warning/20';
        }

        return (
          <div key={idx} className={`p-4 rounded-2xl border ${borderColor} ${bgClass} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md`}>
            <div className="flex items-start sm:items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center ${colorClass}`}>
                {isCompleted ? <Award className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-text-primary">{course.courseName}</h4>
                <p className="text-sm text-text-secondary mt-0.5">
                  {isCompleted ? 'Completed' : (course.status === 'UNPAID' ? 'Pending Payment' : 'In Progress')} • Registered: {new Date(course.dateRegistered).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
               {isCompleted ? (
                 <>
                   <Link to={`/course/${course.courseId}`}>
                     <button className="px-4 py-2 bg-primary-light text-primary hover:bg-primary hover:text-text-inverse rounded-lg font-semibold text-sm transition-colors">Review</button>
                   </Link>
                   {course.certificateName ? (
                     <button 
                       onClick={() => onViewCert({ name: course.certificateName, course: course.courseName, id: course.certificateId })}
                       className="px-4 py-2 bg-success text-text-inverse rounded-lg font-semibold text-sm transition-colors hover:opacity-90"
                     >
                       View Certificate
                     </button>
                   ) : (
                     <button 
                       onClick={() => onGenerateCert(idx, course.fullName)}
                       className="px-4 py-2 bg-success-bg text-success hover:bg-success hover:text-text-inverse rounded-lg font-semibold text-sm transition-colors"
                     >
                       Get Certificate
                     </button>
                   )}
                 </>
               ) : course.status === 'UNPAID' ? (
                 <Link to={`/payment/${course.courseId}`} state={{ newEnrollment: course }}>
                   <button className="px-4 py-2 bg-warning hover:bg-warning/90 text-text-inverse rounded-lg font-semibold text-sm transition-colors">
                     Pay Now
                   </button>
                 </Link>
               ) : (
                 <Link to={`/course/${course.courseId}`}>
                   <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-text-inverse rounded-lg font-semibold text-sm transition-colors shadow-sm">
                     Continue Learning
                   </button>
                 </Link>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
