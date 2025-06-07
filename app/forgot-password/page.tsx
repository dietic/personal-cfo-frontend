import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Forgot Password - PersonalCFO",
  description: "Reset your PersonalCFO account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-4 text-center">
              <div className="flex justify-center">
                <Logo className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Forgot your password?
                </h1>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a reset link
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                  Password Reset
                </CardTitle>
                <CardDescription className="text-center">
                  We'll email you instructions to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Send Reset Link
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Back to login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="space-y-4">
            <Logo className="mx-auto h-20 w-20 text-primary" />
            <h2 className="text-2xl font-bold">Secure Password Reset</h2>
            <p className="text-lg text-muted-foreground">
              Your security is our priority. We use secure methods to help you
              regain access to your account.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>Secure email verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>Encrypted password reset tokens</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
              <span>Time-limited reset links</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
