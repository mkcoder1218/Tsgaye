"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type PortfolioMotionProps = { children: ReactNode };

export function PortfolioMotion({ children }: PortfolioMotionProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set([".js-hero-line", ".js-hero-item", ".js-reveal", ".js-stagger-item"], { clearProps: "all" });
      return;
    }

    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .from(".js-hero-line", { yPercent: 110, opacity: 0, duration: 1.15, stagger: 0.08 })
      .from(".js-hero-item", { y: 24, opacity: 0, duration: 0.75, stagger: 0.08 }, "-=0.55");

    gsap.utils.toArray<HTMLElement>(".js-reveal").forEach((element) => {
      gsap.from(element, {
        y: 42,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 84%", once: true },
      });
    });

    gsap.utils.toArray<HTMLElement>(".js-stagger-group").forEach((group) => {
      const items = group.querySelectorAll(".js-stagger-item");
      gsap.from(items, {
        y: 48,
        opacity: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 82%", once: true },
      });
    });

    gsap.to(".about-letter", {
      yPercent: -10,
      ease: "none",
      scrollTrigger: { trigger: ".about-art", start: "top bottom", end: "bottom top", scrub: true },
    });
  }, { scope: root });

  return <div ref={root}>{children}</div>;
}
