"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type SandTextProps = {
  children: string;
  className?: string;
  delay?: number;
  colorToken?: "--ink" | "--accent";
  outline?: boolean;
};

type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  drift: number;
  phase: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function transformText(value: string, transform: string) {
  switch (transform) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "capitalize":
      return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
    default:
      return value;
  }
}

export function SandText({
  children,
  className = "",
  delay = 0,
  colorToken = "--ink",
  outline = false,
}: SandTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    const canvas = canvasRef.current;

    if (!root || !text || !canvas) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      root.classList.add("sand-text-handoff", "sand-text-settled");
      return;
    }

    let frame = 0;
    let startTimer = 0;
    let hideTimer = 0;
    let cancelled = false;
    let handoffStarted = false;

    const buildParticles = async () => {
      await document.fonts.ready;

      if (cancelled) {
        return;
      }

      const computed = window.getComputedStyle(text);
      const renderedText = transformText(children, computed.textTransform);
      const bounds = text.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(bounds.width));
      const height = Math.max(1, Math.ceil(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;

      const offscreenContext = offscreen.getContext("2d", {
        willReadFrequently: true,
      });
      const context = canvas.getContext("2d");

      if (!offscreenContext || !context) {
        root.classList.add("sand-text-handoff", "sand-text-settled");
        return;
      }

      const rootStyles = window.getComputedStyle(document.documentElement);
      const particleColor =
        rootStyles.getPropertyValue(colorToken).trim() || "#0b0b0d";

      offscreenContext.scale(dpr, dpr);
      offscreenContext.font = [
        computed.fontStyle,
        computed.fontVariant,
        computed.fontWeight,
        computed.fontSize,
        computed.fontFamily,
      ].join(" ");
      offscreenContext.textBaseline = "top";
      offscreenContext.textAlign = "left";
      offscreenContext.lineJoin = "round";
      offscreenContext.lineCap = "round";

      const letterSpacing = Number.parseFloat(computed.letterSpacing);
      if (
        Number.isFinite(letterSpacing) &&
        "letterSpacing" in offscreenContext
      ) {
        (
          offscreenContext as CanvasRenderingContext2D & {
            letterSpacing: string;
          }
        ).letterSpacing = `${letterSpacing}px`;
      }

      if (outline) {
        const strokeWidth =
          Number.parseFloat(
            computed.getPropertyValue("-webkit-text-stroke-width"),
          ) || 3;

        offscreenContext.strokeStyle = particleColor;
        offscreenContext.lineWidth = strokeWidth;
        offscreenContext.strokeText(renderedText, 0, 0);
      } else {
        offscreenContext.fillStyle = particleColor;
        offscreenContext.fillText(renderedText, 0, 0);
      }

      const image = offscreenContext.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height,
      );

      const particles: Particle[] = [];
      const step = Math.max(5, Math.round(5 * dpr));

      for (let y = 0; y < image.height; y += step) {
        for (let x = 0; x < image.width; x += step) {
          const alpha = image.data[(y * image.width + x) * 4 + 3];

          if (alpha < 90) {
            continue;
          }

          const targetX = x / dpr;
          const targetY = y / dpr;
          const startX = targetX + randomBetween(-120, 120);
          const startY = targetY + randomBetween(60, 190);

          particles.push({
            x: startX,
            y: startY,
            startX,
            startY,
            targetX,
            targetY,
            size: randomBetween(0.8, 2.2),
            drift: randomBetween(-10, 10),
            phase: randomBetween(0, Math.PI * 2),
          });
        }
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const duration = 1450;
      const handoffAt = 0.88;
      const startedAt = performance.now();

      const render = (time: number) => {
        if (cancelled) {
          return;
        }

        const elapsed = time - startedAt;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 4);

        if (!handoffStarted && progress >= handoffAt) {
          handoffStarted = true;
          root.classList.add("sand-text-handoff");
        }

        context.clearRect(0, 0, width, height);
        context.fillStyle = particleColor;

        particles.forEach((particle) => {
          const turbulence = (1 - progress) * 7;
          const wobble =
            Math.sin(progress * 12 + particle.phase) * turbulence;

          particle.x =
            particle.startX +
            (particle.targetX - particle.startX) * eased +
            wobble +
            particle.drift * (1 - progress);

          particle.y =
            particle.startY +
            (particle.targetY - particle.startY) * eased +
            Math.cos(progress * 10 + particle.phase) * turbulence;

          const particleFade =
            progress > handoffAt
              ? 1 - (progress - handoffAt) / (1 - handoffAt)
              : 1;
          const alpha = Math.min(1, 0.2 + progress * 1.2) * particleFade;

          context.globalAlpha = alpha;
          context.beginPath();
          context.arc(
            particle.x,
            particle.y,
            particle.size * (0.8 + progress * 0.35),
            0,
            Math.PI * 2,
          );
          context.fill();
        });

        context.globalAlpha = 1;

        if (progress < 1) {
          frame = requestAnimationFrame(render);
          return;
        }

        root.classList.add("sand-text-settled");

        hideTimer = window.setTimeout(() => {
          if (!cancelled) {
            canvas.style.display = "none";
          }
        }, 180);
      };

      startTimer = window.setTimeout(() => {
        frame = requestAnimationFrame(render);
      }, delay);
    };

    void buildParticles();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(startTimer);
      window.clearTimeout(hideTimer);
    };
  }, [children, colorToken, delay, outline]);

  const style = {
    "--sand-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <span className={`sand-text ${className}`} ref={rootRef} style={style}>
      <span className="sand-text-source" ref={textRef}>
        {children}
      </span>
      <canvas className="sand-text-canvas" ref={canvasRef} aria-hidden="true" />
    </span>
  );
}
