"use client";

import { apiClient } from "@/lib/api-client";
import {
  clearPendingVerification,
  setPendingVerification,
} from "@/lib/auth-constants";
import { User, UserCreate, UserLogin } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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

function normalizeUser(partial: Partial<User>): User {
  return {
    id: partial.id ?? "current-user",
    email: partial.email ?? "user@example.com",
    first_name: partial.first_name,
    last_name: partial.last_name,
    name: partial.name,
    phone_number: partial.phone_number,
    profile_picture_url: partial.profile_picture_url,
    preferred_currency: partial.preferred_currency ?? "PEN",
    timezone: partial.timezone ?? "America/Lima",
    is_active: partial.is_active ?? true,
    is_admin: partial.is_admin ?? false,
    created_at: partial.created_at ?? new Date().toISOString(),
    updated_at: partial.updated_at,
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    data: UserLogin,
    opts?: { suppressToasts?: boolean }
  ) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Validate/refresh token
          await apiClient.refreshToken();
          // Try to fetch full profile (to get is_admin)
          try {
            const profile = await apiClient.getUserProfile();
            setUser(normalizeUser(profile));
            // If user is not active (email not verified), enforce OTP flow
            if (profile && profile.is_active === false && profile.email) {
              setPendingVerification(profile.email);
              router.replace(
                `/signup?step=otp&email=${encodeURIComponent(profile.email)}`
              );
              return;
            }
          } catch (profileErr) {
            console.warn(
              "Failed to fetch profile; using JWT fallback",
              profileErr
            );
            // Fallback to minimal user decoded from JWT
            const token = apiClient.getToken();
            if (token) {
              const payload = decodeJWT(token);
              const email = payload?.sub || "user@example.com";
              const name =
                payload?.name || payload?.username || payload?.full_name;
              setUser(
                normalizeUser({
                  email,
                  name,
                })
              );
            }
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

  const login = useCallback(
    async (data: UserLogin, opts?: { suppressToasts?: boolean }) => {
      const showToasts = !(opts && opts.suppressToasts);
      try {
        setIsLoading(true);
        await apiClient.login(data);

        // After login, try to fetch full profile
        try {
          const profile = await apiClient.getUserProfile();
          setUser(normalizeUser(profile));

          // If user isn't active yet, enforce OTP flow
          if (profile && profile.is_active === false) {
            const emailToUse = profile.email || data.email;
            setPendingVerification(emailToUse);
            if (showToasts)
              toast.message("Please verify your email to continue.");
            router.push(
              `/signup?step=otp&email=${encodeURIComponent(emailToUse)}`
            );
            return;
          }
        } catch (profileErr: any) {
          // If profile fetch fails due to unverified account, mark pending and redirect to OTP
          const status = profileErr?.response?.status;
          if (status === 403 || status === 401) {
            setPendingVerification(data.email);
            if (showToasts)
              toast.message("Please verify your email to continue.");
            router.push(
              `/signup?step=otp&email=${encodeURIComponent(data.email)}`
            );
            return;
          }
          console.warn(
            "Failed to fetch profile post-login; using JWT fallback",
            profileErr
          );
          // Fallback to minimal user from JWT
          const token = apiClient.getToken();
          let name: string | undefined;
          if (token) {
            const payload = decodeJWT(token);
            name = payload?.name || payload?.username || payload?.full_name;
          }
          setUser(
            normalizeUser({
              email: data.email,
              name,
            })
          );
        }

        // Clear any pending verification flag on successful login/profile fetch
        clearPendingVerification();
        if (showToasts) toast.success("Login successful!");
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Login error:", error);
        const status = error?.response?.status || error?.status;
        if (status === 403) {
          // Backend blocks unverified users from logging in
          setPendingVerification(data.email);
          if (showToasts)
            toast.message(
              "Your account is not verified. Enter the code we emailed to activate it."
            );
          router.push(
            `/signup?step=otp&email=${encodeURIComponent(data.email)}`
          );
          return;
        }
        if (status === 400 || status === 401) {
          if (showToasts) toast.error("Invalid credentials");
          throw new Error("Invalid credentials");
        }
        const message =
          error.response?.data?.detail || error.message || "Login failed";
        if (showToasts) toast.error(message);
        // Re-throw for forms
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(async (data: UserCreate) => {
    try {
      setIsLoading(true);
      await apiClient.register(data);
      // Mark pending verification and don't log in automatically
      setPendingVerification(data.email);
      toast.success(
        "Account created. Check your email for the verification code."
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error.response?.data?.detail || "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
    clearPendingVerification();
    router.push("/login");
    toast.success("Logged out successfully");
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      await apiClient.refreshToken();
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshToken,
    }),
    [user, isLoading, isAuthenticated, login, register, logout, refreshToken]
  );

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
