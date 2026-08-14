import React, { useState, useEffect } from 'react';
import { X, Star, PenSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  ratingValue: string;
}

const defaultReviews = [
  { id: 1, name: "Rahul Sharma", date: "2 days ago", text: "Amazing course! The concepts were explained very clearly and the projects were very practical. Highly recommended.", stars: 5 },
  { id: 2, name: "Priya Singh", date: "1 week ago", text: "Very good curriculum. The mentor was very helpful during the live sessions and doubts were cleared immediately.", stars: 5 },
  { id: 3, name: "Amit Kumar", date: "2 weeks ago", text: "Good course but some advanced topics could use more detailed explanation. Overall great value for the price.", stars: 4 },
  { id: 4, name: "Neha Gupta", date: "1 month ago", text: "Loved the hands-on approach. The placement assistance provided at the end is very useful. Definitely improved my skills.", stars: 5 },
];

export default function RatingModal({ isOpen, onClose, courseId, courseName, ratingValue }: RatingModalProps) {
  const [reviews, setReviews] = useState([...defaultReviews]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewStars, setNewReviewStars] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    // Check enrollment
    const enrolledStr = localStorage.getItem("enrolledCourses");
    let isUserEnrolled = false;
    if (enrolledStr) {
      try {
        const enrolledArr = JSON.parse(enrolledStr);
        isUserEnrolled = enrolledArr.some((e: any) => e.courseId === courseId);
      } catch (e) {}
    }
    setIsEnrolled(isUserEnrolled);

    // Load custom reviews
    const customReviewsStr = localStorage.getItem(`reviews_${courseId}`);
    let customReviews = [];
    if (customReviewsStr) {
      try {
        customReviews = JSON.parse(customReviewsStr);
      } catch (e) {}
    }
    
    setReviews([...customReviews, ...defaultReviews]);
  }, [isOpen, courseId]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const userStr = localStorage.getItem("user");
    let userName = "Student";
    if (userStr) {
        try {
            const u = JSON.parse(userStr);
            if (u?.profile?.firstName) {
                userName = `${u.profile.firstName} ${u.profile.lastName}`;
            } else if (u?.email) {
                userName = u.email.split('@')[0];
            }
        } catch (e) {}
    }

    const newReview = {
      id: Date.now(),
      name: userName,
      date: "Just now",
      text: newReviewText,
      stars: newReviewStars
    };

    const customReviewsStr = localStorage.getItem(`reviews_${courseId}`);
    let customReviews = [];
    if (customReviewsStr) {
      try {
        customReviews = JSON.parse(customReviewsStr);
      } catch (e) {}
    }
    
    const updatedCustom = [newReview, ...customReviews];
    localStorage.setItem(`reviews_${courseId}`, JSON.stringify(updatedCustom));
    
    setReviews([newReview, ...updatedCustom.slice(1), ...defaultReviews]);
    setShowReviewForm(false);
    setNewReviewText("");
    setNewReviewStars(5);
  };

  if (!isOpen) return null;

  // Reviews logic handled above

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#1a2333] border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 flex justify-between items-start shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-text-inverse mb-1">Student Reviews</h2>
              <p className="text-sm text-primary font-medium max-w-sm truncate" title={`for ${courseName}`}>for {courseName}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-inverse hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-border/50">
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                <div className="text-5xl font-extrabold text-text-inverse mb-2">{ratingValue.split(' ')[0] || "4.8"}</div>
                <div className="flex text-yellow-400 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400/30 fill-current" />
                </div>
                <div className="text-sm text-text-muted whitespace-nowrap">{ratingValue.replace('4.8/5 ', '') || "ratings"}</div>
              </div>
              
              <div className="flex-1 space-y-2 w-full">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center text-sm">
                    <span className="w-14 text-text-muted whitespace-nowrap">{star} stars</span>
                    <div className="flex-1 h-2 mx-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: star === 5 ? '75%' : star === 4 ? '20%' : star === 3 ? '5%' : '0%' }}
                      />
                    </div>
                    <span className="w-8 text-right text-text-muted">
                      {star === 5 ? '75%' : star === 4 ? '20%' : star === 3 ? '5%' : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isEnrolled && !showReviewForm && (
              <div className="mb-6 flex justify-end">
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
              </div>
            )}

            {showReviewForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleSubmitReview}
                className="mb-8 bg-[#111827] p-5 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-text-inverse">Your Rating</h3>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewStars(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= newReviewStars ? 'text-yellow-400 fill-current' : 'text-text-secondary'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="What did you think of the course?"
                    required
                    className="w-full bg-[#1a2333] border border-border rounded-lg p-3 text-text-inverse focus:outline-none focus:border-primary transition-colors resize-none h-24"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-text-muted hover:text-text-inverse transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-5 py-2 rounded-lg font-medium transition-colors shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                </div>
              </motion.form>
            )}

            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-[#111827] p-5 rounded-xl border border-border transition-colors hover:border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-sky-500/20 border border-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-text-inverse">{review.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 space-x-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.stars ? 'fill-current' : 'text-text-primary fill-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
