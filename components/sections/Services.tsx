import { portfolio } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Services() {
  return (
    <section className="section shell" id="expertise">
      <SectionHeading eyebrow="01 — Expertise" title="Design built to be seen, understood and remembered." />
      <div className="services-grid js-stagger-group">
        {portfolio.services.map((service) => (
          <article className="service-card js-stagger-item" key={service.title}>
            <span className="service-number">{service.number}</span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
