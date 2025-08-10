import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("profile.page.title")} - PersonalCFO`,
    description: tServer("profile.page.description"),
  };
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={tServer("profile.page.title")}
        description={tServer("profile.page.description")}
      />
      <ProfileForm />
    </div>
  );
}
