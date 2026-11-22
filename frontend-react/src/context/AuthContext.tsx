import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "../utils/apiConfig";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "COLLEGE_ADMIN" | string;
  profile?: {
    firstName: string;
    lastName: string;
    dailyStreak: number;
    totalSolved: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Load from local storage on mount
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed?.email) {
          import("../utils/userProgressSync").then(({ fetchUserProgressFromDB }) => {
            fetchUserProgressFromDB(parsed.email).catch(() => {});
          });
        }
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setIsLoading(false);
  }, []);

  // Socket.IO connection for force-logout detection
  useEffect(() => {
    if (!user?.id) {
      // Disconnect socket if user is null
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Determine socket URL from API URL
    const apiUrl = getApiUrl("");
    const socketUrl = apiUrl.replace(/\/+$/, ""); // Remove trailing slash

    // Create socket connection
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Join user room for receiving events (by id and email)
      socket.emit("join-user-room", user.id);
      if (user.email) {
        socket.emit("join-user-room", user.email.toLowerCase().trim());
      }
    });

    // Listen for force-logout event (another device logged in)
    socket.on("force-logout", (data: { message: string }) => {
      const msg = data?.message || "Your account has been logged in on another device.";
      // Clear credentials
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);

      // Navigate to login with the force-logout message
      navigate("/login", { state: { forceLogoutMessage: msg } });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, user?.email, navigate]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCheckedRef = useRef<number>(0);

  // Optimized Active Session Validation with WebSocket-first fallback & AbortController
  useEffect(() => {
    if (!token || !user) return;

    let isChecking = false;
    const checkActiveSession = async (force = false) => {
      if (isChecking) return;
      const now = Date.now();

      // Throttle: don't check more than once every 30 seconds unless explicitly forced
      if (!force && now - lastCheckedRef.current < 30_000) {
        return;
      }

      // If WebSockets is actively connected and healthy, socket server emits real-time force-logout.
      // A passive fallback check every 60 seconds is more than sufficient.
      if (socketRef.current?.connected && !force && now - lastCheckedRef.current < 60_000) {
        return;
      }

      isChecking = true;
      lastCheckedRef.current = now;

      // Abort any prior in-flight session-status check to prevent hanging/stale requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await axios.get(getApiUrl("/api/v1/auth/session-status"), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          timeout: 5000, // Safe 5-second timeout prevents 15s hanging
        });
      } catch (err: any) {
        if (axios.isCancel(err) || err?.name === "CanceledError" || err?.name === "AbortError") {
          return; // Request was aborted cleanly on navigation or unmount
        }
        const status = err.response?.status;
        const errorData = err.response?.data;
        if (
          status === 401 ||
          errorData?.code === "SESSION_REVOKED" ||
          errorData?.error?.includes("another device")
        ) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          navigate("/login", {
            state: {
              forceLogoutMessage:
                errorData?.error || "Your account has been logged in on another device.",
            },
          });
        }
      } finally {
        isChecking = false;
      }
    };

    // Throttled check when window/tab regains focus
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        checkActiveSession(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // Passive 60-second fallback polling interval (instead of aggressive 3s)
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkActiveSession(false);
      }
    }, 60_000);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [token, user?.id, navigate]);

  useEffect(() => {
    let isRedirecting = false;
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;

          // Handle session revoked (single-device enforcement)
          if (
            (status === 401 && errorData?.code === "SESSION_REVOKED") ||
            (status === 401 && errorData?.error?.includes("another device"))
          ) {
            const hadToken = Boolean(localStorage.getItem("accessToken"));
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);

            if (hadToken && !isRedirecting && window.location.pathname !== "/login") {
              isRedirecting = true;
              navigate("/login", {
                state: {
                  forceLogoutMessage:
                    errorData?.error || "Your account has been logged in on another device.",
                },
              });
              setTimeout(() => {
                isRedirecting = false;
              }, 2000);
            }
            return Promise.reject(error);
          }

          // Handle standard 401/403 (expired token, etc.)
          if (
            status === 401 ||
            (status === 403 &&
              errorData?.error === "Invalid or expired access token")
          ) {
            const hadToken = Boolean(localStorage.getItem("accessToken"));
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);

            if (hadToken && !isRedirecting && window.location.pathname !== "/login") {
              isRedirecting = true;
              navigate("/login");
              setTimeout(() => {
                isRedirecting = false;
              }, 2000);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    // Clear any previous user's query cache to ensure strict account isolation
    queryClient.clear();
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);

    // Immediately synchronize database progress to this device
    if (userData?.email) {
      import("../utils/userProgressSync").then(({ fetchUserProgressFromDB }) => {
        fetchUserProgressFromDB(userData.email).catch(() => {});
      });
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axios.post(getApiUrl("/api/v1/auth/logout"), { refreshToken }).catch(() => {});
      }
    } finally {
      queryClient.clear();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
