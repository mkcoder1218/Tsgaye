import { portfolio } from "@/content/portfolio";
import { getPortfolioImages } from "@/lib/imagekit";

const categories = [
  "brand-identity",
  "brand-identity",
  "marketing-design",
  "print-editorial",
] as const;

const subtitles = ["Visual identity", "Brand worlds", "Digital campaigns", "Print & editorial"] as const;

export async function Services() {
  const galleries = await Promise.all(
    categories.map((category) => getPortfolioImages(category, { width: 1100, quality: 82 })),
  );

  return (
    <>
      {portfolio.services.map((service, index) => {
        const images = galleries[index].slice(0, 6);
        return (
          <section
            className={`section expertise-slide expertise-slide-${index + 1}`}
            id={index === 0 ? "expertise" : `expertise-${service.title.toLowerCase()}`}
            key={service.number}
            aria-label={`${service.title} expertise`}
          >
            <div className="expertise-slide-inner">
              <div className="expertise-slide-copy">
                <p className="expertise-slide-kicker section-eyebrow">
                  <span>01 — Expertise</span>
                  <span>{service.number} / 04</span>
                </p>
                <p className="expertise-slide-eyebrow">{subtitles[index]}</p>
                <h2>{service.title}<span className="expertise-slide-period">.</span></h2>
                <p className="expertise-slide-description">{service.description}</p>
                <a className="expertise-slide-link" href="#work">
                  Explore selected work <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="expertise-slide-stage" aria-label={`${service.title} portfolio examples`}>
                <span className="expertise-slide-deco" aria-hidden="true">{service.number}</span>
                <div className="expertise-slide-gallery">
                  {Array.from({ length: 6 }, (_, imageIndex) => (
                    <figure
                      className={`expertise-slide-piece expertise-card expertise-slide-piece-${imageIndex + 1}`}
                      key={imageIndex}
                    >
                      {images[imageIndex] ? (
                        <img
                          src={images[imageIndex]}
                          alt={`${service.title} portfolio artwork ${imageIndex + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="expertise-slide-placeholder" aria-hidden="true">
                          <span>{service.title}</span>
                          <strong>{String(imageIndex + 1).padStart(2, "0")}</strong>
                        </div>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
              <div className="expertise-slide-foot">
                <span>Tsegaye Teshome / Creative portfolio</span>
                <span>{String(index + 2).padStart(2, "0")} — 06 <span aria-hidden="true">↓</span></span>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
