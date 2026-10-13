import { getLatestPortfolioImage } from "@/lib/imagekit";
import { portfolio } from "@/content/portfolio";

export async function About() {
  const aboutImage = await getLatestPortfolioImage("about-me", {
    width: 1200,
    quality: 82,
  });

  return (
    <section className="section shell about-editorial" id="about">
      <div className="about-editorial-heading">
        <span className="section-eyebrow">03 — About</span>
        <h2>Creative by instinct.<br /><em>Engineer by training.</em></h2>
        <span className="about-editorial-mark" aria-hidden="true">T / T</span>
      </div>

      <div className="about-editorial-layout">
        <div className={`about-art about-editorial-portrait${aboutImage ? " has-image" : ""}`}>
          <div className="about-editorial-halo" aria-hidden="true" />
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
          <span className="about-editorial-caption">The person behind the perspective <span aria-hidden="true">↗</span></span>
        </div>

        <div className="about-content js-about-copy about-editorial-content">
          <span className="about-editorial-overline">Designer / Engineer / Creator</span>
          <p className="about-copy">{portfolio.about}</p>
          <div className="about-editorial-timeline">
            <span className="about-editorial-timeline-label">The journey <span>2019 — Now</span></span>
            <div className="timeline">
              {portfolio.experience.map((job, index) => (
                <article className="timeline-row js-about-timeline-row" key={`${job.period}-${job.company}`}>
                  <time>{job.period}</time>
                  <div>
                    <span className="about-editorial-timeline-index">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{job.company}</h3>
                    <p>{job.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
