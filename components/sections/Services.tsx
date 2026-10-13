import { portfolio } from "@/content/portfolio";
import { getPortfolioImages } from "@/lib/imagekit";
import { SectionHeading } from "@/components/ui/SectionHeading";

const categories = [
  "brand-identity",
  "marketing-design",
  "print-editorial",
  "digital-motion",
] as const;

export async function Services() {
  const galleries = await Promise.all(
    categories.map((category) =>
      getPortfolioImages(category, { width: 900, quality: 82 }),
    ),
  );
  const artwork = galleries.flatMap((images) => images.slice(0, 3)).slice(0, 8);

  return (
    <section className="section shell expertise-section expertise-showcase" id="expertise">
      <div className="expertise-heading">
        <SectionHeading eyebrow="01 — Expertise" title="Ideas with impact." />
        <p className="expertise-deck">
          From the first sketch to the final impression. Four creative disciplines,
          one unmistakable point of view.
        </p>
      </div>

      <div className="expertise-showcase-layout">
        <div className="expertise-showcase-copy">
          <span className="expertise-showcase-index">Creative disciplines / 01—04</span>
          <div className="expertise-showcase-services">
            {portfolio.services.map((service) => (
              <div className="expertise-showcase-service" key={service.number}>
                <span>{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          <a className="expertise-showcase-link" href="#work">
            Explore the work <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="expertise-showcase-art" aria-label="Selected portfolio artworks">
          <div className="expertise-showcase-stack">
            {Array.from({ length: 8 }, (_, index) => (
              <figure
                className={`expertise-showcase-print expertise-card expertise-showcase-print-${index + 1}`}
                key={index}
              >
                {artwork[index] ? (
                  <img
                    src={artwork[index]}
                    alt={`Tsegaye Teshome portfolio artwork ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="expertise-showcase-placeholder" aria-hidden="true">
                    <span>Selected work</span>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                  </div>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
