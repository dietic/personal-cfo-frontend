import { RecurringServices } from "@/components/recurring-services";
import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("recurring.page.title")} - PersonalCFO`,
    description: tServer("recurring.page.description"),
  };
}

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <RecurringServices />
    </div>
  );
}
