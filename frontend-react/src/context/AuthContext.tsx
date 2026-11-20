import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
      // Join user room for receiving events
      socket.emit("join-user-room", user.id);
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
  }, [user?.id, navigate]);

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
