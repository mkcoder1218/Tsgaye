import { portfolio } from "@/content/portfolio";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>© {new Date().getFullYear()} {portfolio.name}</span>
        <span>{portfolio.role}</span>
      </div>
    </footer>
  );
}
