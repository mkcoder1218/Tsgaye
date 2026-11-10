import { getLivePortfolio } from "@/lib/livePortfolio";

export async function Footer() {
  const portfolio = await getLivePortfolio();
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>© {new Date().getFullYear()} {portfolio.name}</span>
        <span>{portfolio.role}</span>
      </div>
    </footer>
  );
}
