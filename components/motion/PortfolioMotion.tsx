"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function PortfolioMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const host = root.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(host.querySelectorAll<HTMLElement>("main > section"));
    if (sections.length < 2) return;

    let active = 0;
    let locked = false;
    let lockedUntil = 0;
    let intent = 0;
    let intentDirection = 0;
    let lastWheel = 0;
    let touchY = 0;
    let touchX = 0;
    let scrollTween: gsap.core.Tween | null = null;
    let writingScroll = false;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const topOf = (section: HTMLElement) => section.getBoundingClientRect().top + scrollY;
    const clamp = (value: number) => Math.max(0, Math.min(maxScroll(), value));

    const resolveActive = () => {
      const anchor = scrollY + innerHeight * 0.22;
      let index = 0;
      sections.forEach((section, i) => {
        if (topOf(section) <= anchor + 2) index = i;
      });
      return index;
    };

    active = resolveActive();

    // Section-specific choreography runs as each snap enters the viewport.
    const sectionTriggers = sections.map((section, index) => {
      const headline = section.querySelector<HTMLElement>(".section-heading h2, .contact-heading");
      const eyebrow = section.querySelector<HTMLElement>(".section-eyebrow");
      const items = Array.from(section.querySelectorAll<HTMLElement>(
        ".expertise-card, .work-card, .about-art, .about-content, .contact-grid > div",
      ));
      const play = () => {
        if (index === 0) return;
        const choreography = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (eyebrow) choreography.fromTo(eyebrow,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.45, immediateRender: false }, 0);
        if (headline) choreography.fromTo(headline,
          { opacity: 0, y: 54, rotateX: 7 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.75, immediateRender: false }, 0.06);
        if (items.length) choreography.fromTo(items,
          { opacity: 0, y: 42, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.09,
            immediateRender: false }, 0.2);
      };
      return ScrollTrigger.create({
        trigger: section,
        start: "top 65%",
        onEnter: play,
        onEnterBack: play,
      });
    });

    const animateTo = (target: number, nextIndex: number) => {
      if (locked) return;
      locked = true;
      intent = 0;
      const position = { y: scrollY };
      scrollTween?.kill();
      scrollTween = gsap.to(position, {
        y: clamp(target),
        duration: 0.62,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => {
          writingScroll = true;
          window.scrollTo(0, position.y);
          ScrollTrigger.update();
          writingScroll = false;
        },
        onComplete: () => {
          active = nextIndex;
          // Guard against momentum events at the end of the animation.
          lockedUntil = performance.now() + 110;
          locked = false;
        },
        onInterrupt: () => { locked = false; },
      });
    };

    const navigate = (direction: number) => {
      if (locked || performance.now() < lockedUntil) return;
      active = resolveActive();
      const section = sections[active];
      const sectionTop = topOf(section);
      const sectionBottom = sectionTop + section.offsetHeight - innerHeight;
      const tolerance = 16;

      // Mirror Genesis: one gesture always advances one section on desktop.
      // On compact screens, tall sections remain readable before advancing.
      const compact = window.matchMedia("(max-width: 820px)").matches;
      if (compact && direction > 0 && sectionBottom > scrollY + tolerance) {
        animateTo(Math.min(sectionBottom, scrollY + innerHeight * 0.85), active);
        return;
      }
      if (compact && direction < 0 && scrollY > sectionTop + tolerance) {
        animateTo(Math.max(sectionTop, scrollY - innerHeight * 0.85), active);
        return;
      }

      const next = active + direction;
      if (next < 0 || next >= sections.length) return;
      animateTo(topOf(sections[next]), next);
    };

    const nestedCanScroll = (target: EventTarget | null, direction: number) => {
      let element = target instanceof HTMLElement ? target : null;
      while (element && element !== document.body) {
        const style = getComputedStyle(element);
        if ((style.overflowY === "auto" || style.overflowY === "scroll") &&
          element.scrollHeight > element.clientHeight + 1 &&
          (direction > 0
            ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
            : element.scrollTop > 1)) return true;
        element = element.parentElement;
      }
      return false;
    };

    const onWheel = (event: WheelEvent) => {
      if (host.querySelector(".work-detail-overlay")) return;
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16
        : event.deltaMode === 2 ? event.deltaY * innerHeight : event.deltaY;
      const direction = Math.sign(delta);
      if (!direction || nestedCanScroll(event.target, direction)) return;

      // Critical: stop native scrolling even while GSAP is transitioning.
      event.preventDefault();
      if (locked || performance.now() < lockedUntil) return;

      const now = performance.now();
      if (now - lastWheel > 190 || (intentDirection && intentDirection !== direction)) intent = 0;
      lastWheel = now;
      intentDirection = direction;
      intent += Math.max(-120, Math.min(120, delta));
      if (Math.abs(intent) < 75) return;
      intent = 0;
      navigate(direction);
    };

    const onKey = (event: KeyboardEvent) => {
      if (host.querySelector(".work-detail-overlay")) return;
      if (event.altKey || event.ctrlKey || event.metaKey ||
          (event.target instanceof HTMLElement &&
          event.target.closest("input, textarea, select, [contenteditable]"))) return;
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key) ? 1
        : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (direction) {
        if (nestedCanScroll(event.target, direction)) return;
        event.preventDefault();
        navigate(direction);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        if (!locked) {
          const index = event.key === "Home" ? 0 : sections.length - 1;
          animateTo(topOf(sections[index]), index);
        }
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchY = event.touches[0].clientY;
      touchX = event.touches[0].clientX;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (host.querySelector(".work-detail-overlay")) return;
      if (event.touches.length !== 1) return;
      const dy = touchY - event.touches[0].clientY;
      const dx = touchX - event.touches[0].clientX;
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) &&
          !nestedCanScroll(event.target, Math.sign(dy))) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (host.querySelector(".work-detail-overlay")) return;
      if (!event.changedTouches.length) return;
      const dy = touchY - event.changedTouches[0].clientY;
      const dx = touchX - event.changedTouches[0].clientX;
      if (Math.abs(dy) >= 45 && Math.abs(dy) > Math.abs(dx)) navigate(Math.sign(dy));
    };

    const onAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#") return;
      const destination = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!destination) return;
      event.preventDefault();
      const nextIndex = sections.findIndex(section => section === destination || section.contains(destination));
      if (nextIndex >= 0 && !locked) animateTo(topOf(sections[nextIndex]), nextIndex);
      history.pushState(null, "", hash);
    };

    const onNativeScroll = () => {
      ScrollTrigger.update();
      if (!writingScroll && !locked) active = resolveActive();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    host.addEventListener("click", onAnchor);
    ScrollTrigger.refresh();

    return () => {
      scrollTween?.kill();
      sectionTriggers.forEach((trigger) => trigger.kill());
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onNativeScroll);
      host.removeEventListener("click", onAnchor);
    };
  }, { scope: root });

  return <div ref={root}>{children}</div>;
}
