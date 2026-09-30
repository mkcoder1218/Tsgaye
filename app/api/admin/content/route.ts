import { Buffer } from "node:buffer";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PortfolioContent = {
  name: string;
  role: string;
  location: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  experienceYears: string;
  heroIntro: string;
  disciplines: string[];
  services: Array<{ number: string; title: string; description: string }>;
  projects: Array<{ number: string; title: string; meta: string; visual: string }>;
  about: string;
  experience: Array<{ period: string; company: string; description: string }>;
};

type GitHubContentResponse = {
  sha?: string;
};

type GitHubUpdateResponse = {
  commit?: {
    html_url?: string;
  };
  message?: string;
};

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<PortfolioContent>;

  const strings = [
    data.name,
    data.role,
    data.location,
    data.email,
    data.phoneDisplay,
    data.phoneHref,
    data.experienceYears,
    data.heroIntro,
    data.about,
  ];

  if (!strings.every(isNonEmptyString)) return false;
  if (!Array.isArray(data.disciplines) || !data.disciplines.every(isNonEmptyString)) return false;

  if (!Array.isArray(data.services) || data.services.length === 0) return false;
  if (!data.services.every((item) =>
    item &&
    isNonEmptyString(item.number) &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.description),
  )) return false;

  if (!Array.isArray(data.projects) || data.projects.length === 0) return false;
  if (!data.projects.every((item) =>
    item &&
    isNonEmptyString(item.number) &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.meta) &&
    isNonEmptyString(item.visual),
  )) return false;

  if (!Array.isArray(data.experience) || data.experience.length === 0) return false;
  return data.experience.every((item) =>
    item &&
    isNonEmptyString(item.period) &&
    isNonEmptyString(item.company) &&
    isNonEmptyString(item.description),
  );
}

function serializePortfolio(content: PortfolioContent) {
  return `export const portfolio = ${JSON.stringify(content, null, 2)} as const;\n`;
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.PORTFOLIO_CONTENT_GITHUB_TOKEN;
  const repository =
    process.env.PORTFOLIO_CONTENT_REPOSITORY || "mkcoder1218/Tsgaye";
  const branch = process.env.PORTFOLIO_CONTENT_BRANCH || "main";

  if (!token) {
    return Response.json(
      {
        error:
          "Content publishing is not configured. Add PORTFOLIO_CONTENT_GITHUB_TOKEN to the deployment environment.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as unknown;

  if (!isPortfolioContent(body)) {
    return Response.json(
      { error: "The submitted portfolio content is incomplete or invalid." },
      { status: 400 },
    );
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  const path = "content/portfolio.ts";
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const fileUrl =
    `https://api.github.com/repos/${repository}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

  const currentResponse = await fetch(fileUrl, {
    headers,
    cache: "no-store",
  });

  if (!currentResponse.ok) {
    return Response.json(
      { error: "Could not read the current portfolio content from GitHub." },
      { status: 502 },
    );
  }

  const current = (await currentResponse.json()) as GitHubContentResponse;

  if (!current.sha) {
    return Response.json(
      { error: "GitHub did not return the current content revision." },
      { status: 502 },
    );
  }

  const updateResponse = await fetch(
    `https://api.github.com/repos/${repository}/contents/${encodedPath}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "content: update portfolio from admin",
        content: Buffer.from(serializePortfolio(body), "utf8").toString("base64"),
        sha: current.sha,
        branch,
      }),
      cache: "no-store",
    },
  );

  const result = (await updateResponse.json()) as GitHubUpdateResponse;

  if (!updateResponse.ok) {
    return Response.json(
      { error: result.message || "GitHub rejected the content update." },
      { status: updateResponse.status >= 500 ? 502 : 400 },
    );
  }

  return Response.json({
    ok: true,
    commitUrl: result.commit?.html_url ?? null,
  });
}
