"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Cross-fade transition for page content without external deps.
 * Fades/slides in on every route change.
 */
export function PageFade({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // reset then animate in on next frame
    setMounted(false);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={`transition duration-200 ease-in-out will-change-[opacity,transform] ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[6px]"
      }`}
    >
      {children}
    </div>
  );
}
