import { portfolio } from "@/content/portfolio";
import { getPortfolioImages } from "@/lib/imagekit";
import { WorkGallery } from "@/components/sections/WorkGallery";

const categories = [
  "brand-identity",
  "marketing-design",
  "print-editorial",
  "digital-motion",
] as const;

export async function Work() {
  const galleries = await Promise.all(
    categories.map((category) => getPortfolioImages(category, { width: 1300, quality: 82 })),
  );

  return <WorkGallery projects={portfolio.projects} galleries={galleries} />;
}
