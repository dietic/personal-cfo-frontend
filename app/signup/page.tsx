import { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";
import { Logo } from "@/components/logo";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

export const metadata: Metadata = {
  title: "Sign Up - PersonalCFO",
  description: "Create your PersonalCFO account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex relative">
      {/* Theme toggle button */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggleButton />
      </div>
      
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="space-y-4">
            <Logo className="mx-auto h-20 w-20 text-primary" />
            <h2 className="text-2xl font-bold">PersonalCFO</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of users who have transformed their financial
              management.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>AI-powered expense categorization</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>Real-time budget monitoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>Advanced spending insights</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>Multi-card management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-4 text-center">
              <div className="flex justify-center lg:hidden">
                <Logo className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Create your account
                </h1>
                <p className="text-muted-foreground">
                  Start your journey to financial freedom today
                </p>
              </div>
            </div>
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
