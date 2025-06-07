import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - PersonalCFO",
  description: "Privacy Policy for PersonalCFO application",
};

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: June 4, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us, such as when
                you create an account, add financial data, or contact us for
                support.
              </p>
              <h3 className="text-lg font-semibold mt-4 mb-2">
                Personal Information:
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address</li>
                <li>Account credentials</li>
                <li>Financial transaction data</li>
                <li>Budget and spending preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Generate financial insights and analytics</li>
                <li>Send technical notices and security alerts</li>
                <li>Respond to customer service requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Information Sharing
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except in the
                following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>In connection with a business transfer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>
                We implement robust security measures to protect your personal
                information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure authentication protocols</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide
                our services and fulfill the purposes outlined in this policy.
                You may request deletion of your account and data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Cookies and Tracking
              </h2>
              <p>
                We use essential cookies to maintain your session and
                preferences. We do not use tracking cookies for advertising
                purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Changes to Privacy Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of any material changes by email or through our
                service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at privacy@personalcfo.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
