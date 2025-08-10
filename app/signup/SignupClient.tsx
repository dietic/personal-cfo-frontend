"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { SignupForm } from "@/components/signup-form";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

export default function SignupClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end gap-2 px-4 py-3">
        <LanguageToggle />
        <ThemeToggleButton />
      </div>
      <div className="flex flex-1">
        {/* Left side - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-center">
                <Logo className="h-12 w-12 text-primary" />
              </div>
              <SignupForm />
            </div>
          </div>
        </div>

        {/* Right side - Decorative */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-muted/30">
          <div className="mx-auto max-w-md text-center space-y-6">
            {/* Optional marketing content could go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
