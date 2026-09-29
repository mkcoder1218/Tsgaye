import { portfolio } from "@/content/portfolio";

export function Hero() {
  return (
    <section className="hero shell" id="top">
      <div className="hero-main">
        <p className="hero-eyebrow js-hero-item">Addis Ababa, Ethiopia · Graphic Designer</p>
        <h1 aria-label="Tsegaye Teshome">
          <span className="hero-line js-hero-line">Tsegaye</span>
          <span className="hero-line hero-line-accent js-hero-line">Teshome</span>
        </h1>
      </div>
      <div className="hero-footer js-hero-item">
        <p className="hero-intro">{portfolio.heroIntro}</p>
        <div className="hero-meta">
          <strong>{portfolio.experienceYears} years of design experience</strong>
          <span>{portfolio.disciplines.join(" · ")}</span>
        </div>
        <a className="scroll-link" href="#work">Explore work <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
