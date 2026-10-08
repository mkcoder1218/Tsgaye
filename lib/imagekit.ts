type ImageKitFile = {
  url?: string;
  fileType?: string;
  createdAt?: string;
};

type ImageOptimizationOptions = {
  width?: number;
  quality?: number;
};

function getOptimizedImageUrl(
  url: string,
  { width = 1200, quality = 82 }: ImageOptimizationOptions = {},
) {
  const optimized = new URL(url);
  optimized.searchParams.set(
    "tr",
    `w-${width},q-${quality},f-auto,pr-true`,
  );
  return optimized.toString();
}

export async function getLatestPortfolioImage(
  category: string,
  optimization: ImageOptimizationOptions = {},
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
      headers: {
        Authorization: `Basic ${authorization}`,
      },
      next: { revalidate: 300 },
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

    return latest?.url
      ? getOptimizedImageUrl(latest.url, optimization)
      : null;
  } catch (error) {
    console.error(`Could not load ImageKit image for ${category}.`, error);
    return null;
  }
}

export async function getPortfolioImages(
  category: string,
  optimization: ImageOptimizationOptions = {},
): Promise<string[]> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return [];
  const endpoint = new URL("https://api.imagekit.io/v1/files");
  endpoint.searchParams.set("path", `/portfolio/${category}`);
  endpoint.searchParams.set("limit", "100");
  try {
    const authorization = Buffer.from(`${privateKey}:`).toString("base64");
    const response = await fetch(endpoint, {
      headers: { Authorization: `Basic ${authorization}` },
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const files = (await response.json()) as ImageKitFile[];
    return files
      .filter((file) => Boolean(file.url) && file.fileType !== "non-image")
      .sort((a, b) =>
        (b.createdAt ? Date.parse(b.createdAt) : 0) -
        (a.createdAt ? Date.parse(a.createdAt) : 0),
      )
      .map((file) => getOptimizedImageUrl(file.url!, optimization));
  } catch (error) {
    console.error(`Could not load ImageKit gallery for ${category}.`, error);
    return [];
  }
}
