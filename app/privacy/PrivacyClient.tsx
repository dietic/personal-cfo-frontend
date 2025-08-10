"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyClient() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/signup">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("privacy.backToSignup")}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {t("privacy.title")}
            </CardTitle>
            <p className="text-muted-foreground">{t("privacy.lastUpdated")}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.1.title")}
              </h2>
              <p>{t("privacy.sections.1.p1")}</p>
              <h3 className="text-lg font-semibold mt-4 mb-2">
                {t("privacy.sections.1.personalInfoTitle")}
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.sections.1.li1")}</li>
                <li>{t("privacy.sections.1.li2")}</li>
                <li>{t("privacy.sections.1.li3")}</li>
                <li>{t("privacy.sections.1.li4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.2.title")}
              </h2>
              <p>{t("privacy.sections.2.p1")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.sections.2.li1")}</li>
                <li>{t("privacy.sections.2.li2")}</li>
                <li>{t("privacy.sections.2.li3")}</li>
                <li>{t("privacy.sections.2.li4")}</li>
                <li>{t("privacy.sections.2.li5")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.3.title")}
              </h2>
              <p>{t("privacy.sections.3.p1")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.sections.3.li1")}</li>
                <li>{t("privacy.sections.3.li2")}</li>
                <li>{t("privacy.sections.3.li3")}</li>
                <li>{t("privacy.sections.3.li4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.4.title")}
              </h2>
              <p>{t("privacy.sections.4.p1")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.sections.4.li1")}</li>
                <li>{t("privacy.sections.4.li2")}</li>
                <li>{t("privacy.sections.4.li3")}</li>
                <li>{t("privacy.sections.4.li4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.5.title")}
              </h2>
              <p>{t("privacy.sections.5.p1")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.6.title")}
              </h2>
              <p>{t("privacy.sections.6.p1")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.sections.6.li1")}</li>
                <li>{t("privacy.sections.6.li2")}</li>
                <li>{t("privacy.sections.6.li3")}</li>
                <li>{t("privacy.sections.6.li4")}</li>
                <li>{t("privacy.sections.6.li5")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.7.title")}
              </h2>
              <p>{t("privacy.sections.7.p1")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.8.title")}
              </h2>
              <p>{t("privacy.sections.8.p1")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t("privacy.sections.9.title")}
              </h2>
              <p>{t("privacy.sections.9.p1")}</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
