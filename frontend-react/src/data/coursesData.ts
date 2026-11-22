import type { LucideIcon } from "lucide-react";

export interface Course {
  id: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  students: string;
  seats: string;
  partner: string;
  price: string;
  tags: string[];
  trainer?: {
    name: string;
    role: string;
    company: string;
    experience: string;
    rating: string;
    students: string;
    bio: string;
    image: string;
    linkedin?: string;
  };
  trainerName?: string;
  trainerRole?: string;
  trainerCompany?: string;
  trainerBio?: string;
  trainerImage?: string;
  trainerLinkedin?: string;
  icon?: LucideIcon | any;
  color?: string;
  image?: string;
  bullets?: string[];
  modules?: Array<{ title: string; desc: string }>;
  skills?: string[];
  techIcons?: any[];
  [key: string]: any;
}

// All default courses removed - courses are dynamically populated from custom courses / admin management
export const COURSES_DATA: Record<string, Course> = {};

export const getAllCourses = (): Course[] => {
  let customCourses: Course[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("admin_custom_courses");
      if (saved) customCourses = JSON.parse(saved);
    } catch (e) {}
  }
  return [...Object.values(COURSES_DATA), ...customCourses];
};

export const getCoursesByCategory = (cat: string): Course[] => getAllCourses().filter(c => c.category === cat);

export const getCourseById = (id: string): Course | undefined => {
  if (COURSES_DATA[id]) {
    return COURSES_DATA[id];
  }
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("admin_custom_courses");
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = parsed.find((c: Course) => String(c.id) === String(id));
        if (found) return found;
      }
    } catch (e) {}
  }
  return undefined;
};
