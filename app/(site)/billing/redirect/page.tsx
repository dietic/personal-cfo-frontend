"use client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BillingRedirectPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const [status, setStatus] = useState<"init" | "creating" | "error">("init");
  const plan =
    (search.get("plan") as "plus" | "pro") ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("plan_intent") as any)
      : undefined);

  useEffect(() => {
    if (!plan) {
      router.replace("/#pricing");
      return;
    }
    if (!isAuthenticated) return; // user will be redirected after signup/OTP
    const go = async () => {
      setStatus("creating");
      try {
        const res = await fetch("/api/v1/public/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, email: user?.email }),
        });
        if (!res.ok) {
          let body = await res.text();
          try {
            body = JSON.parse(body).detail || body;
          } catch {}
          throw new Error(body);
        }
        const data = await res.json();
        const target = data.sandbox_init_point || data.init_point;
        if (!target) throw new Error("No init point returned");
        window.location.href = target;
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    };
    go();
  }, [plan, isAuthenticated, user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-50 to-blue-100 dark:from-[#0B1220] dark:to-[#151B2E]">
      <div className="w-full max-w-md rounded-xl border bg-white/80 p-8 text-center shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold mb-3">
          {t("landing.billing.redirect.title")}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isAuthenticated
            ? t("landing.billing.redirect.subtitleReady")
            : t("landing.billing.redirect.subtitleVerify")}
        </p>
        <div className="flex flex-col items-center gap-4">
          <Spinner state={status} />
          {status === "error" && (
            <button
              onClick={() => router.push(`/#pricing`)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Spinner({ state }: { state: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-white/20 dark:border-t-blue-500" />
      <span className="text-xs text-muted-foreground">
        {state === "creating"
          ? "Creando preferencia…"
          : state === "error"
          ? "Error"
          : "Preparando…"}
      </span>
    </div>
  );
}
