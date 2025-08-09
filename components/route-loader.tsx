"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Variant = "content" | "full";

/**
 * Overlay loader shown briefly on route changes.
 * - variant="content": covers only the content area (parent must be relative)
 * - variant="full": covers the whole viewport
 */
export default function RouteLoader({
  variant = "content",
}: Readonly<{ variant?: Variant }>) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const t1 = setTimeout(() => setShow(false), 500);
    return () => clearTimeout(t1);
  }, [pathname]);

  if (!show) return null;

  const positionClass =
    variant === "full" ? "fixed inset-0" : "absolute inset-0";

  return (
    <div
      className={`${positionClass} z-[200] grid place-items-center bg-background/50 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3 rounded-md bg-background/80 px-4 py-2 shadow-lg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm text-foreground/80">Loading…</span>
      </div>
    </div>
  );
}
