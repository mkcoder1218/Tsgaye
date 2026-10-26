"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { portfolio } from "@/content/portfolio";

type WorkGalleryProps = {
  projects: typeof portfolio.projects;
  galleries: string[][];
};

export function WorkGallery({ projects, galleries }: WorkGalleryProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (!reduce) {
        gsap.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
        gsap.fromTo(".work-detail-sheet",
          { yPercent: -105, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "power4.out" });
        gsap.fromTo(".work-detail-item",
          { y: -60, autoAlpha: 0, scale: 0.94 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.65, stagger: 0.095, delay: 0.22, ease: "back.out(1.15)" });
      }
    }, panel);

    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previousOverflow;
      context.revert();
      openerRef.current?.focus();
    };
  }, [selected]);

  const open = (index: number, element: HTMLButtonElement) => {
    openerRef.current = element;
    setSelected(index);
  };

  const close = () => {
    if (!panelRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSelected(null);
      return;
    }
    gsap.to(".work-detail-sheet", {
      yPercent: -105,
      autoAlpha: 0,
      duration: 0.38,
      ease: "power3.in",
      onComplete: () => setSelected(null),
    });
  };

  const selectedProject = selected === null ? null : projects[selected];
  const images = selected === null ? [] : galleries[selected] ?? [];

  return (
    <section className="section shell work-section work-editorial" id="work">
      <div className="work-poster-heading">
        <span className="section-eyebrow">02 — Selected work</span>
        <div className="work-poster-heading-copy" aria-live="polite">
          <h2 key={hovered ?? "overview"}>
            {hovered === null ? "Selected work." : projects[hovered].title}
          </h2>
          <p key={`description-${hovered ?? "overview"}`}>
            {hovered === null
              ? "Distinct perspectives. Explore a collection."
              : projects[hovered].meta}
          </p>
        </div>
        <span className="work-poster-heading-hint">Hover or select a poster ↗</span>
      </div>

      <div className="work-poster-stage js-stagger-group" aria-label="Explore creative collections">
        <div className="work-poster-deck">
          {projects.map((project, index) => (
            <button
              key={project.title}
              type="button"
              className={`work-poster work-poster-${index + 1} js-stagger-item${hovered === index ? " is-active" : ""}`}
              aria-label={`Explore ${project.title} collection`}
              aria-haspopup="dialog"
              onClick={(event) => open(index, event.currentTarget)}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
            >
              <div className="work-poster-art">
                {galleries[index]?.[0] ? (
                  <img src={galleries[index][0]} alt="" loading="lazy" decoding="async" />
                ) : (
                  <div className="work-poster-placeholder" aria-hidden="true">
                    <span>Creative collection</span>
                    <strong>{project.title}</strong>
                  </div>
                )}
              </div>
              <span className="work-poster-label">
                <span><small>{project.number} / Collection</small><strong>{project.title}</strong></span>
                <span aria-hidden="true">↗</span>
              </span>
            </button>
          ))}
        </div>
        <span className="work-poster-hint">Click a poster here to see the works ↗</span>
      </div>

      {selectedProject && (
        <div className="work-detail-overlay" ref={panelRef}>
          <div className="work-detail-backdrop" onClick={close} aria-hidden="true" />
          <div className="work-detail-sheet" role="dialog" aria-modal="true"
            aria-label={`${selectedProject.title} collection`}>
            <header className="work-detail-header">
              <div>
                <span className="work-detail-kicker">Collection {selectedProject.number} / Selected work</span>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.meta}</p>
              </div>
              <button className="work-detail-close" type="button" ref={closeRef}
                onClick={close} aria-label="Close collection">Close <span aria-hidden="true">×</span></button>
            </header>
            <div className="work-detail-grid">
              {images.length ? images.map((src, i) => (
                <figure className="work-detail-item" key={src}>
                  <img src={src} alt={`${selectedProject.title} artwork ${i + 1}`}
                    loading={i < 3 ? "eager" : "lazy"} />
                  <figcaption>{String(i + 1).padStart(2, "0")} / {selectedProject.title}</figcaption>
                </figure>
              )) : (
                <div className="work-detail-empty work-detail-item">
                  <span>Collection {selectedProject.number}</span>
                  <strong>Work coming soon.</strong>
                  <p>Artwork uploaded to this collection will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
