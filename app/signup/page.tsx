import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("signup.title")} - PersonalCFO`,
    description: tServer("signup.subtitle"),
  };
}

export default function Page() {
  return <SignupClient />;
}
