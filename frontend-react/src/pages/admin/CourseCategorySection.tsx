import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  User,
  Users,
  Mail,
  Phone,
  Award,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  Sparkles,
  FileText
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL as API_URL } from "../../utils/apiConfig";

type Tutor = {
  id: string;
  name: string;
  phone: string;
  domain: string;
  joiningDate?: string;
  email: string;
  section?: string;
  trainerId?: string;
};

type CourseInstructor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  domain?: string;
  trainerId?: string;
  classId?: string;
};

type CourseStudent = {
  id: string;
  name: string;
  email: string;
  regNum?: string;
  phone?: string;
  classId?: string;
};

type CourseClass = {
  id: string;
  categoryId: string;
  className: string;
  description?: string;
  createdAt?: string;
  instructors: CourseInstructor[];
  students: CourseStudent[];
};

type CourseCategory = {
  id: string;
  collegeName: string;
  collegeEmail?: string;
  courseName: string;
  description?: string;
  createdAt?: string;
  classes?: CourseClass[];
  instructors: CourseInstructor[];
  students: CourseStudent[];
};

interface CourseCategorySectionProps {
  collegeName: string;
  collegeEmail?: string;
  tutors: Tutor[];
}

export default function CourseCategorySection({
  collegeName,
  collegeEmail,
  tutors
}: CourseCategorySectionProps) {
  const [courses, setCourses] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI modal / form states
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseNameInput, setCourseNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  // Class creation state
  const [creatingClassCourseId, setCreatingClassCourseId] = useState<string | null>(null);
  const [newClassNameInput, setNewClassNameInput] = useState("");
  const [newClassDescriptionInput, setNewClassDescriptionInput] = useState("");

  // Target class ID for nested student / instructor operations
  const [targetClassId, setTargetClassId] = useState<string | null>(null);
  const [activeClassTab, setActiveClassTab] = useState<{ [classId: string]: "students" | "instructors" }>({});
  const [minimizedClasses, setMinimizedClasses] = useState<{ [classId: string]: boolean }>({});

  // Expandable course detail panels
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<{ [key: string]: string }>({});

  // Assign Instructor state
  const [assigningToCourseId, setAssigningToCourseId] = useState<string | null>(null);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [customInstructor, setCustomInstructor] = useState({
    name: "",
    email: "",
    phone: "",
    domain: "",
    trainerId: ""
  });
  const [isCustomInstructorMode, setIsCustomInstructorMode] = useState(false);

  // Add Student state
  const [addingStudentCourseId, setAddingStudentCourseId] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    regNum: "",
    phone: ""
  });

  // CSV Import state
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvTargetCourseId, setCsvTargetCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseCategories();
  }, [collegeName]);

  const saveToStorageFallback = (updated: CourseCategory[]) => {
    try {
      localStorage.setItem(`admin_course_categories_${collegeName}`, JSON.stringify(updated));
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  const fetchCourseCategories = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${API_URL}/api/v1/college-management/courses?collegeName=${encodeURIComponent(collegeName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && Array.isArray(res.data)) {
        setCourses(res.data);
        saveToStorageFallback(res.data);
      }
    } catch (err) {
      console.warn("API fetch failed, falling back to local storage:", err);
      const saved = localStorage.getItem(`admin_course_categories_${collegeName}`);
      if (saved) {
        setCourses(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================
  // Course Category Handlers
  // ==========================
  const handleSaveCourse = async () => {
    if (!courseNameInput.trim()) {
      alert("Please enter a course category name!");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (editingCourseId) {
        await axios.put(
          `${API_URL}/api/v1/college-management/courses/${editingCourseId}`,
          { courseName: courseNameInput, description: descriptionInput },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/api/v1/college-management/courses`,
          {
            collegeName,
            collegeEmail,
            courseName: courseNameInput,
            description: descriptionInput
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchCourseCategories();
    } catch (err) {
      console.warn("API request failed, using local fallback");
      if (editingCourseId) {
        const updated = courses.map((c) =>
          c.id === editingCourseId
            ? { ...c, courseName: courseNameInput, description: descriptionInput }
            : c
        );
        setCourses(updated);
        saveToStorageFallback(updated);
      } else {
        const newCategory: CourseCategory = {
          id: `local_${Date.now()}`,
          collegeName,
          collegeEmail,
          courseName: courseNameInput,
          description: descriptionInput,
          createdAt: new Date().toISOString(),
          instructors: [],
          students: []
        };
        const updated = [newCategory, ...courses];
        setCourses(updated);
        saveToStorageFallback(updated);
      }
    } finally {
      setCourseNameInput("");
      setDescriptionInput("");
      setIsCreatingCourse(false);
      setEditingCourseId(null);
    }
  };

  const handleEditCourse = (course: CourseCategory) => {
    setEditingCourseId(course.id);
    setCourseNameInput(course.courseName);
    setDescriptionInput(course.description || "");
    setIsCreatingCourse(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course category?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/api/v1/college-management/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn("API delete failed, updating local state");
    } finally {
      const updated = courses.filter((c) => c.id !== id);
      setCourses(updated);
      saveToStorageFallback(updated);
    }
  };

  // ==========================
  // Instructor Assignment
  // ==========================
  const handleAssignInstructor = async (courseId: string) => {
    let instructorData: {
      name: string;
      email: string;
      phone?: string;
      domain?: string;
      trainerId?: string;
    } | null = null;

    if (isCustomInstructorMode) {
      if (!customInstructor.name || !customInstructor.email) {
        alert("Instructor Name and Email are required!");
        return;
      }
      instructorData = customInstructor;
    } else {
      if (!selectedTutorId) {
        alert("Please select an instructor from the list!");
        return;
      }
      const existing = tutors.find((t) => t.id === selectedTutorId);
      if (existing) {
        instructorData = {
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          domain: existing.domain,
          trainerId: existing.trainerId
        };
      }
    }

    if (!instructorData) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_URL}/api/v1/college-management/courses/${courseId}/instructors`,
        {
          ...instructorData,
          classId: targetClassId || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCourseCategories();
    } catch (err) {
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            instructors: [
              ...c.instructors,
              { id: `inst_${Date.now()}`, ...instructorData!, classId: targetClassId || undefined }
            ]
          };
        }
        return c;
      });
      setCourses(updated);
      saveToStorageFallback(updated);
    } finally {
      setAssigningToCourseId(null);
      setSelectedTutorId("");
      setCustomInstructor({ name: "", email: "", phone: "", domain: "", trainerId: "" });
      setIsCustomInstructorMode(false);
      setTargetClassId(null);
    }
  };

  const handleRemoveInstructor = async (courseId: string, instructorId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(
        `${API_URL}/api/v1/college-management/courses/${courseId}/instructors/${instructorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCourseCategories();
    } catch (err) {
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            instructors: c.instructors.filter((i) => i.id !== instructorId)
          };
        }
        return c;
      });
      setCourses(updated);
      saveToStorageFallback(updated);
    }
  };

  // ==========================
  // Student Handlers & CSV
  // ==========================
  const handleAddStudent = async (courseId: string) => {
    if (!newStudent.name || !newStudent.email) {
      alert("Student Name and Email are required!");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_URL}/api/v1/college-management/courses/${courseId}/students`,
        {
          students: [
            {
              ...newStudent,
              classId: targetClassId || undefined
            }
          ]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCourseCategories();
    } catch (err) {
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            students: [
              ...c.students,
              { id: `stud_${Date.now()}`, ...newStudent, classId: targetClassId || undefined }
            ]
          };
        }
        return c;
      });
      setCourses(updated);
      saveToStorageFallback(updated);
    } finally {
      setAddingStudentCourseId(null);
      setNewStudent({ name: "", email: "", regNum: "", phone: "" });
      setTargetClassId(null);
    }
  };

  const handleRemoveStudent = async (courseId: string, studentId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(
        `${API_URL}/api/v1/college-management/courses/${courseId}/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCourseCategories();
    } catch (err) {
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            students: c.students.filter((s) => s.id !== studentId)
          };
        }
        return c;
      });
      setCourses(updated);
      saveToStorageFallback(updated);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !csvTargetCourseId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert("CSV file seems empty or missing student rows!");
        return;
      }

      const parsedStudents: {
        name: string;
        email: string;
        regNum?: string;
        phone?: string;
        classId?: string;
      }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((col) => col.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 2 && cols[1]) {
          parsedStudents.push({
            name: cols[0] || "Unnamed Student",
            email: cols[1],
            regNum: cols[2] || undefined,
            phone: cols[3] || undefined,
            classId: targetClassId || undefined
          });
        }
      }

      if (parsedStudents.length === 0) {
        alert("No valid student rows found. Expected format: Name,Email,RegNum,Phone");
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        await axios.post(
          `${API_URL}/api/v1/college-management/courses/${csvTargetCourseId}/students`,
          { students: parsedStudents },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchCourseCategories();
        alert(`Successfully imported ${parsedStudents.length} students into course!`);
      } catch (err) {
        const updated = courses.map((c) => {
          if (c.id === csvTargetCourseId) {
            const added = parsedStudents.map((s, index) => ({
              id: `csv_${Date.now()}_${index}`,
              ...s
            }));
            return {
              ...c,
              students: [...c.students, ...added]
            };
          }
          return c;
        });
        setCourses(updated);
        saveToStorageFallback(updated);
        alert(`Imported ${parsedStudents.length} students locally!`);
      } finally {
        if (csvInputRef.current) csvInputRef.current.value = "";
        setCsvTargetCourseId(null);
        setTargetClassId(null);
      }
    };
    reader.readAsText(file);
  };

  const triggerCsvInput = (courseId: string, classId?: string) => {
    setTargetClassId(classId || null);
    setCsvTargetCourseId(courseId);
    csvInputRef.current?.click();
  };

  // ==========================
  // Class / Section Handlers
  // ==========================
  const handleCreateClass = async (courseId: string) => {
    if (!newClassNameInput.trim()) {
      alert("Please enter a Class / Section Name (e.g. Section A)");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_URL}/api/v1/college-management/courses/${courseId}/classes`,
        { className: newClassNameInput, description: newClassDescriptionInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCourseCategories();
    } catch (err) {
      console.warn("API create class failed, falling back to local state");
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          const newClassObj: CourseClass = {
            id: `class_${Date.now()}`,
            categoryId: courseId,
            className: newClassNameInput,
            description: newClassDescriptionInput,
            createdAt: new Date().toISOString(),
            instructors: [],
            students: []
          };
          return {
            ...c,
            classes: [...(c.classes || []), newClassObj]
          };
        }
        return c;
      });
      setCourses(updated);
      saveToStorageFallback(updated);
    } finally {
      setNewClassNameInput("");
      setNewClassDescriptionInput("");
      setCreatingClassCourseId(null);
    }
  };

  const handleDeleteClass = async (courseId: string, classId: string) => {
    if (!window.confirm("Are you sure you want to delete this Class / Section?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(
        `${API_URL}/api/v1/college-management/courses/classes/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCourseCategories();
    } catch (err) {
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            classes: (c.classes || []).filter((cls) => cls.id !== classId),
            students: c.students.map((s) => (s.classId === classId ? { ...s, classId: undefined } : s)),
            instructors: c.instructors.map((i) => (i.classId === classId ? { ...i, classId: undefined } : i))
          };
        }
        return c;
      });
      setCourses(updated);
      saveToStorageFallback(updated);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hidden CSV File Input */}
      <input
        type="file"
        accept=".csv"
        ref={csvInputRef}
        onChange={handleCsvUpload}
        className="hidden"
      />

      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] to-[#1f2937] p-6 rounded-3xl border border-border shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black text-text-inverse flex items-center">
              Course Categories & Batches
              <span className="ml-3 text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                {courses.length} Active
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Create courses, assign instructors, and manage enrolled students for {collegeName}
            </p>
          </div>
        </div>

        {!isCreatingCourse && (
          <button
            onClick={() => {
              setIsCreatingCourse(true);
              setEditingCourseId(null);
              setCourseNameInput("");
              setDescriptionInput("");
            }}
            className="bg-gradient-to-r from-primary to-sky-500 hover:from-primary hover:to-sky-400 text-text-inverse px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Course Category</span>
          </button>
        )}
      </div>

      {/* Create/Edit Course Modal/Card */}
      {isCreatingCourse && (
        <div className="bg-[#111827] rounded-3xl p-6 md:p-8 border border-primary/30 shadow-2xl relative animate-slideDown">
          <button
            onClick={() => {
              setIsCreatingCourse(false);
              setEditingCourseId(null);
            }}
            className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-inverse bg-slate-800/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h4 className="text-lg font-bold text-text-inverse mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            {editingCourseId ? "Edit Course Category" : "Create Course Category"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Course / Category Name *
              </label>
              <input
                type="text"
                value={courseNameInput}
                onChange={(e) => setCourseNameInput(e.target.value)}
                placeholder="e.g. B.Tech Computer Science - Sem 6"
                className="w-full bg-slate-900/80 border border-border rounded-2xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Description / Academic Term (Optional)
              </label>
              <input
                type="text"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="e.g. Core Engineering Batch 2026"
                className="w-full bg-slate-900/80 border border-border rounded-2xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary shadow-inner"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreatingCourse(false);
                setEditingCourseId(null);
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-text-muted hover:text-text-inverse border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCourse}
              className="bg-primary hover:bg-primary text-text-inverse px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Course
            </button>
          </div>
        </div>
      )}

      {/* Course Cards List */}
      {courses.length === 0 && !isLoading ? (
        <div className="bg-[#111827] rounded-3xl border border-border p-16 text-center text-text-muted">
          <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-base font-medium">No course categories added yet.</p>
          <p className="text-xs text-text-secondary mt-1">
            Click &quot;New Course Category&quot; above to add courses and assign instructors & students.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => {
            const isExpanded = expandedCourseId === course.id;

            return (
              <div
                key={course.id}
                className="bg-[#111827] rounded-3xl border border-border overflow-hidden transition-all duration-300 shadow-lg hover:border-border"
              >
                {/* Card Header Bar */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-sky-500/10 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-inverse flex items-center">
                        {course.courseName}
                      </h4>
                      {course.description && (
                        <p className="text-xs text-text-muted mt-0.5">{course.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="inline-flex items-center text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 font-semibold">
                          <Layers className="w-3.5 h-3.5 mr-1.5" />
                          {course.classes?.length || 0} Classes
                        </span>
                        <span className="inline-flex items-center text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 font-semibold">
                          <Users className="w-3.5 h-3.5 mr-1.5" />
                          {course.students.length} Students
                        </span>
                        <span className="inline-flex items-center text-xs text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 font-semibold">
                          <User className="w-3.5 h-3.5 mr-1.5" />
                          {course.instructors.length} Instructors
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() =>
                        setExpandedCourseId(isExpanded ? null : course.id)
                      }
                      className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-text-secondary hover:text-text-inverse rounded-xl text-xs font-bold transition-colors flex items-center"
                    >
                      {isExpanded ? "Hide Details" : "Manage Course"}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 ml-1.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-text-inverse rounded-xl transition-colors"
                      title="Edit Course Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-text-inverse rounded-xl transition-colors"
                      title="Delete Course Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Management Panel */}
                {isExpanded && (
                  <div className="border-t border-border/80 bg-slate-900/50 p-6 md:p-8 animate-fadeIn">
                    {/* Course Sections Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
                      <div>
                        <h5 className="text-base font-bold text-text-inverse flex items-center">
                          <Layers className="w-5 h-5 mr-2 text-purple-400" />
                          Sections / Classes in {course.courseName}
                        </h5>
                        <p className="text-xs text-text-muted mt-0.5">
                          View section names below and inspect enrolled students and assigned instructors inside each section.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCreatingClassCourseId(
                            creatingClassCourseId === course.id ? null : course.id
                          )
                        }
                        className="bg-purple-600 hover:bg-purple-500 text-text-inverse px-4 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-md transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        New Class / Section
                      </button>
                    </div>

                    {/* Modal/Form: Add Student */}
                    {addingStudentCourseId === course.id && (
                      <div className="bg-[#111827] rounded-2xl p-6 border border-border mb-6 animate-slideDown">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-sm font-bold text-text-inverse">
                            Add Student to {course.courseName}{" "}
                            {targetClassId && course.classes
                              ? `(${course.classes.find((cl) => cl.id === targetClassId)?.className || "Class"})`
                              : "(General)"}
                          </h5>
                          <button
                            onClick={() => {
                              setAddingStudentCourseId(null);
                              setTargetClassId(null);
                            }}
                            className="text-text-muted hover:text-text-inverse"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <input
                            type="text"
                            placeholder="Student Name *"
                            value={newStudent.name}
                            onChange={(e) =>
                              setNewStudent({ ...newStudent, name: e.target.value })
                            }
                            className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                          />
                          <input
                            type="email"
                            placeholder="Email Address *"
                            value={newStudent.email}
                            onChange={(e) =>
                              setNewStudent({ ...newStudent, email: e.target.value })
                            }
                            className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Reg / Roll Number"
                            value={newStudent.regNum}
                            onChange={(e) =>
                              setNewStudent({ ...newStudent, regNum: e.target.value })
                            }
                            className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Phone Number"
                            value={newStudent.phone}
                            onChange={(e) =>
                              setNewStudent({ ...newStudent, phone: e.target.value })
                            }
                            className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handleAddStudent(course.id)}
                            className="bg-primary hover:bg-primary text-text-inverse px-5 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Add Student
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Modal/Form: Assign Instructor */}
                    {assigningToCourseId === course.id && (
                      <div className="bg-[#111827] rounded-2xl p-6 border border-border mb-6 animate-slideDown">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-sm font-bold text-text-inverse">
                            Assign Instructor to {course.courseName}{" "}
                            {targetClassId && course.classes
                              ? `(${course.classes.find((cl) => cl.id === targetClassId)?.className || "Class"})`
                              : "(General)"}
                          </h5>
                          <button
                            onClick={() => {
                              setAssigningToCourseId(null);
                              setTargetClassId(null);
                            }}
                            className="text-text-muted hover:text-text-inverse"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <label className="text-xs text-text-secondary flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`mode_${course.id}`}
                              checked={!isCustomInstructorMode}
                              onChange={() => setIsCustomInstructorMode(false)}
                              className="mr-2 accent-blue-500"
                            />
                            Select from College Tutors
                          </label>
                          <label className="text-xs text-text-secondary flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`mode_${course.id}`}
                              checked={isCustomInstructorMode}
                              onChange={() => setIsCustomInstructorMode(true)}
                              className="mr-2 accent-blue-500"
                            />
                            Add New Instructor
                          </label>
                        </div>

                        {!isCustomInstructorMode ? (
                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <select
                              value={selectedTutorId}
                              onChange={(e) => setSelectedTutorId(e.target.value)}
                              className="w-full bg-slate-900 border border-border rounded-xl px-4 py-2.5 text-xs text-text-inverse focus:border-primary focus:outline-none"
                            >
                              <option value="">-- Select Instructor --</option>
                              {tutors.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.domain || "No domain"}) - {t.email}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignInstructor(course.id)}
                              className="w-full sm:w-auto bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                            >
                              Assign
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <input
                                type="text"
                                placeholder="Instructor Name *"
                                value={customInstructor.name}
                                onChange={(e) =>
                                  setCustomInstructor({
                                    ...customInstructor,
                                    name: e.target.value
                                  })
                                }
                                className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                              />
                              <input
                                type="email"
                                placeholder="Email Address *"
                                value={customInstructor.email}
                                onChange={(e) =>
                                  setCustomInstructor({
                                    ...customInstructor,
                                    email: e.target.value
                                  })
                                }
                                className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Domain (e.g. DSA, MERN)"
                                value={customInstructor.domain}
                                onChange={(e) =>
                                  setCustomInstructor({
                                    ...customInstructor,
                                    domain: e.target.value
                                  })
                                }
                                className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Phone Number"
                                value={customInstructor.phone}
                                onChange={(e) =>
                                  setCustomInstructor({
                                    ...customInstructor,
                                    phone: e.target.value
                                  })
                                }
                                className="bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-text-inverse focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => handleAssignInstructor(course.id)}
                                className="bg-primary hover:bg-primary text-text-inverse px-5 py-2 rounded-xl text-xs font-bold transition-all"
                              >
                                Assign Instructor
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Classes / Sections List Content */}
                    <div className="space-y-6">
                      {creatingClassCourseId === course.id && (
                        <div className="bg-[#111827] rounded-2xl p-6 border border-purple-500/40 mb-6 animate-slideDown shadow-xl">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-bold text-text-inverse flex items-center">
                              <Layers className="w-4 h-4 mr-2 text-purple-400" />
                              Create New Class / Section for {course.courseName}
                            </h5>
                            <button
                              onClick={() => setCreatingClassCourseId(null)}
                              className="text-text-muted hover:text-text-inverse"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Class / Section Name (e.g. Section A - Morning) *"
                              value={newClassNameInput}
                              onChange={(e) => setNewClassNameInput(e.target.value)}
                              className="bg-slate-900 border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-inverse focus:border-purple-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Description (Optional, e.g. Mon-Wed 10 AM)"
                              value={newClassDescriptionInput}
                              onChange={(e) => setNewClassDescriptionInput(e.target.value)}
                              className="bg-slate-900 border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-inverse focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end mt-4 space-x-3">
                            <button
                              onClick={() => setCreatingClassCourseId(null)}
                              className="px-4 py-2 bg-slate-800 text-text-secondary hover:text-text-inverse rounded-xl text-xs font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCreateClass(course.id)}
                              className="bg-purple-600 hover:bg-purple-500 text-text-inverse px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                            >
                              Create Class
                            </button>
                          </div>
                        </div>
                      )}

                      {(() => {
                        const displayClasses =
                          course.classes && course.classes.length > 0
                            ? course.classes
                            : course.students.length > 0 || course.instructors.length > 0
                            ? [
                                {
                                  id: "default_section",
                                  className: "General Section (Default)",
                                  description:
                                    "Default section containing enrolled students & assigned instructors. Click 'New Class / Section' above to create dedicated sections."
                                }
                              ]
                            : [];

                        if (displayClasses.length === 0) {
                          return (
                            <div className="bg-slate-900/60 rounded-2xl p-10 text-center text-text-muted border border-border/80">
                              <Layers className="w-10 h-10 mx-auto mb-2 opacity-20" />
                              <p className="text-xs font-medium">No classes or sections added yet.</p>
                              <p className="text-[11px] text-text-secondary mt-1">
                                Click &quot;New Class / Section&quot; above to create Section A, Class 101, etc.
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 gap-6">
                            {displayClasses.map((cls, idx) => {
                              const isFirstClass = idx === 0;
                              const classStudents = course.students.filter(
                                (s) =>
                                  s.classId === cls.id ||
                                  (isFirstClass && !s.classId) ||
                                  cls.id === "default_section"
                              );
                              const classInstructors = course.instructors.filter(
                                (i) =>
                                  i.classId === cls.id ||
                                  (isFirstClass && !i.classId) ||
                                  cls.id === "default_section"
                              );
                              const cTab = activeClassTab[cls.id] || "students";
                              const isMinimized = minimizedClasses[cls.id] !== false;
                              const q = (searchQuery[`${course.id}_${cls.id}`] || "").toLowerCase();
                              const filteredStudents = classStudents.filter(
                                (student) =>
                                  student.name.toLowerCase().includes(q) ||
                                  student.email.toLowerCase().includes(q) ||
                                  (student.regNum && student.regNum.toLowerCase().includes(q))
                              );

                              return (
                                <div
                                  key={cls.id}
                                  className="bg-slate-900/80 border border-border/80 rounded-2xl p-6 shadow-md transition-all hover:border-purple-500/30"
                                >
                                  {/* Class Card Header */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                                    <div>
                                      <h6 className="text-base font-bold text-text-inverse flex items-center">
                                        <Layers className="w-4 h-4 mr-2 text-purple-400" />
                                        {cls.className}
                                      </h6>
                                      {cls.description && (
                                        <p className="text-xs text-text-muted mt-1">
                                          {cls.description}
                                        </p>
                                      )}
                                      <div className="flex items-center space-x-3 mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                          {classStudents.length} Students
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-blue-300 border border-primary/20">
                                          {classInstructors.length} Instructors
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 self-start md:self-center">
                                      <button
                                        onClick={() =>
                                          setMinimizedClasses((prev) => ({
                                            ...prev,
                                            [cls.id]: prev[cls.id] === false ? true : false
                                          }))
                                        }
                                        className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-text-secondary hover:text-text-inverse rounded-xl text-xs font-bold transition-all flex items-center shadow-sm border border-border/60"
                                        title={
                                          isMinimized
                                            ? "Show student & instructor details"
                                            : "Minimize details"
                                        }
                                      >
                                        {isMinimized ? (
                                          <>
                                            <ChevronDown className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                                            Show Details
                                          </>
                                        ) : (
                                          <>
                                            <ChevronUp className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                                            Minimize
                                          </>
                                        )}
                                      </button>

                                      {cls.id !== "default_section" && (
                                        <button
                                          onClick={() => handleDeleteClass(course.id, cls.id)}
                                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-text-inverse rounded-xl text-xs font-bold transition-all flex items-center"
                                          title="Delete this Class"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                                          Delete Class
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {!isMinimized && (
                                    <>
                                      {/* Class Card Tabs & Actions */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex space-x-4 border-b border-border/80 pb-2">
                                          <button
                                            onClick={() =>
                                              setActiveClassTab((prev) => ({
                                                ...prev,
                                                [cls.id]: "students"
                                              }))
                                            }
                                            className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all ${
                                              cTab === "students"
                                                ? "border-purple-500 text-purple-400"
                                                : "border-transparent text-text-muted hover:text-text-secondary"
                                            }`}
                                          >
                                            Enrolled Students ({classStudents.length})
                                          </button>
                                          <button
                                            onClick={() =>
                                              setActiveClassTab((prev) => ({
                                                ...prev,
                                                [cls.id]: "instructors"
                                              }))
                                            }
                                            className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all ${
                                              cTab === "instructors"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-text-muted hover:text-text-secondary"
                                            }`}
                                          >
                                            Assigned Instructors ({classInstructors.length})
                                          </button>
                                        </div>

                                        {cTab === "students" ? (
                                          <div className="flex items-center space-x-2">
                                            <button
                                              onClick={() => triggerCsvInput(course.id, cls.id === "default_section" ? undefined : cls.id)}
                                              className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-text-inverse px-3 py-1.5 rounded-xl text-xs font-bold flex items-center border border-indigo-500/30 transition-all"
                                            >
                                              <Upload className="w-3 h-3 mr-1" />
                                              Import CSV
                                            </button>
                                            <button
                                              onClick={() => {
                                                setTargetClassId(cls.id === "default_section" ? null : cls.id);
                                                setAddingStudentCourseId(course.id);
                                              }}
                                              className="bg-primary hover:bg-primary text-text-inverse px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-md transition-all"
                                            >
                                              <Plus className="w-3 h-3 mr-1" />
                                              Add Student
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setTargetClassId(cls.id === "default_section" ? null : cls.id);
                                              setAssigningToCourseId(course.id);
                                            }}
                                            className="bg-primary hover:bg-primary text-text-inverse px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-md transition-all"
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Assign Instructor
                                          </button>
                                        )}
                                      </div>

                                      {/* Class Students View */}
                                      {cTab === "students" && (
                                        <div>
                                          <div className="mb-4 relative max-w-sm">
                                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
                                            <input
                                              type="text"
                                              value={searchQuery[`${course.id}_${cls.id}`] || ""}
                                              onChange={(e) =>
                                                setSearchQuery((prev) => ({
                                                  ...prev,
                                                  [`${course.id}_${cls.id}`]: e.target.value
                                                }))
                                              }
                                              placeholder="Search students by name, email, roll no..."
                                              className="w-full bg-slate-950/80 border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-text-inverse focus:border-purple-500 focus:outline-none"
                                            />
                                          </div>

                                          {filteredStudents.length === 0 ? (
                                            <p className="text-xs text-text-muted italic py-2">
                                              {searchQuery[`${course.id}_${cls.id}`]
                                                ? "No students match your search."
                                                : "No students enrolled in this class yet. Click \"Add Student\" or \"Import CSV\" above."}
                                            </p>
                                          ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                              {filteredStudents.map((student) => (
                                                <div
                                                  key={student.id}
                                                  className="bg-slate-950/60 border border-border rounded-xl p-3 flex items-center justify-between"
                                                >
                                                  <div className="min-w-0 flex-1">
                                                    <h6 className="text-xs font-bold text-text-inverse truncate">
                                                      {student.name}
                                                    </h6>
                                                    <p className="text-[11px] text-text-muted truncate">
                                                      {student.email}
                                                    </p>
                                                    {student.regNum && (
                                                      <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-mono">
                                                        Reg: {student.regNum}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <button
                                                    onClick={() =>
                                                      handleRemoveStudent(course.id, student.id)
                                                    }
                                                    className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-text-inverse rounded-lg transition-colors ml-2"
                                                    title="Remove student"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Class Instructors View */}
                                      {cTab === "instructors" && (
                                        <div>
                                          {classInstructors.length === 0 ? (
                                            <p className="text-xs text-text-muted italic py-2">
                                              No instructors assigned to this class yet. Click &quot;Assign Instructor&quot; above.
                                            </p>
                                          ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                              {classInstructors.map((inst) => (
                                                <div
                                                  key={inst.id}
                                                  className="bg-slate-950/60 border border-border rounded-xl p-3 flex items-center justify-between"
                                                >
                                                  <div className="min-w-0 flex-1">
                                                    <div className="flex items-center space-x-2">
                                                      <h6 className="text-xs font-bold text-text-inverse truncate">
                                                        {inst.name}
                                                      </h6>
                                                      {inst.domain && (
                                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md font-semibold">
                                                          {inst.domain}
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-[11px] text-text-muted truncate mt-0.5">
                                                      {inst.email}
                                                    </p>
                                                    {inst.phone && (
                                                      <p className="text-[10px] text-text-muted mt-1 font-mono">
                                                        📞 {inst.phone}
                                                      </p>
                                                    )}
                                                  </div>
                                                  <button
                                                    onClick={() =>
                                                      handleRemoveInstructor(course.id, inst.id)
                                                    }
                                                    className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-text-inverse rounded-lg transition-colors ml-2"
                                                    title="Remove instructor"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
