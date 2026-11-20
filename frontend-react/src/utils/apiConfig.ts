
import axios from "axios";

/**
 * Centralized API base URL configuration for local development and Vercel production deployment.
 */
let rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://codesklii-backend-production.up.railway.app" : "http://localhost:5000");

// Fix legacy or misconfigured Railway URLs that omit '.up.'
if (rawUrl.includes("codesklii-backend-production.railway.app")) {
  rawUrl = rawUrl.replace("codesklii-backend-production.railway.app", "codesklii-backend-production.up.railway.app");
}

export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

// Set a global 15-second timeout on all Axios requests to prevent UI hanging when the network or backend is slow/cold
axios.defaults.timeout = 15000;

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
