import { getPortfolioImages } from "@/lib/imagekit";
import { SectionHeading } from "@/components/ui/SectionHeading";

const categories = ["marketing-design", "brand-identity", "print-editorial", "digital-motion"] as const;

export async function Services() {
  const galleries = await Promise.all(
    categories.map((category) => getPortfolioImages(category, { width: 1100, quality: 84 })),
  );
  const artwork = galleries.flatMap((images) => images.slice(0, 4)).slice(0, 9);

  return (
    <section className="section shell expertise-section expertise-mosaic" id="expertise">
      <div className="expertise-heading">
        <SectionHeading eyebrow="01 — Expertise" title="Ideas with impact." />
        <p className="expertise-deck">
          From the first sketch to the final impression. Four creative disciplines,
          one unmistakable point of view.
        </p>
      </div>
      <div className="expertise-mosaic-viewport" aria-label="Tsegaye Teshome selected creative artwork">
        {artwork.length > 0 && (
          <div className="expertise-mosaic-track">
            {[0, 1].map((copy) => (
              <div
                className="expertise-mosaic-grid"
                key={copy}
                aria-hidden={copy === 1}
              >
                {artwork.map((src, index) => (
                  <figure className="expertise-mosaic-tile" key={`${copy}-${src}-${index}`}>
                    <img
                      src={src}
                      alt={copy === 0 ? `Selected creative portfolio design ${index + 1}` : ""}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                ))}
              </div>
            ))}
          </div>
        )}
        {artwork.length === 0 && (
          <p className="expertise-mosaic-empty">
            Portfolio artwork will appear here when uploaded to the gallery.
          </p>
        )}
      </div>
    </section>
  );
}
