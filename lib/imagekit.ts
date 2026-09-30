type ImageKitFile = {
  url?: string;
  fileType?: string;
  createdAt?: string;
};

export async function getLatestPortfolioImage(
  category: string,
): Promise<string | null> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    return null;
  }

  const endpoint = new URL("https://api.imagekit.io/v1/files");
  endpoint.searchParams.set("path", `/portfolio/${category}`);
  endpoint.searchParams.set("limit", "100");

  try {
    const authorization = Buffer.from(`${privateKey}:`).toString("base64");
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Authorization: `Basic ${authorization}`,
      },
    });

    if (!response.ok) {
      console.error(
        `ImageKit list request failed for ${category}: ${response.status}`,
      );
      return null;
    }

    const files = (await response.json()) as ImageKitFile[];

    const latest = files
      .filter((file) => file.url && file.fileType !== "non-image")
      .sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      })[0];

    return latest?.url ?? null;
  } catch (error) {
    console.error(`Could not load ImageKit image for ${category}.`, error);
    return null;
  }
}
