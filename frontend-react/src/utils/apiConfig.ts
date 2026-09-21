/**
 * Centralized API base URL configuration for local development and Vercel production deployment.
 */
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

/**
 * Helper to construct full API endpoints safely.
 * @param path relative path starting with /api/...
 */
export const getApiUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
