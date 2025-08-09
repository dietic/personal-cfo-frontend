"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExcludedKeywordsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings?tab=excluded");
  }, [router]);
  return null;
}
