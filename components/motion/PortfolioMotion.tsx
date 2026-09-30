"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type PortfolioMotionProps = { children: ReactNode };

export function PortfolioMotion({ children }: PortfolioMotionProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [".js-hero-item", ".js-reveal", ".js-stagger-item"],
          { clearProps: "all" },
        );
        return;
      }

      gsap.from(".js-hero-item", {
        y: 24,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        delay: 0.32,
        ease: "power4.out",
      });

      gsap.utils.toArray<HTMLElement>(".js-reveal").forEach((element) => {
        gsap.from(element, {
          y: 42,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
            once: true,
          },
        });
      });

      gsap.utils
        .toArray<HTMLElement>(".js-stagger-group")
        .forEach((group) => {
          const items = group.querySelectorAll(".js-stagger-item");

          gsap.from(items, {
            y: 48,
            opacity: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: group,
              start: "top 82%",
              once: true,
            },
          });
        });

      gsap.to(".about-letter", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-art",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      const aboutImage = document.querySelector<HTMLElement>(".js-about-image");

      if (aboutImage) {
        gsap.fromTo(
          aboutImage,
          {
            clipPath: "inset(100% 0 0 0)",
            scale: 1.08,
          },
          {
            clipPath: "inset(0% 0 0 0)",
            scale: 1,
            duration: 1.15,
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".about-art",
              start: "top 82%",
              once: true,
            },
          },
        );

        gsap.to(aboutImage, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-art",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      gsap.from(".js-about-copy", {
        x: 46,
        opacity: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".js-about-copy",
          start: "top 84%",
          once: true,
        },
      });

      gsap.from(".js-about-timeline-row", {
        x: 36,
        opacity: 0,
        duration: 0.72,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".timeline",
          start: "top 86%",
          once: true,
        },
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
