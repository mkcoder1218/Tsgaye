import { cache } from "react";
import { portfolio as fallback } from "@/content/portfolio";

export type PortfolioContent = {
  name: string; role: string; location: string; email: string;
  phoneDisplay: string; phoneHref: string; experienceYears: string;
  heroIntro: string; disciplines: string[];
  services: Array<{ number: string; title: string; description: string }>;
  projects: Array<{ number: string; title: string; meta: string; visual: string }>;
  about: string;
  experience: Array<{ period: string; company: string; description: string }>;
};
export type DocumentLinks = { cv: string; resume: string };

async function readGitHubJson<T>(path: string, defaultValue: T): Promise<T> {
  const repository = process.env.PORTFOLIO_CONTENT_REPOSITORY || "mkcoder1218/Tsgaye";
  const branch = process.env.PORTFOLIO_CONTENT_BRANCH || "main";
  const token = process.env.PORTFOLIO_CONTENT_GITHUB_TOKEN;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/contents/${encoded}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
    return await response.json() as T;
  } catch (error) {
    console.error(`Unable to read ${path}:`, error);
    return defaultValue;
  }
}

// Requests are always fresh; React deduplicates repeated reads during one render.
export const getLivePortfolio = cache(() =>
  readGitHubJson<PortfolioContent>("content/portfolio.json", fallback as unknown as PortfolioContent),
);
export const getDocumentLinks = cache(() =>
  readGitHubJson<DocumentLinks>("content/document-links.json", { cv: "/cv.pdf", resume: "/resume.pdf" }),
);
