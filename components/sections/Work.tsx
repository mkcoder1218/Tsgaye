import { portfolio } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Work() {
  return (
    <section className="section shell work-section" id="work">
      <SectionHeading
        eyebrow="02 — Selected work"
        title="Visual work that should take up space."
      />

      <div className="work-lead js-reveal">
        <p>
          Tsegaye works across identity, promotional design, print, social and
          digital media. These frames are ready for his real portfolio artwork.
        </p>
        <span>Images coming next ↘</span>
      </div>

      <div className="work-grid js-stagger-group">
        {portfolio.projects.map((project, index) => (
          <article className={`work-card work-card-${index + 1} js-stagger-item`} key={project.title}>
            <div className="work-media">
              <div className={`portfolio-placeholder portfolio-placeholder-${index + 1}`}>
                <span className="portfolio-placeholder-label">
                  Image placeholder
                </span>
                <span className="portfolio-placeholder-cross" aria-hidden="true">
                  +
                </span>
                <div className="portfolio-placeholder-name">
                  <span>Drop artwork here</span>
                  <strong>{project.title}</strong>
                </div>
                <span className="portfolio-placeholder-number" aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
            </div>

            <div className="work-caption">
              <div>
                <h3>{project.title}</h3>
                <p>{project.meta}</p>
              </div>
              <span>{project.number}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
