import { portfolio } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";

const visualLabels = ["Identity / 01", "Strategy / 02", "Digital / 03", "Print / 04"] as const;

export function Services() {
  return (
    <section className="section shell expertise-section" id="expertise">
      <div className="expertise-heading">
        <SectionHeading eyebrow="01 — Expertise" title="Ideas with impact." />
        <p className="expertise-deck">From the first sketch to the final impression. Four creative disciplines, one unmistakable point of view.</p>
      </div>
      <div className="expertise-grid">
        {portfolio.services.map((service, index) => (
          <article className={`expertise-card expertise-card-${index + 1}`} key={service.number}>
            <div className="expertise-card-top">
              <span>{service.number} / 04</span>
              <span className="expertise-card-arrow" aria-hidden="true">↗</span>
            </div>
            <div className="expertise-card-visual" aria-hidden="true">
              <span className="expertise-visual-word">{service.title}</span>
            </div>
            <div className="expertise-card-body">
              <span className="expertise-card-label">{visualLabels[index]}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
