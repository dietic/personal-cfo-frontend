import { LanguageToggle } from "@/components/language-toggle";
import { LoginCopy } from "@/components/login-copy";
import { LoginForm } from "@/components/login-form";
import { LoginMarketing } from "@/components/login-marketing";
import { Logo } from "@/components/logo";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("login.title")} - PersonalCFO`,
    description: tServer("login.subtitle"),
  };
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end gap-2 px-4 py-3">
        <LanguageToggle />
        <ThemeToggleButton />
      </div>
      <div className="flex flex-1">
        {/* Left side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-4 text-center">
                <div className="flex justify-center">
                  <Logo className="h-12 w-12 text-primary" />
                </div>
                <LoginCopy />
              </div>
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Right side - Decorative */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-muted/30">
          <div className="mx-auto max-w-md text-center space-y-6">
            <LoginMarketing />
          </div>
        </div>
      </div>
    </div>
  );
}
