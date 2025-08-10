"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function LandingRoot() {
  const { t } = useI18n();
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
            <Link
              href="#reviews"
              className="text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
            >
              {t("landing.nav.reviews")}
            </Link>
            <ThemeToggleButton />
            <LanguageToggle />
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-slate-700 hover:text-slate-900 dark:text-white/90 dark:hover:text-white md:inline"
            >
              {t("landing.cta.signIn")}
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow shadow-blue-500/25 hover:bg-blue-500"
            >
              {t("landing.cta.startTrial")}
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
            <span className="block">{t("landing.hero.line1")}</span>
            <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
              {t("landing.hero.line2")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("landing.hero.tagline")}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-[-1px] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span>{t("landing.cta.getStarted")}</span>
              <span aria-hidden className="ml-2">
                ↗
              </span>
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-md border border-slate-300 bg:white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border:white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg:white/10"
            >
              {t("landing.cta.startTrial")}
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>{t("landing.badges.noCard")}</span>
            </div>
            <div className="flex items:center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>{t("landing.badges.freeForever")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>{t("landing.badges.upgradeAnytime")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-background py-20 text-foreground dark:bg-[#0E1528] dark:text-white"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text:white/80">
              {t("landing.nav.features")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: t("landing.features.cards.title"),
                desc: t("landing.features.cards.desc"),
                emoji: "💳",
              },
              {
                title: t("landing.features.categorization.title"),
                desc: t("landing.features.categorization.desc"),
                emoji: "⚡",
              },
              {
                title: t("landing.features.budgeting.title"),
                desc: t("landing.features.budgeting.desc"),
                emoji: "🎯",
              },
              {
                title: t("landing.features.alerts.title"),
                desc: t("landing.features.alerts.desc"),
                emoji: "🔔",
              },
              {
                title: t("landing.features.import.title"),
                desc: t("landing.features.import.desc"),
                emoji: "📥",
              },
              {
                title: t("landing.features.analytics.title"),
                desc: t("landing.features.analytics.desc"),
                emoji: "📊",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="reveal-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border:white/10 dark:bg-black/20 dark:shadow-black/20 dark:hover:shadow-blue-500/10"
              >
                <div className="mb-3 inline-flex h-9 w-9 items:center justify-center rounded-md bg-slate-100 text-lg dark:bg:white/10">
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
      <section
        id="pricing"
        className="bg-background py-20 text-foreground dark:bg-[#0E1528] dark:text:white"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg:white/10 dark:text:white/80">
              {t("landing.nav.pricing")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              {t("landing.pricing.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.pricing.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                name: t("landing.pricing.free.name"),
                price: "$0",
                perks: [
                  t("landing.pricing.free.p1"),
                  t("landing.pricing.free.p2"),
                  t("landing.pricing.free.p3"),
                  t("landing.pricing.free.p4"),
                  t("landing.pricing.free.p5"),
                  t("landing.pricing.free.p6"),
                ],
                cta: t("landing.cta.getStarted"),
                popular: false,
              },
              {
                name: t("landing.pricing.plus.name"),
                price: "$9",
                perks: [
                  t("landing.pricing.plus.p1"),
                  t("landing.pricing.plus.p2"),
                  t("landing.pricing.plus.p3"),
                  t("landing.pricing.plus.p4"),
                  t("landing.pricing.plus.p5"),
                  t("landing.pricing.plus.p6"),
                ],
                cta: t("landing.pricing.plus.cta"),
                popular: true,
              },
              {
                name: t("landing.pricing.pro.name"),
                price: "$19",
                perks: [
                  t("landing.pricing.pro.p1"),
                  t("landing.pricing.pro.p2"),
                  t("landing.pricing.pro.p3"),
                  t("landing.pricing.pro.p4"),
                  t("landing.pricing.pro.p5"),
                  t("landing.pricing.pro.p6"),
                ],
                cta: t("landing.pricing.pro.cta"),
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`reveal-up rounded-2xl border ${
                  plan.popular
                    ? "border-blue-500/40 ring-1 ring-blue-500/30"
                    : "border-slate-200"
                } bg-white p-6 shadow-sm dark:border:white/10 dark:bg-black/20 dark:shadow-xl`}
              >
                {plan.popular && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                    {t("landing.pricing.popular")}
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
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border:white/10 dark:bg-white/5 dark:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            {t("landing.pricing.footer")}
          </p>

          <div className="mt-6 text-center">
            <Link
              href="#features"
              className="text-sm text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
            >
              {t("landing.pricing.seeAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-r from-blue-600/5 via-purple-500/5 to-pink-500/5 py-16 text-foreground dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            {t("landing.cta.sectionTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("landing.cta.sectionSubtitle")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-[-1px] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {t("landing.cta.getStarted")}
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-md border border-slate-300 bg:white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border:white/20 dark:bg:white/5 dark:text:white/90 dark:hover:bg:white/10"
            >
              {t("landing.cta.demo")}
            </Link>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {t("landing.cta.footer")}
          </div>
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
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-muted-foreground dark:border:white/10">
            <div>
              © {new Date().getFullYear()} {t("landing.brand")}.{" "}
              {t("landing.footer.rights")}.
            </div>
            <div className="flex items-center gap-2">
              <span>☀️</span> {t("landing.footer.mode")}
            </div>
          </div>
        </div>
      </footer>

      <ScrollReveal />
    </main>
  );
}
