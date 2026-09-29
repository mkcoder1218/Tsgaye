import { portfolio } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <section className="section shell" id="about">
      <SectionHeading eyebrow="03 — About" title="Creative thinking backed by engineering discipline." />
      <div className="about-grid">
        <div className="about-art js-reveal" aria-hidden="true">
          <span className="about-letter">T</span>
          <small>Designer / Engineer / Creator</small>
        </div>
        <div className="about-content js-reveal">
          <p className="about-copy">{portfolio.about}</p>
          <div className="timeline">
            {portfolio.experience.map((job) => (
              <article className="timeline-row" key={`${job.period}-${job.company}`}>
                <time>{job.period}</time>
                <div><h3>{job.company}</h3><p>{job.description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
