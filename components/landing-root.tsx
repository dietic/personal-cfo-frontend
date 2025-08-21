"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import React from "react";

function safeUseAuth() {
  try {
    return useAuth();
  } catch {
    return null; // Landing rendered outside provider
  }
}

export default function LandingRoot() {
  const { t } = useI18n();
  const auth = safeUseAuth();
  const isAuthenticated = !!auth?.isAuthenticated;
  const user = auth?.user;
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-[#0E1528]/80 dark:text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
              💳
            </span>
            <span>{t("landing.brand")}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="#features"
              className="text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
            >
              {t("landing.nav.features")}
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
            >
              {t("landing.nav.pricing")}
            </Link>
            <ThemeToggleButton />
            <LanguageToggle />
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
                >
                  {t("landing.cta.signIn")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
                >
                  {t("landing.cta.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate flex items-center justify-center px-6 py-24 md:py-32 lg:py-40 bg-white text-slate-900 dark:bg-gradient-to-br dark:from-[#0B1220] dark:via-[#0E1528] dark:to-[#151B2E] dark:text-white">
        {/* Decorative floating credit cards */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="landing-cc landing-cc--slate soft-edges animate-float-slow -left-20 top-32 h-40 w-72 rotate-[-10deg]">
            <span className="brand">VISA</span>
          </div>
          <div className="landing-cc landing-cc--purple soft-edges animate-float right-10 top-16 h-48 w-80 rotate-12">
            <span className="brand">MASTERCARD</span>
          </div>
          <div className="landing-cc landing-cc--teal soft-edges animate-float-medium right-20 bottom-10 h-56 w-96 -rotate-6">
            <span className="brand">AMEX</span>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="block">{t("landing.hero.line1")}</span>
            <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              {t("landing.hero.line2")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("landing.hero.tagline")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-500"
            >
              {t("landing.cta.getStarted")}
            </Link>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
            >
              {t("landing.nav.pricing")}
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>{t("landing.badges.noCard")}</span>
            <span>• {t("landing.badges.freeForever")}</span>
            <span>• {t("landing.badges.upgradeAnytime")}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-[#0E1528] dark:to-[#0B1220]"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("landing.features.subtitle")}
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems(t).map((f) => (
              <div
                key={f.key}
                className="relative group rounded-2xl border border-slate-200/60 bg-white/70 p-6 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09] backdrop-blur-sm overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-transparent" />
                </div>
                <div className="mb-4 text-xl leading-none" aria-hidden="true">
                  {f.emoji}
                </div>
                <h3 className="relative font-semibold mb-2 tracking-tight text-slate-800 dark:text-white">
                  {f.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {f.desc}
                </p>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent dark:via-white/10" />
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600/70 opacity-0 group-hover:opacity-100 transition">
                  <span>★</span>
                  <span>Core Feature</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="relative py-24 bg-white dark:bg-[#0B1220]"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("landing.pricing.title")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("landing.pricing.subtitle")}
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <PricingCard
              plan={t("landing.pricing.free.name")}
              price={formatPrice(0)}
              features={[
                t("landing.pricing.free.p6"),
                t("landing.pricing.free.p1"),
                t("landing.pricing.free.p5"),
                t("landing.pricing.free.p3"),
                t("landing.pricing.free.p4"),
                t("landing.pricing.free.p2"),
              ]}
              cta={
                <Link
                  href="/signup"
                  className="w-full rounded-md border px-4 py-2 text-sm font-medium text-center hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
                >
                  {t("landing.pricing.free.cta")}
                </Link>
              }
            />
            <PricingCard
              plan={t("landing.pricing.plus.name")}
              highlight
              price={formatPrice(getPlanPriceCents("plus"))}
              features={[
                t("landing.pricing.plus.p6"),
                t("landing.pricing.plus.p1"),
                t("landing.pricing.plus.p5"),
                t("landing.pricing.plus.p3"),
                t("landing.pricing.plus.p4"),
                t("landing.pricing.plus.p2"),
              ]}
              cta={
                <SubscriptionButton
                  plan="plus"
                  label={t("landing.pricing.plus.cta")}
                />
              }
            />
            <PricingCard
              plan={t("landing.pricing.pro.name")}
              price={formatPrice(getPlanPriceCents("pro"))}
              features={[
                t("landing.pricing.pro.p6"),
                t("landing.pricing.pro.p1"),
                t("landing.pricing.pro.p5"),
                t("landing.pricing.pro.p3"),
                t("landing.pricing.pro.p4"),
                t("landing.pricing.pro.p2"),
              ]}
              cta={
                <SubscriptionButton
                  plan="pro"
                  label={t("landing.pricing.pro.cta")}
                />
              }
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.cta.sectionTitle")}
          </h2>
          <p className="text-sm opacity-90 max-w-2xl mx-auto">
            {t("landing.cta.sectionSubtitle")}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow hover:bg-slate-100"
            >
              {t("landing.cta.getStarted")}
            </Link>
            <Link
              href="#pricing"
              className="rounded-md bg-indigo-700/40 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-indigo-700/50"
            >
              {t("landing.nav.pricing")}
            </Link>
          </div>
          <p className="text-xs opacity-80">{t("landing.cta.footer")}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-10 text-foreground dark:bg-[#0E1528] dark:text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-lg font-bold">{t("landing.brand")}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("landing.footer.tagline")}
              </p>
            </div>
            <div>
              <div className="font-semibold">{t("landing.footer.product")}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="#features">
                    {t("landing.nav.features")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="#pricing">
                    {t("landing.nav.pricing")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/api">
                    {t("landing.footer.api")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/security">
                    {t("landing.footer.security")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">{t("landing.footer.company")}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/about">
                    {t("landing.footer.about")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/blog">
                    {t("landing.footer.blog")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/careers">
                    {t("landing.footer.careers")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/contact">
                    {t("landing.footer.contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">{t("landing.footer.support")}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/help">
                    {t("landing.footer.help")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/privacy">
                    {t("landing.footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/terms">
                    {t("landing.footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/status">
                    {t("landing.footer.status")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            {/* Signup and trial buttons removed while closed */}
          </div>
        </div>
      </footer>

      <ScrollReveal />
    </main>
  );
}

function featureItems(t: any) {
  return [
    {
      key: "cards",
      emoji: "💳",
      title: t("landing.features.cards.title"),
      desc: t("landing.features.cards.desc"),
    },
    {
      key: "categorization",
      emoji: "⚙️",
      title: t("landing.features.categorization.title"),
      desc: t("landing.features.categorization.desc"),
    },
    {
      key: "budgeting",
      emoji: "📊",
      title: t("landing.features.budgeting.title"),
      desc: t("landing.features.budgeting.desc"),
    },
    {
      key: "alerts",
      emoji: "🔔",
      title: t("landing.features.alerts.title"),
      desc: t("landing.features.alerts.desc"),
    },
    {
      key: "import",
      emoji: "📥",
      title: t("landing.features.import.title"),
      desc: t("landing.features.import.desc"),
    },
    {
      key: "analytics",
      emoji: "📈",
      title: t("landing.features.analytics.title"),
      desc: t("landing.features.analytics.desc"),
    },
  ];
}

// Replace dynamic env access with build-time constants
const PLAN_PLUS_PRICE_CENTS = Number(
  process.env.NEXT_PUBLIC_PLAN_PLUS_PRICE_PEN ?? 1999
);
const PLAN_PRO_PRICE_CENTS = Number(
  process.env.NEXT_PUBLIC_PLAN_PRO_PRICE_PEN ?? 4999
);
function getPlanPriceCents(plan: "plus" | "pro") {
  return plan === "plus" ? PLAN_PLUS_PRICE_CENTS : PLAN_PRO_PRICE_CENTS;
}
function formatPrice(cents: number) {
  return `S/${(cents / 100).toFixed(2)}`;
}

function SubscriptionButton({
  plan,
  label,
}: {
  plan: "plus" | "pro";
  label: string;
}) {
  const auth = safeUseAuth();
  const isAuthenticated = !!auth?.isAuthenticated;
  const user = auth?.user;
  const router = React.useMemo(
    () => ({ push: (url: string) => (window.location.href = url) }),
    []
  ); // minimal router replacement
  const [loading, setLoading] = React.useState(false);
  const { t } = useI18n();

  async function begin() {
    if (!isAuthenticated) {
      try {
        localStorage.setItem("plan_intent", plan);
      } catch {}
      router.push(`/signup?plan=${plan}`);
      return;
    }
    if (!user?.email) {
      alert("Usuario sin email válido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/public/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: user.email }),
      });
      if (!res.ok) {
        let detail = await res.text();
        try {
          detail = JSON.parse(detail).detail || detail;
        } catch {}
        throw new Error(detail);
      }
      const data = await res.json();
      const target = data.sandbox_init_point || data.init_point;
      if (target) {
        window.location.href = target;
      } else {
        throw new Error("Respuesta inválida del servidor (sin init_point)");
      }
    } catch (e: any) {
      console.error(e);
      alert(`Checkout error: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={begin}
      disabled={loading}
      className={`w-full rounded-md ${
        plan === "plus"
          ? "bg-blue-600 hover:bg-blue-500"
          : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      } px-4 py-2 text-sm font-semibold text-white disabled:opacity-60`}
    >
      {loading ? "..." : label}
    </button>
  );
}

function PricingCard({
  plan,
  price,
  features,
  cta,
  highlight,
}: {
  plan: string;
  price: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 flex flex-col gap-4 dark:border-white/10 ${
        highlight ? "ring-2 ring-blue-600 shadow-md" : ""
      }`}
    >
      {" "}
      <div>
        <h3 className="text-lg font-semibold">{plan}</h3>
        <div className="mt-1 text-3xl font-bold">
          {price}
          <span className="text-base font-medium text-muted-foreground">
            /mes
          </span>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      {cta}
    </div>
  );
}
