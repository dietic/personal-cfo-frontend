"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Top thin progress bar that appears on route changes.
 * No external deps. Works with Next.js App Router.
 */
export default function RouteTransition() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Skip on first mount
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }

    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      // Start animation
      setVisible(true);
      setProgress(8);

      const t1 = setTimeout(() => setProgress(75), 50);
      const t2 = setTimeout(() => setProgress(90), 250);
      const t3 = setTimeout(() => setProgress(100), 450);
      const t4 = setTimeout(() => setVisible(false), 650);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed left-0 right-0 top-0 z-[100] h-[2px] overflow-hidden ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-200`}
    >
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_6px_1px_rgba(59,130,246,0.35)]"
        style={{
          width: `${progress}%`,
          transition: "width 300ms ease-out",
        }}
      />
    </div>
  );
}
