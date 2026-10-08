"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function PortfolioMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const host = root.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(host.querySelectorAll<HTMLElement>("main > section"));
    if (!sections.length) return;

    let locked = false;
    let accumulated = 0;
    let previousWheelAt = 0;
    let tween: gsap.core.Tween | undefined;
    let touchStart = 0;

    const go = (index: number) => {
      if (locked || index < 0 || index >= sections.length) return;
      locked = true;
      accumulated = 0;
      const scroll = { y: window.scrollY };
      const y = sections[index].getBoundingClientRect().top + window.scrollY;
      tween?.kill();
      tween = gsap.to(scroll, {
        y,
        duration: 1.12,
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, scroll.y),
        onComplete: () => { locked = false; },
        onInterrupt: () => { locked = false; },
      });
    };

    const current = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let index = 0;
      sections.forEach((section, i) => {
        if (section.offsetTop <= y) index = i;
      });
      return index;
    };

    const move = (direction: number) => {
      const index = current();
      const section = sections[index];
      const at = window.scrollY;
      const start = section.offsetTop;
      const end = start + section.offsetHeight - window.innerHeight;

      // Longer sections retain their native scroll so no content is skipped.
      if (direction > 0 && at < end - 12) {
        goToPosition(Math.min(end, at + window.innerHeight * 0.7));
      } else if (direction < 0 && at > start + 12) {
        goToPosition(Math.max(start, at - window.innerHeight * 0.7));
      } else {
        go(index + direction);
      }
    };

    const goToPosition = (y: number) => {
      if (locked) return;
      locked = true;
      const scroll = { y: window.scrollY };
      tween?.kill();
      tween = gsap.to(scroll, {
        y,
        duration: 0.85,
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, scroll.y),
        onComplete: () => { locked = false; },
        onInterrupt: () => { locked = false; },
      });
    };

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (locked) return;
      if (performance.now() - previousWheelAt > 250) accumulated = 0;
      previousWheelAt = performance.now();
      accumulated += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (Math.abs(accumulated) >= 85) move(Math.sign(accumulated));
    };

    const key = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable]")) return;
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key) ? 1
        : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (direction) {
        event.preventDefault();
        if (!locked) move(direction);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        go(event.key === "Home" ? 0 : sections.length - 1);
      }
    };

    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href^='#']") : null;
      const id = anchor?.getAttribute("href")?.slice(1);
      if (!id) return;
      const index = sections.findIndex((section) => section.id === id);
      if (index < 0) return;
      event.preventDefault();
      if (!locked) go(index);
      window.history.replaceState(null, "", "#" + id);
    };

    const touchEnd = (event: TouchEvent) => {
      if (locked || !event.changedTouches.length) return;
      const delta = touchStart - event.changedTouches[0].clientY;
      if (Math.abs(delta) > 100) move(Math.sign(delta));
    };

    const touchBegin = (event: TouchEvent) => {
      if (event.touches.length === 1) touchStart = event.touches[0].clientY;
    };

    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    host.addEventListener("click", click);
    window.addEventListener("touchstart", touchBegin, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });

    return () => {
      tween?.kill();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      host.removeEventListener("click", click);
      window.removeEventListener("touchstart", touchBegin);
      window.removeEventListener("touchend", touchEnd);
    };
  }, { scope: root });

  return <div ref={root}>{children}</div>;
}
