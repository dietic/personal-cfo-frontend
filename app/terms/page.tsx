import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("terms.page.title")} - PersonalCFO`,
    description: tServer("terms.page.description"),
  };
}

export default function Page() {
  return <TermsClient />;
}
