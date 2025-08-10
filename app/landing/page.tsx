import { ScrollReveal } from "@/components/scroll-reveal";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FinanceCFO — Take Control of Your Financial Future",
  description:
    "Smart expense tracking, automated categorization, and powerful budgeting tools. Transform chaos into clarity with FinanceCFO.",
};

export const dynamic = "force-static";

export default function LandingPage() {
  // Keep legacy /landing working by redirecting to root
  if (typeof window !== "undefined") {
    // Client-side redirect for SPA feel
    window.location.replace("/");
    return null;
  }
  // Server-side render fallback
  redirect("/");

  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-[#0E1528]/80 dark:text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
              💳
            </span>
            <span>FinanceCFO</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="#features"
              className="text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="#reviews"
              className="text-slate-600 hover:text-slate-900 dark:text:white/80 dark:hover:text-white"
            >
              Reviews
            </Link>
            <ThemeToggleButton />
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-slate-700 hover:text-slate-900 dark:text-white/90 dark:hover:text-white md:inline"
            >
              Sign In
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow shadow-blue-500/25 hover:bg-blue-500"
            >
              Start Free Trial
            </Link>
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
            <span className="block">Take Control of Your</span>
            <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
              Financial Future
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Smart expense tracking, automated categorization, and powerful
            budgeting tools. Transform your financial chaos into clarity with
            FinanceCFO.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-[-1px] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span>Get Started Free</span>
              <span aria-hidden className="ml-2">↗</span>
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="mt-6 flex items-center justify:center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>Upgrade anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-background py-20 text-foreground dark:bg-[#0E1528] dark:text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-white/80">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Everything You Need to Master Your Money</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              From automatic transaction categorization to advanced budgeting, FinanceCFO gives you the tools to make informed financial decisions.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Smart Card Management",
                desc: "Connect unlimited cards and track spending across all your accounts in real-time.",
                emoji: "💳",
              },
              {
                title: "Auto-Categorization",
                desc: "AI-powered keyword detection automatically sorts your transactions into custom categories.",
                emoji: "⚡",
              },
              {
                title: "Advanced Budgeting",
                desc: "Set spending limits, track progress, and get alerts when you're approaching your budget.",
                emoji: "🎯",
              },
              {
                title: "Smart Alerts",
                desc: "Get notified about payment due dates, unusual spending, and budget overruns.",
                emoji: "🔔",
              },
              {
                title: "Bank Statement Import",
                desc: "Upload and process bank statements automatically with intelligent transaction parsing.",
                emoji: "📥",
              },
              {
                title: "Spending Analytics",
                desc: "Visualize your spending patterns with detailed charts and monthly/weekly breakdowns.",
                emoji: "📊",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="reveal-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-black/20 dark:shadow-black/20 dark:hover:shadow-blue-500/10"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-lg dark:bg-white/10">
                  <span aria-hidden>{f.emoji}</span>
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-background py-20 text-foreground dark:bg-[#0E1528] dark:text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-white/80">
              Pricing
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Choose Your Perfect Plan
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free and upgrade as your financial management needs grow.
              All plans include our core features.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                perks: [
                  "2 statements/month",
                  "Keyword-driven categorization",
                  "2 alerts",
                  "2 budgets",
                  "5 default categories",
                  "1 card",
                ],
                cta: "Get Started Free",
                popular: false,
              },
              {
                name: "Plus",
                price: "$9",
                perks: [
                  "Unlimited statements",
                  "Keyword-driven categorization",
                  "6 alerts",
                  "10 budgets",
                  "25 custom categories",
                  "5 cards",
                ],
                cta: "Upgrade to Plus",
                popular: true,
              },
              {
                name: "Pro",
                price: "$19",
                perks: [
                  "Unlimited statements",
                  "Keyword-driven categorization",
                  "10 alerts",
                  "15 budgets",
                  "Unlimited categories",
                  "Unlimited cards",
                ],
                cta: "Upgrade to Pro",
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`reveal-up rounded-2xl border ${
                  plan.popular
                    ? "border-blue-500/40 ring-1 ring-blue-500/30"
                    : "border-slate-200"
                } bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/20 dark:shadow-xl`}
              >
                {plan.popular && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-4xl font-bold">{plan.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.perks.map((p) => (
                    <li className="flex items-start gap-2" key={p}>
                      <span className="mt-1 text-emerald-500" aria-hidden>
                        ✔
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="/signup"
                    className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold shadow transition ${
                      plan.popular
                        ? "bg-blue-600 text-white shadow-blue-500/25 hover:bg-blue-500"
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            All plans include bank-level security, automatic backups, and 24/7
            support
          </p>

          <div className="mt-6 text-center">
            <Link
              href="#features"
              className="text-sm text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Compare all features →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-r from-blue-600/5 via-purple-500/5 to-pink-500/5 py-16 text-foreground dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Join thousands of users who have transformed their financial lives
            with FinanceCFO. Start free today - no credit card required.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-[-1px] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Get Started Free
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              Schedule a Demo
            </Link>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Bank-level security • Free forever • Upgrade anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-10 text-foreground dark:bg-[#0E1528] dark:text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-lg font-bold">FinanceCFO</div>
              <p className="mt-2 text-sm text-muted-foreground">
                The smart way to manage your personal finances and achieve your
                financial goals.
              </p>
            </div>
            <div>
              <div className="font-semibold">Product</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="#features">
                    Features
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="#pricing">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/api">
                    API
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/security">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/blog">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/careers">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/contact">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Support</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/help">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/privacy">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/terms">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/status">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-muted-foreground dark:border-white/10">
            <div>
              © {new Date().getFullYear()} FinanceCFO. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span>☀️</span> Light Mode
            </div>
          </div>
        </div>
      </footer>

      <ScrollReveal />
    </main>
  );
}
