import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - PersonalCFO",
  description: "Terms of Service for PersonalCFO application",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/signup">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Signup
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground">Last updated: June 4, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using PersonalCFO ("the Service"), you accept
                and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <p>
                PersonalCFO is a personal finance management application that
                helps users track expenses, manage budgets, and analyze spending
                patterns. The service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Expense tracking and categorization</li>
                <li>Budget creation and monitoring</li>
                <li>Financial analytics and insights</li>
                <li>Multi-card management</li>
                <li>Recurring service tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p>
                You are responsible for safeguarding the password and for
                maintaining the confidentiality of your account. You agree not
                to disclose your password to any third party and to take sole
                responsibility for activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Privacy and Data Security
              </h2>
              <p>
                We take your privacy seriously. All financial data is encrypted
                and stored securely. We do not share your personal information
                with third parties without your explicit consent, except as
                required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
              <p>
                You agree to use PersonalCFO only for lawful purposes and in
                accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal activities</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Upload malicious code or attempt to disrupt the service</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Limitation of Liability
              </h2>
              <p>
                PersonalCFO is provided "as is" without any warranties. We shall
                not be liable for any indirect, incidental, special, or
                consequential damages arising out of your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will
                notify users of significant changes via email or through the
                application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at support@personalcfo.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
