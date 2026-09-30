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
        <div className={`about-art${aboutImage ? " has-image" : ""}`}>
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
