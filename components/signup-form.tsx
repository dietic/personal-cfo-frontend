"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { clearPendingVerification } from "@/lib/auth-constants";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { CheckCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function SignupForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const { register, login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // OTP state
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Sync step/email with URL so state survives remounts
  useEffect(() => {
    const urlStep = searchParams.get("step");
    const urlEmail = searchParams.get("email");
    if (urlStep === "otp") {
      setStep("otp");
      if (urlEmail) setPendingEmail(urlEmail);
    }
  }, [searchParams]);

  // Focus OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "otp") {
      try {
        await apiClient.verifyOTP({ email: pendingEmail || email, code: otp });
        // Clear pending verification flag so navigation isn't restricted anymore
        clearPendingVerification();

        const targetEmail = pendingEmail || email;
        // If we have the password (fresh signup), try a silent auto-login first
        if (password && password.trim().length > 0) {
          toast.success(t("signup.verified"));
          try {
            await login(
              { email: targetEmail, password },
              { suppressToasts: true }
            );
          } catch {
            // If auto-login fails for any reason, avoid an extra error toast
            toast.message(t("signup.verifiedPleaseSignIn"));
            router.push(`/login?email=${encodeURIComponent(targetEmail)}`);
          }
        } else {
          // No local password available (e.g., came from login -> OTP). Ask user to sign in.
          toast.success(t("signup.verifiedPleaseSignIn"));
          router.push(`/login?email=${encodeURIComponent(targetEmail)}`);
        }
      } catch (error: any) {
        setError(error.message || t("signup.errors.invalidOrExpiredCode"));
      }
      return;
    }

    if (!email || !password || !confirmPassword) {
      setError(t("signup.errors.fillAll"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("signup.errors.mismatch"));
      return;
    }

    if (passwordStrength < 3) {
      setError(t("signup.errors.weak"));
      return;
    }

    if (!agreeTerms) {
      setError(t("signup.errors.acceptTerms"));
      return;
    }

    try {
      // Use context method (handles global loading/toasts)
      await register({ email, password });
      setPendingEmail(email);
      setStep("otp");
      // Push URL state so OTP screen persists across remounts
      router.replace(`/signup?step=otp&email=${encodeURIComponent(email)}`);
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((s: number) => {
          if (s <= 1) {
            clearInterval(timer);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (error: any) {
      setError(error.message || t("auth.registrationFailed"));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await apiClient.resendOTP({ email: pendingEmail || email });
      setResendCooldown(30);
    } catch (e: any) {
      const msg = e.message || t("signup.resendCode");
      if (msg.toLowerCase().includes("already verified")) {
        setError(t("signup.accountAlreadyVerified"));
      } else {
        setError(msg);
      }
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <form onSubmit={handleSubmit}>
        {step === "form" ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {t("signup.title")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("signup.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("signup.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("signup.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-full rounded-full ${
                            i < passwordStrength
                              ? passwordStrength < 3
                                ? "bg-red-500"
                                : passwordStrength < 4
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("signup.passwordStrengthLabel")}: {""}
                      {passwordStrength < 3
                        ? t("signup.passwordStrengthWeak")
                        : passwordStrength < 4
                        ? t("signup.passwordStrengthMedium")
                        : t("signup.passwordStrengthStrong")}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("signup.confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  {passwordsMatch && (
                    <CheckCircle className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) =>
                    setAgreeTerms(checked as boolean)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("signup.termsPrefix")}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("signup.termsOfService")}
                  </Link>{" "}
                  {t("signup.and")}{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    {t("signup.privacyPolicy")}
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !agreeTerms}
              >
                {isLoading ? t("signup.creating") : t("signup.create")}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                {t("signup.alreadyHave")}{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  {t("signup.signIn")}
                </Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {t("signup.verifyTitle")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("signup.verifySubtitle", { email: pendingEmail })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">{t("signup.verificationCode")}</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder={t("signup.verificationPlaceholder")}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="tracking-widest text-center text-lg"
                    required
                    ref={otpInputRef}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("signup.codeExpires")}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {t("signup.verifyAndContinue")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? t("signup.resendIn", { seconds: resendCooldown })
                  : t("signup.resendCode")}
              </Button>
            </CardContent>
          </>
        )}
      </form>
    </Card>
  );
}
