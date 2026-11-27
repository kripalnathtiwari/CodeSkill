import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  StickyNote,
  Trash2,
  Loader,
  Upload,
  FileText,
  Pencil,
  X,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";

interface AdminProfileSummary {
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export interface GlobalNoteListItem {
  id: string;
  title: string;
  courseName?: string | null;
  pdfUrl?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  admin?: AdminProfileSummary | null;
}

interface GlobalNoteDetail extends GlobalNoteListItem {
  content?: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QueryParamsState {
  page: number;
  search: string;
}

const NOTES_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
});

const getDownloadHref = (pdfUrl: string): string => {
  if (pdfUrl.includes("res.cloudinary.com") && !pdfUrl.includes("/fl_attachment")) {
    return pdfUrl.replace("/upload/", "/upload/fl_attachment/");
  }
  return pdfUrl;
};

const isValidHttpUrl = (value: string): boolean => {
  if (!value.trim()) return true;
  if (value.trim().startsWith("/public/")) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: string }>(err)) {
    return err.response?.data?.error || err.message || fallback;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
};

interface NoteCardProps {
  note: GlobalNoteListItem;
  isLoadingEdit: boolean;
  isDeleting: boolean;
  onEdit: (noteId: string) => void;
  onDelete: (note: GlobalNoteListItem) => void;
}

const NoteListCard = memo(function NoteListCard({
  note,
  isLoadingEdit,
  isDeleting,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const authorName = [note.admin?.profile?.firstName, note.admin?.profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div className="bg-white dark:bg-[#1a2333] border border-border rounded-xl p-5 sm:p-6 hover:border-primary/30 transition-colors shadow-sm relative group flex flex-col sm:flex-row gap-5 items-start">
      {note.imageUrl && (
        <div className="w-full sm:w-44 h-32 shrink-0 rounded-xl overflow-hidden self-start border border-border bg-slate-100 dark:bg-slate-800">
          <img
            src={note.imageUrl}
            alt={note.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0 w-full">
        <div className="flex justify-between items-start gap-3 pr-20">
          <div className="min-w-0">
            <h5
              className="font-bold text-text-primary text-lg sm:text-xl truncate"
              title={note.title}
            >
              {note.title}
            </h5>
            {note.courseName && (
              <span className="inline-block mt-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded">
                {note.courseName}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 absolute top-5 right-5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(note.id)}
            disabled={isLoadingEdit || isDeleting}
            className="text-text-muted hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors bg-white/90 dark:bg-slate-900/90 border border-border/60 disabled:opacity-50"
            title="Edit Note"
            aria-label={`Edit ${note.title}`}
          >
            {isLoadingEdit ? (
              <Loader className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            disabled={isDeleting || isLoadingEdit}
            className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors bg-white/90 dark:bg-slate-900/90 border border-border/60 disabled:opacity-50"
            title="Delete Note"
            aria-label={`Delete ${note.title}`}
          >
            {isDeleting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {note.pdfUrl && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={note.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Attached PDF
            </a>
            <a
              href={getDownloadHref(note.pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              download={`${note.title.replace(/\s+/g, "_")}.pdf`}
              className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </a>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-border/50 text-xs sm:text-sm text-text-muted flex justify-between items-center flex-wrap gap-2">
          <span>Posted on {new Date(note.createdAt).toLocaleDateString()}</span>
          {authorName && (
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold truncate">
              By: {authorName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default function NotesManagement() {
  const [notes, setNotes] = useState<GlobalNoteListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: NOTES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  // Single combined query state prevents duplicate GETs when resetting page on search change
  const [queryParams, setQueryParams] = useState<QueryParamsState>({
    page: 1,
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  // Form state
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // UI status state
  const [isFetchingNotes, setIsFetchingNotes] = useState(true);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailAbortRef = useRef<AbortController | null>(null);

  // 400ms debounce for server-side search; resets page to 1 atomically when search changes
  useEffect(() => {
    const trimmed = searchInput.trim();
    const timer = window.setTimeout(() => {
      setQueryParams((prev) => {
        if (prev.search === trimmed) return prev;
        return { page: 1, search: trimmed };
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Paginated list fetch with AbortController
  useEffect(() => {
    const controller = new AbortController();

    const loadNotes = async () => {
      setIsFetchingNotes(true);
      setListError(null);
      try {
        const res = await axios.get(getApiUrl("/api/v1/notes/admin/global-notes"), {
          params: {
            page: queryParams.page,
            limit: NOTES_PER_PAGE,
            ...(queryParams.search ? { search: queryParams.search } : {}),
          },
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        const payload = res.data;
        setNotes(Array.isArray(payload?.data) ? payload.data : []);
        if (payload?.pagination) {
          setPagination(payload.pagination);
        }
      } catch (err: unknown) {
        if (axios.isCancel(err) || (err instanceof Error && err.name === "CanceledError")) return;
        setListError(extractErrorMessage(err, "Failed to load global notes."));
      } finally {
        if (!controller.signal.aborted) {
          setIsFetchingNotes(false);
        }
      }
    };

    void loadNotes();
    return () => controller.abort();
  }, [queryParams.page, queryParams.search, refreshTick]);

  // Abort pending edit detail lookup on unmount
  useEffect(() => {
    return () => {
      detailAbortRef.current?.abort();
    };
  }, []);

  const resetForm = useCallback(() => {
    detailAbortRef.current?.abort();
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewCourseName("");
    setImageUrl("");
    setPdfUrl("");
    setExistingPdfUrl(null);
    setPdfFile(null);
    setEditingNoteId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setFeedback({ type: "error", message: "Only valid .pdf documents are allowed." });
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_PDF_SIZE_BYTES) {
      setFeedback({ type: "error", message: "PDF file must be 20MB or smaller." });
      e.target.value = "";
      return;
    }

    setFeedback(null);
    setPdfFile(selected);
  };

  const handleSubmitNote = async () => {
    if (isSubmittingNote) return;

    const trimmedTitle = newNoteTitle.trim();
    if (!trimmedTitle) {
      setFeedback({ type: "error", message: "Note title is required." });
      return;
    }

    if (!isValidHttpUrl(imageUrl)) {
      setFeedback({ type: "error", message: "Cover Image URL must be a valid http/https URL." });
      return;
    }

    if (!isValidHttpUrl(pdfUrl)) {
      setFeedback({ type: "error", message: "PDF URL must be a valid http/https URL." });
      return;
    }

    setIsSubmittingNote(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("content", newNoteContent);
      formData.append("courseName", newCourseName.trim());
      if (imageUrl.trim()) formData.append("imageUrl", imageUrl.trim());

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      } else if (pdfUrl.trim()) {
        formData.append("pdfUrl", pdfUrl.trim());
      } else if (editingNoteId && existingPdfUrl && !pdfUrl.trim()) {
        // Explicit user clearing of an existing PDF link without choosing a replacement
        formData.append("clearPdf", "true");
      }

      if (editingNoteId) {
        const res = await axios.put(
          getApiUrl(`/api/v1/notes/admin/notes/${editingNoteId}`),
          formData,
          { headers: getAuthHeaders() }
        );
        const updated: GlobalNoteListItem | undefined = res.data?.data;
        if (updated) {
          setNotes((prev) => prev.map((n) => (n.id === editingNoteId ? updated : n)));
        }
        setFeedback({ type: "success", message: "Note updated successfully." });
        resetForm();
      } else {
        await axios.post(getApiUrl("/api/v1/notes/admin/global-notes"), formData, {
          headers: getAuthHeaders(),
        });
        setFeedback({ type: "success", message: "Global note published successfully." });
        resetForm();
        setQueryParams((prev) => ({ ...prev, page: 1 }));
        setRefreshTick((t) => t + 1);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: extractErrorMessage(err, "Failed to save note. Please try again."),
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Lazy-load full note details (including `content`) only when admin clicks Edit
  const handleEditNote = useCallback(async (noteId: string) => {
    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;

    setLoadingEditId(noteId);
    setFeedback(null);

    try {
      const res = await axios.get(getApiUrl(`/api/v1/notes/admin/notes/${noteId}`), {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      const detail: GlobalNoteDetail | undefined = res.data?.data;
      if (!detail) {
        throw new Error("Note details missing in server response");
      }

      setNewNoteTitle(detail.title || "");
      setNewNoteContent(detail.content || "");
      setNewCourseName(detail.courseName || "");
      setImageUrl(detail.imageUrl || "");
      setPdfUrl(detail.pdfUrl || "");
      setExistingPdfUrl(detail.pdfUrl || null);
      setEditingNoteId(detail.id);
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (axios.isCancel(err) || (err instanceof Error && err.name === "CanceledError")) return;
      setFeedback({
        type: "error",
        message: extractErrorMessage(err, "Failed to load note details for editing."),
      });
    } finally {
      if (!controller.signal.aborted) {
        setLoadingEditId(null);
      }
    }
  }, []);

  const handleDeleteNote = useCallback(
    async (note: GlobalNoteListItem) => {
      if (!window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
        return;
      }

      setDeletingNoteId(note.id);
      setFeedback(null);

      try {
        await axios.delete(getApiUrl(`/api/v1/notes/admin/notes/${note.id}`), {
          headers: getAuthHeaders(),
        });

        if (editingNoteId === note.id) {
          resetForm();
        }

        setFeedback({ type: "success", message: "Note deleted successfully." });

        // Handle deletion of the last item on a page cleanly
        if (notes.length <= 1 && queryParams.page > 1) {
          setQueryParams((prev) => ({
            ...prev,
            page: Math.max(1, prev.page - 1),
          }));
        } else {
          setRefreshTick((t) => t + 1);
        }
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message: extractErrorMessage(err, "Failed to delete note."),
        });
      } finally {
        setDeletingNoteId(null);
      }
    },
    [editingNoteId, notes.length, queryParams.page, resetForm]
  );

  const handlePageChange = (nextPage: number) => {
    if (isFetchingNotes) return;
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === queryParams.page) return;
    setQueryParams((prev) => ({ ...prev, page: nextPage }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex-1 bg-surface dark:bg-[#111827] border border-border rounded-2xl flex flex-col overflow-hidden shadow-xl max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center">
            <StickyNote className="w-6 h-6 mr-3 text-primary shrink-0" />
            Global Notes Management
          </h2>
          <span className="text-xs font-semibold text-text-muted bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            {pagination.total} total {pagination.total === 1 ? "note" : "notes"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">
          {/* Status Banner */}
          {feedback && (
            <div
              role="alert"
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                feedback.type === "error"
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {feedback.type === "error" ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Create / Edit Note Form */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 sm:p-6 rounded-xl border border-border space-y-4 relative">
            {editingNoteId && (
              <button
                type="button"
                onClick={resetForm}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text-primary bg-white dark:bg-slate-900 border border-border rounded-lg transition-colors"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
                Cancel Edit
              </button>
            )}

            <h4 className="font-semibold text-text-primary text-lg pr-28">
              {editingNoteId ? "Edit Global Note" : "Add New Global Note"}
            </h4>
            <p className="text-sm text-text-muted">
              {editingNoteId
                ? "Update note metadata, content, or attach a replacement PDF."
                : "Published notes become visible to all students on the platform."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  maxLength={250}
                  placeholder="Note Title *"
                  className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Course Name (Optional)
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  maxLength={120}
                  placeholder="Course Name (Optional)"
                  className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  PDF Document URL from Cloudinary (or Direct PDF Link)
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/.../document.pdf"
                  className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted mt-1 block">
                  {editingNoteId && existingPdfUrl && !pdfFile
                    ? "Existing PDF is preserved unless you upload a replacement PDF or clear this URL."
                    : "Paste a Cloudinary PDF URL or upload a PDF file below."}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Note content... (Optional if PDF is uploaded)"
              rows={4}
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary resize-y"
            />

            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#1a2333] border border-border rounded-lg p-3">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center text-sm font-medium text-text-secondary hover:text-primary transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select PDF Document
              </button>
              <span className="text-sm text-text-muted truncate flex-1 min-w-0">
                {pdfFile
                  ? `${pdfFile.name} (${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)`
                  : editingNoteId
                    ? "Select new PDF to replace existing (Optional)"
                    : "No file selected (Optional, max 20MB)"}
              </span>
              {pdfFile && (
                <button
                  type="button"
                  onClick={() => {
                    setPdfFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Remove File
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitNote}
                disabled={isSubmittingNote}
                className="bg-primary hover:bg-primary/90 text-text-inverse px-6 py-2.5 rounded-lg text-sm font-bold w-full sm:w-auto transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmittingNote ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : editingNoteId ? (
                  <Pencil className="w-4 h-4 mr-2" />
                ) : (
                  <StickyNote className="w-4 h-4 mr-2" />
                )}
                {isSubmittingNote
                  ? editingNoteId
                    ? "Saving..."
                    : "Publishing..."
                  : editingNoteId
                    ? "Save Changes"
                    : "Publish Global Note"}
              </button>

              {editingNoteId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmittingNote}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Notes List Section */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-3 gap-4">
              <div>
                <h4 className="font-semibold text-xl text-text-primary">All Global Notes</h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} notes)
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by title or course..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {listError ? (
              <div className="text-center py-12 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                  {listError}
                </p>
                <button
                  type="button"
                  onClick={() => setRefreshTick((t) => t + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 border border-border hover:border-primary/40"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            ) : isFetchingNotes ? (
              <div className="flex justify-center py-14">
                <Loader className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-border">
                <StickyNote className="w-14 h-14 text-text-muted/30 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-text-primary mb-1">No global notes found</h3>
                <p className="text-sm text-text-muted font-medium">
                  {queryParams.search
                    ? `No notes match "${queryParams.search}".`
                    : "Create one above to share with students."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {notes.map((note) => (
                  <NoteListCard
                    key={note.id}
                    note={note}
                    isLoadingEdit={loadingEditId === note.id}
                    isDeleting={deletingNoteId === note.id}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                <span className="text-xs sm:text-sm text-text-muted font-medium">
                  Showing page <strong className="text-text-primary">{pagination.page}</strong> of{" "}
                  <strong className="text-text-primary">{pagination.totalPages}</strong> (
                  {pagination.total} total)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(queryParams.page - 1)}
                    disabled={queryParams.page <= 1 || isFetchingNotes}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm font-semibold text-text-primary hover:border-primary/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(queryParams.page + 1)}
                    disabled={queryParams.page >= pagination.totalPages || isFetchingNotes}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm font-semibold text-text-primary hover:border-primary/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
