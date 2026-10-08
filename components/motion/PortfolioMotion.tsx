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

      const entrance = gsap.timeline({ delay: 0.12 });

      entrance.from(".js-hero-item", {
        y: 68,
        opacity: 0,
        duration: 1.35,
        stagger: 0.14,
        ease: "expo.out",
      });

      // Let the sand lettering animate independently; only move its container.
      entrance.from(".hero-title", {
        y: 36,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
      }, 0.12);

      gsap.to(".hero-copy", {
        yPercent: -9,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".hero-art", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.4,
        },
      });

      gsap.utils.toArray<HTMLElement>(".js-reveal").forEach((element) => {
        gsap.from(element, {
          y: 90,
          opacity: 0,
          duration: 1.25,
          ease: "expo.out",
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
            y: 85,
            opacity: 0,
            duration: 1.2,
            stagger: 0.14,
            ease: "expo.out",
            scrollTrigger: {
              trigger: group,
              start: "top 82%",
              once: true,
            },
          });
        });

      gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
        const media = card.querySelector<HTMLElement>(".work-media");
        if (!media) return;

        gsap.fromTo(media, {
          scale: 0.94,
        }, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top 35%",
            scrub: 1,
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

      const aboutImage =
        document.querySelector<HTMLElement>(".about-image-stage");

      if (aboutImage) {
        gsap.to(aboutImage, {
          yPercent: 4,
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
        x: 30,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".js-about-copy",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".js-about-timeline-row", {
        x: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".timeline",
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
