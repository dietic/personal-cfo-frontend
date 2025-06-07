import { ProfileForm } from "@/components/profile-form";
import { PageHeader } from "@/components/page-header";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your account settings and personal information"
      />
      <ProfileForm />
    </div>
  );
}
