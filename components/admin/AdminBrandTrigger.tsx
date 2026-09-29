"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

const TRIPLE_CLICK_WINDOW_MS = 900;

export function AdminBrandTrigger() {
  const router = useRouter();
  const clickCount = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    clickCount.current += 1;

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    if (clickCount.current >= 3) {
      event.preventDefault();
      clickCount.current = 0;
      router.push("/admin");
      return;
    }

    resetTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, TRIPLE_CLICK_WINDOW_MS);
  };

  return (
    <a
      className="brand"
      href="#top"
      aria-label="Tsegaye Teshome home"
      onClick={handleClick}
    >
      Tsegaye Teshome<span>®</span>
    </a>
  );
}
