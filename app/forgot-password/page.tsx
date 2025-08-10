import { tServer } from "@/lib/i18n-server";
import { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("forgot.title")} - PersonalCFO`,
    description: tServer("forgot.subtitle"),
  };
}

export default function Page() {
  return <ForgotPasswordClient />;
}
