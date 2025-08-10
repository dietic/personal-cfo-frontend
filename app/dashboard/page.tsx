import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
export { default } from "@/components/dashboard-page-root";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("dashboard.page.title")} - PersonalCFO`,
    description: tServer("dashboard.page.description"),
  };
}
