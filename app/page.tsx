import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PortfolioMotion } from "@/components/motion/PortfolioMotion";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";

export default function HomePage() {
  return (
    <PortfolioMotion>
      <Header />
      <main>
        <Hero />
        <Services />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
    </PortfolioMotion>
  );
}
