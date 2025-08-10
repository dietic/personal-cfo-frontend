import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import StatementsClient from "./StatementsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("statements.page.title")} - PersonalCFO`,
    description: tServer("statements.page.description"),
  };
}

export default function Page() {
  return <StatementsClient />;
}
