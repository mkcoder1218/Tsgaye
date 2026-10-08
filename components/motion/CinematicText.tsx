"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type CinematicTextProps = {
  children: string;
  className?: string;
  delay?: number;
};

export function CinematicText({
  children,
  className = "",
  delay = 0,
}: CinematicTextProps) {
  const element = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const root = element.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = root.querySelectorAll<HTMLElement>(".cinematic-letter");
    gsap.fromTo(letters,
      { yPercent: 115, rotateX: -38, opacity: 0 },
      {
        yPercent: 0,
        rotateX: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.055,
        delay: delay / 1000,
        ease: "power4.out",
        clearProps: "transform,opacity",
      },
    );
    const sweep = root.querySelector<HTMLElement>(".cinematic-sweep");
    if (sweep) {
      gsap.fromTo(sweep,
        { xPercent: -120, opacity: 0 },
        {
          xPercent: 120,
          opacity: 0.9,
          duration: 0.8,
          delay: delay / 1000 + 0.45,
          ease: "power2.inOut",
          onComplete: () => gsap.set(sweep, { opacity: 0 }),
        },
      );
    }
  }, { scope: element, dependencies: [children, delay] });

  return (
    <span className={`cinematic-text ${className}`} ref={element} aria-label={children}>
      <span className="cinematic-letters" aria-hidden="true">
        {Array.from(children).map((letter, index) => (
          <span className="cinematic-letter-mask" key={index}>
            <span className="cinematic-letter">
              {letter === " " ? "\u00a0" : letter}
            </span>
          </span>
        ))}
      </span>
      <span className="cinematic-sweep" aria-hidden="true" />
    </span>
  );
}
