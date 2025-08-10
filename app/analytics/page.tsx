import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import AnalyticsClient from "./AnalyticsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("analytics.page.title")} - PersonalCFO`,
    description: tServer("analytics.page.description"),
  };
}

export default function Page() {
  return <AnalyticsClient />;
}
