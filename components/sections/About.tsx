import { getLatestPortfolioImage } from "@/lib/imagekit";
import { portfolio } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function About() {
  const aboutImage = await getLatestPortfolioImage("about-me", {
    width: 1200,
    quality: 82,
  });

  return (
    <section className="section shell" id="about">
      <SectionHeading
        eyebrow="03 — About"
        title="Creative thinking backed by engineering discipline."
      />

      <div className="about-grid">
        <div
          className={`about-art js-reveal${aboutImage ? " has-image" : ""}`}
          aria-hidden="true"
        >
          {aboutImage ? (
            <>
              <div className="about-image-wrap js-about-image">
                <img
                  className="about-art-image"
                  src={aboutImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-color-slab" />
              <div className="about-dot-field" />
            </>
          ) : (
            <span className="about-letter">T</span>
          )}

          <div className="about-image-tag">
            <span>03</span>
            <strong>Portrait</strong>
          </div>

          <small>Designer / Engineer / Creator</small>
        </div>

        <div className="about-content js-about-copy">
          <p className="about-copy">{portfolio.about}</p>
          <div className="timeline">
            {portfolio.experience.map((job) => (
              <article
                className="timeline-row js-about-timeline-row"
                key={`${job.period}-${job.company}`}
              >
                <time>{job.period}</time>
                <div>
                  <h3>{job.company}</h3>
                  <p>{job.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
