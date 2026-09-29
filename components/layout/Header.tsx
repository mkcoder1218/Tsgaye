import { portfolio } from "@/content/portfolio";

export function Header() {
  return (
    <header className="site-header">
      <nav className="shell navigation" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Tsegaye Teshome home">
          Tsegaye Teshome<span>®</span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav-cta" href={`mailto:${portfolio.email}`}>
          Let&apos;s work <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
