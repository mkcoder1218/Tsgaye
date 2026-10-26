import { CinematicText } from "@/components/motion/CinematicText";
import { portfolio } from "@/content/portfolio";
import { getLatestPortfolioImage } from "@/lib/imagekit";

export async function Hero() {
  const heroImage = await getLatestPortfolioImage("hero-image", {
    width: 1200,
    quality: 85,
  });

  return (
    <section className="hero hero-editorial shell" id="top">
      <div className="hero-editorial-stage">
        <div className="hero-editorial-meta js-hero-item">
          <span>Independent creative <i aria-hidden="true" /></span>
          <span>Addis Ababa / Ethiopia</span>
          <span className="hero-edition">Portfolio — 2026</span>
        </div>

        <div className="hero-editorial-glow" aria-hidden="true" />

        <div className="hero-editorial-type">
          <p className="hero-editorial-overline js-hero-item">Graphic designer <span>&amp;</span> creative engineer</p>
          <h1 className="hero-title hero-editorial-title" aria-label="Tsegaye Teshome">
            <CinematicText className="hero-title-line hero-editorial-first" delay={120}>
              Tsegaye
            </CinematicText>
            <CinematicText className="hero-title-line hero-editorial-last" delay={260}>
              Teshome
            </CinematicText>
          </h1>
        </div>

        <div className="hero-art hero-editorial-art js-hero-item">
          <div className="hero-image-frame hero-editorial-image">
            {heroImage ? (
              <img
                className="hero-uploaded-image"
                src={heroImage}
                alt={`${portfolio.name} portrait`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="image-placeholder">
                <span className="image-placeholder-label">Portrait / Artwork</span>
                <span className="image-placeholder-mark">+</span>
                <span className="image-placeholder-copy">Upload a hero portrait</span>
              </div>
            )}
          </div>
        </div>

        <div className="hero-editorial-footer js-hero-item">
          <div className="hero-editorial-summary">
            <span className="hero-editorial-number">01 / 05</span>
            <p>{portfolio.heroIntro}</p>
          </div>
          <div className="hero-editorial-actions">
            <a className="hero-editorial-work" href="#work">
              Explore selected work <span aria-hidden="true">↘</span>
            </a>
            <div className="hero-editorial-downloads">
              <a className="hero-download-button" href="/Tsegaye-Teshome-CV.pdf" download>
                Download CV <span aria-hidden="true">↓</span>
              </a>
              <a className="hero-download-button hero-download-outline" href="/Tsegaye-Teshome-Resume.pdf" download>
                Download Resume <span aria-hidden="true">↓</span>
              </a>
            </div>
            <a className="hero-editorial-contact" href={`mailto:${portfolio.email}`}>
              Have a project? <span>Let&apos;s talk ↗</span>
            </a>
          </div>
        </div>
        <span className="hero-editorial-edge" aria-hidden="true">Scroll to explore — ↓</span>
      </div>
    </section>
  );
}
