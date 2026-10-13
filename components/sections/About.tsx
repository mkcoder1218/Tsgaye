import { getLatestPortfolioImage } from "@/lib/imagekit";
import { portfolio } from "@/content/portfolio";

export async function About() {
  const aboutImage = await getLatestPortfolioImage("about-me", {
    width: 1200,
    quality: 82,
  });

  return (
    <section className="section shell about-gallery" id="about">
      <div className="about-gallery-stage">
        <span className="about-gallery-index section-eyebrow">03 / The person</span>
        <span className="about-gallery-watermark" aria-hidden="true">ABOUT</span>
        <div className="about-gallery-orbit" aria-hidden="true" />

        <div className="about-gallery-copy about-content js-about-copy">
          <p className="about-gallery-kicker">Art direction / Engineering / Imagination</p>
          <h2 className="about-gallery-headline">
            Not just<br />a <em>designer.</em>
          </h2>
          <p className="about-gallery-subhead">A different way of seeing.</p>
          <p className="about-gallery-bio">{portfolio.about}</p>
          <span className="about-gallery-signature">Tsegaye Teshome <span aria-hidden="true">↗</span></span>
        </div>

        <div className={`about-art about-gallery-portrait${aboutImage ? " has-image" : ""}`}>
          {aboutImage ? (
            <div className="about-image-stage">
              <img
                className="about-art-image"
                src={aboutImage}
                alt={`${portfolio.name} portrait`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          ) : (
            <span className="about-letter">T</span>
          )}
          <span className="about-gallery-photo-index">Portrait / 001</span>
        </div>

        <div className="about-gallery-experience">
          <span className="about-gallery-experience-label">Selected experience <span>2019 — Now</span></span>
          <div className="about-gallery-career">
            {portfolio.experience.map((job, index) => (
              <article className="about-gallery-career-item js-about-timeline-row" key={`${job.period}-${job.company}`}>
                <span className="about-gallery-career-number">0{index + 1}</span>
                <time>{job.period}</time>
                <h3>{job.company}</h3>
                <p>{job.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
