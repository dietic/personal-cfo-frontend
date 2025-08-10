import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("privacy.page.title")} - PersonalCFO`,
    description: tServer("privacy.page.description"),
  };
}

export default function Page() {
  return <PrivacyClient />;
}
