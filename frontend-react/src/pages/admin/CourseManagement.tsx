import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Image as ImageIcon, AlertTriangle, X, Save, ArrowLeft, Lock } from "lucide-react";
import { COURSES_DATA } from "../../data/coursesData";

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>(Object.values(COURSES_DATA));
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State (shared between create & edit)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("summer");
  const [price, setPrice] = useState("₹2,999");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [duration, setDuration] = useState("4 Weeks");
  const [level, setLevel] = useState("Beginner to Advanced");
  const [language, setLanguage] = useState("English");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [publishStatus, setPublishStatus] = useState("DRAFT");
  const [seoTitle, setSeoTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [skillsYouWillLearn, setSkillsYouWillLearn] = useState("");
  const [techStack, setTechStack] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("admin_custom_courses");
    if (saved) {
      setCourses([...Object.values(COURSES_DATA), ...JSON.parse(saved)]);
    }
  }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory("summer");
    setPrice("₹2,999"); setImage(""); setTags("");
    setDuration("4 Weeks"); setLevel("Beginner to Advanced");
    setLanguage("English"); setVisibility("PUBLIC"); setPublishStatus("DRAFT");
    setSeoTitle(""); setOverview(""); setSkillsYouWillLearn(""); setTechStack("");
  };

  const openCreate = () => {
    resetForm();
    setEditingCourse(null);
    setIsCreating(true);
  };

  const openEdit = (course: any) => {
    setTitle(course.title || "");
    setDescription(course.description || "");
    setCategory(course.category || "summer");
    setPrice(course.price || "₹2,999");
    setImage(course.image || "");
    setTags(Array.isArray(course.tags) ? course.tags.join(", ") : (course.tags || ""));
    setDuration(course.duration || "4 Weeks");
    setLevel(course.level || "Beginner to Advanced");
    setLanguage(course.language || "English");
    setVisibility(course.visibility || "PUBLIC");
    setPublishStatus(course.publishStatus || "DRAFT");
    setSeoTitle(course.seoTitle || "");
    setOverview(course.overview || "");
    setSkillsYouWillLearn(Array.isArray(course.skillsYouWillLearn) ? course.skillsYouWillLearn.join(", ") : (course.skillsYouWillLearn || ""));
    setTechStack(Array.isArray(course.techStack) ? course.techStack.join(", ") : (course.techStack || ""));
    setEditingCourse(course);
    setIsCreating(true);
  };

  const isDefaultCourse = (id: string) => !id?.toString().startsWith("course-");

  const handleSave = () => {
    if (!title || !description || !price) return alert("Please fill all required fields!");

    if (editingCourse && !isDefaultCourse(editingCourse.id)) {
      // UPDATE existing custom course
      const saved = localStorage.getItem("admin_custom_courses");
      const existingCustom = saved ? JSON.parse(saved) : [];
      const updatedCustom = existingCustom.map((c: any) =>
        c.id === editingCourse.id
          ? { ...c, title, description, category, price, image: image || c.image, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean), duration, level, language, visibility, publishStatus, seoTitle, overview, skillsYouWillLearn: skillsYouWillLearn.split(",").map((t: string) => t.trim()).filter(Boolean), techStack: techStack.split(",").map((t: string) => t.trim()).filter(Boolean) }
          : c
      );
      localStorage.setItem("admin_custom_courses", JSON.stringify(updatedCustom));
      setCourses([...Object.values(COURSES_DATA), ...updatedCustom]);
    } else if (!editingCourse) {
      // CREATE new course
      const newCourse = {
        id: "course-" + Date.now(),
        title, description, category, price,
        image: image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        students: 0, rating: 5.0, duration, level,
        features: ["Live Sessions", "Certificate", "Projects"],
        language, visibility, publishStatus, seoTitle, overview,
        skillsYouWillLearn: skillsYouWillLearn.split(",").map((t: string) => t.trim()).filter(Boolean),
        techStack: techStack.split(",").map((t: string) => t.trim()).filter(Boolean)
      };
      const saved = localStorage.getItem("admin_custom_courses");
      const existingCustom = saved ? JSON.parse(saved) : [];
      const updatedCustom = [...existingCustom, newCourse];
      localStorage.setItem("admin_custom_courses", JSON.stringify(updatedCustom));
      setCourses([...Object.values(COURSES_DATA), ...updatedCustom]);
    }

    setIsCreating(false);
    setEditingCourse(null);
    resetForm();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCourse(null);
    resetForm();
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => setDeleteConfirmId(id);

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    if (!isDefaultCourse(deleteConfirmId)) {
      const saved = localStorage.getItem("admin_custom_courses");
      if (saved) {
        const updatedCustom = JSON.parse(saved).filter((c: any) => c.id !== deleteConfirmId);
        localStorage.setItem("admin_custom_courses", JSON.stringify(updatedCustom));
        setCourses([...Object.values(COURSES_DATA), ...updatedCustom]);
      }
    }
    setDeleteConfirmId(null);
  };

  // â”€â”€â”€ Editor View (Create / Edit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isCreating) {
    const isEditingDefault = editingCourse && isDefaultCourse(editingCourse.id);
    const isEditMode = !!editingCourse;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-text-muted hover:text-text-inverse transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {isEditMode
                  ? isEditingDefault ? "View Course Details" : "Edit Course"
                  : "Create New Course"}
              </h2>
              <p className="text-text-muted text-sm">
                {isEditMode
                  ? isEditingDefault
                    ? "Default courses are read-only. Duplicate to create an editable copy."
                    : "Update the details below and save."
                  : "Fill in the details to add a new course offering."}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-primary border border-border hover:border-slate-500 transition-colors">
              Cancel
            </button>
            {!isEditingDefault && (
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isEditMode ? "Save Changes" : "Create Course"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Read-only notice for default courses */}
        {isEditingDefault && (
          <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              <span className="font-bold">Protected course.</span> Default system courses cannot be edited. You can view the details below.
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Course Title *</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="e.g. Master React in 30 Days"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Category</label>
                <select
                  value={category} onChange={e => setCategory(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="summer">Summer Training</option>
                  <option value="industrial">Industrial Training</option>
                  <option value="featured">Coding</option>
                  <option value="standard">Self-Paced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Price *</label>
                <input
                  type="text" value={price} onChange={e => setPrice(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. ₹2,999"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Duration</label>
                <input
                  type="text" value={duration} onChange={e => setDuration(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. 4 Weeks"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Level</label>
                <select
                  value={level} onChange={e => setLevel(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Beginner to Intermediate</option>
                  <option>Beginner to Advanced</option>
                  <option>Intermediate to Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Tags (Comma Separated)</label>
                <input
                  type="text" value={tags} onChange={e => setTags(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="React, Node.js, Web Dev"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Image URL</label>
                <input
                  type="text" value={image} onChange={e => setImage(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://..."
                />
                {image && (
                  <img src={image} alt="Preview" loading="lazy" className="mt-3 h-28 w-full object-cover rounded-xl border border-border" />
                )}
              </div>
            </div>
            
            {/* Added Fields Row */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Language</label>
                <input
                  type="text" value={language} onChange={e => setLanguage(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. English, Hindi"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Visibility</label>
                <select
                  value={visibility} onChange={e => setVisibility(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="UNLISTED">Unlisted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Publish Status</label>
                <select
                  value={publishStatus} onChange={e => setPublishStatus(e.target.value)}
                  disabled={!!isEditingDefault}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            
            {/* Added Fields Row 2 */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-text-muted mb-2">SEO Title</label>
              <input
                type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                disabled={!!isEditingDefault}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Title optimized for Search Engines"
              />
            </div>
          </div>

          {/* Description â€“ full width */}
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">Description *</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={4}
              disabled={!!isEditingDefault}
              className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="Detailed course description..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">Course Overview</label>
            <textarea
              value={overview} onChange={e => setOverview(e.target.value)}
              rows={4}
              disabled={!!isEditingDefault}
              className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="Provide a high-level overview of the course..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Skills You Will Learn (Comma Separated)</label>
              <input
                type="text" value={skillsYouWillLearn} onChange={e => setSkillsYouWillLearn(e.target.value)}
                disabled={!!isEditingDefault}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g. Problem Solving, Web Development"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Tech Stack (Comma Separated)</label>
              <input
                type="text" value={techStack} onChange={e => setTechStack(e.target.value)}
                disabled={!!isEditingDefault}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g. React, Node.js, MongoDB"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€â”€ List View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-1">Course Management</h2>
          <p className="text-text-muted">Add, edit, or remove platform courses.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Course</span>
        </button>
      </div>

      <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-80">
            <input
              type="text" placeholder="Search courses..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          </div>
          <span className="text-sm font-medium text-text-muted">Total: {filtered.length} courses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white dark:bg-[#1a2333] text-text-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(course => (
                <tr key={course.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {course.image ? <img src={course.image} alt="" loading="lazy" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-text-muted" />}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-semibold">{course.title}</p>
                        <p className="text-xs text-text-muted">{course.duration || "â€”"} Â· {course.level || "â€”"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.category === 'summer' ? 'bg-amber-500/10 text-amber-500' : course.category === 'featured' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-primary">{course.price}</td>
                  <td className="px-6 py-4 text-text-secondary">{course.language || "English"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${course.publishStatus === 'PUBLISHED' ? 'bg-primary/10 text-primary' : course.publishStatus === 'ARCHIVED' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-text-secondary'}`}>
                      {course.publishStatus || "PUBLISHED"}
                    </span>
                    <span className="block text-[10px] text-text-muted mt-1">{course.visibility || "PUBLIC"}</span>
                  </td>
                  <td className="px-6 py-4">{course.students ?? "â€”"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEdit(course)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title={isDefaultCourse(course.id) ? "View details (read-only)" : "Edit Course"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">No courses found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-surface dark:bg-background border border-border dark:border-border rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button onClick={() => setDeleteConfirmId(null)} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-inverse hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>

            {isDefaultCourse(deleteConfirmId) ? (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Protected Course</h3>
                    <p className="mt-1 text-sm text-text-muted">This is a <span className="text-amber-400 font-semibold">default system course</span> and cannot be deleted. Only courses you've created can be removed.</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Close</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Delete Course?</h3>
                    <p className="mt-1 text-sm text-text-muted">This action is <span className="text-rose-400 font-semibold">permanent</span> and cannot be undone. The course will be removed immediately.</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                  <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-text-inverse flex items-center space-x-2 shadow-lg shadow-rose-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Course</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
