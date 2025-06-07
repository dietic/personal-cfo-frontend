"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserLogin, UserCreate, Token } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Helper function to decode JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: UserLogin) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Try to refresh token to validate it's still valid
          await apiClient.refreshToken();
          // Get user email from JWT token
          const token = apiClient.getToken();
          if (token) {
            const payload = decodeJWT(token);
            const email = payload?.sub || "user@example.com";
            setUser({
              id: "current-user",
              email: email,
              is_active: true,
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        // Token is invalid, clear it
        console.error("Auth initialization error:", error);
        apiClient.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: UserLogin) => {
    try {
      setIsLoading(true);
      const tokenResponse = await apiClient.login(data);

      // Create user object from login data since backend doesn't have /me endpoint
      setUser({
        id: "current-user",
        email: data.email,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.data?.detail || "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserCreate) => {
    try {
      setIsLoading(true);
      await apiClient.register(data);

      // After registration, log the user in
      await login({ email: data.email, password: data.password });

      toast.success("Registration successful!");
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error.response?.data?.detail || "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

  const refreshToken = async () => {
    try {
      await apiClient.refreshToken();
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
