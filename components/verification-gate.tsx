"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PENDING_VERIFICATION_KEY = "pcfo.pendingVerificationEmail";

export function VerificationGate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const step = searchParams.get("step");
    const emailParam = searchParams.get("email");
    const isOnOtp = pathname === "/signup" && step === "otp";

    // If already authenticated and active, do not allow staying on OTP screen
    if (isOnOtp && isAuthenticated && user?.is_active !== false) {
      router.replace("/dashboard");
      return;
    }

    // Read pending email from localStorage
    let pendingEmail = "";
    try {
      pendingEmail = localStorage.getItem(PENDING_VERIFICATION_KEY) || "";
    } catch (_) {
      // no-op (SSR or storage disabled)
    }

    // If there's no pending verification email and user is on OTP, kick to login
    if (isOnOtp && !pendingEmail) {
      router.replace("/login");
      return;
    }

    if (!pendingEmail) return; // nothing else to enforce

    // Allow landing, login, terms, and privacy
    const isAllowedBase = [
      "/",
      "/landing",
      "/login",
      "/terms",
      "/privacy",
    ].includes(pathname);

    if (isOnOtp) {
      // Ensure the URL email matches the stored pending email for consistency
      if (emailParam !== pendingEmail) {
        router.replace(
          `/signup?step=otp&email=${encodeURIComponent(pendingEmail)}`
        );
      }
      return;
    }

    // On plain /signup or any other route (except allowed), force OTP screen
    if (!isAllowedBase) {
      router.replace(
        `/signup?step=otp&email=${encodeURIComponent(pendingEmail)}`
      );
    }
  }, [pathname, router, searchParams, isAuthenticated, user?.is_active]);

  return null;
}
