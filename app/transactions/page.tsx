import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import TransactionsClient from "./TransactionsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("transactions.page.title")} - PersonalCFO`,
    description: tServer("transactions.page.description"),
  };
}

export default function Page() {
  return <TransactionsClient />;
}
