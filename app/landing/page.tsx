import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: tServer("site.title"),
  description: tServer("site.description"),
};

export const dynamic = "force-static";

export default function LandingPage() {
  // Always redirect legacy /landing to the root page
  redirect("/");
}
