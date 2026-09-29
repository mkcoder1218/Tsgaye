import { SandText } from "@/components/motion/SandText";
import { portfolio } from "@/content/portfolio";

export function Hero() {
  return (
    <section className="hero shell" id="top">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-kicker js-hero-item">
            <span>Independent creative</span>
            <span>Addis Ababa · Ethiopia</span>
          </div>

          <h1 className="hero-title" aria-label="Tsegaye Teshome">
            <SandText
              className="hero-title-line hero-title-primary"
              delay={120}
              colorToken="--ink"
            >
              Tsegaye
            </SandText>

            <SandText
              className="hero-title-line hero-title-outline"
              delay={680}
              colorToken="--accent"
              outline
            >
              Teshome
            </SandText>
          </h1>

          <div className="hero-bottom js-hero-item">
            <p className="hero-intro">{portfolio.heroIntro}</p>

            <div className="hero-actions">
              <a className="hero-button hero-button-primary" href="#work">
                Selected work <span aria-hidden="true">↘</span>
              </a>
              <a
                className="hero-button hero-button-ghost"
                href={`mailto:${portfolio.email}`}
              >
                Start a project
              </a>
            </div>
          </div>
        </div>

        <div className="hero-art js-hero-item">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

          <div className="hero-image-frame">
            <div className="image-placeholder">
              <span className="image-placeholder-label">Portrait / Artwork</span>
              <span className="image-placeholder-mark">+</span>
              <span className="image-placeholder-copy">
                Replace with
                <br />
                Tsegaye&apos;s image
              </span>
            </div>
          </div>

          <div className="hero-sticker hero-sticker-top">
            <span>07+</span>
            <small>Years creating</small>
          </div>

          <div className="hero-sticker hero-sticker-bottom">
            <strong>Branding</strong>
            <span>Print · Digital · Motion</span>
          </div>

          <span className="hero-art-index" aria-hidden="true">
            01
          </span>
        </div>
      </div>

      <div className="hero-marquee js-hero-item" aria-hidden="true">
        <div>
          Brand identity · Art direction · Posters · Digital promotion · 3D ·
          Social design · Brand identity · Art direction · Posters · Digital
          promotion · 3D · Social design ·
        </div>
      </div>
    </section>
  );
}
