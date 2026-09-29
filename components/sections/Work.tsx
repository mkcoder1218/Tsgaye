import { portfolio } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Work() {
  return (
    <section className="section shell work-section">
      <SectionHeading eyebrow="02 — Selected work" title="A practice spanning identity, promotion, print and digital design." />
      <div className="work-grid js-stagger-group">
        {portfolio.projects.map((project) => (
          <article className="work-card js-stagger-item" key={project.title}>
            <div className={`work-visual work-visual-${project.visual}`} aria-hidden="true">
              {project.visual === "monogram" ? <span>TT</span> : null}
              {project.visual === "editorial" ? <span>Aa</span> : null}
              {project.visual === "motion" ? <span>↗</span> : null}
            </div>
            <div className="work-caption">
              <div><h3>{project.title}</h3><p>{project.meta}</p></div>
              <span>{project.number}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
