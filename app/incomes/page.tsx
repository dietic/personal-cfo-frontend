import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import IncomesClient from "./IncomesClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("incomes.page.title")} - PersonalCFO`,
    description: tServer("incomes.page.description"),
  };
}

export default function Page() {
  return <IncomesClient />;
}