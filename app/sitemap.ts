import type { MetadataRoute } from "next";
import {
  allGames,
  getCategorySlug,
  getTagSlug,
  getTopCategories,
} from "@/lib/games";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://example.com";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = allGames.map((game) => ({
    url: `${baseUrl}/game/${game.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categorySlugs = getTopCategories(50).map((name) => getCategorySlug(name));
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const tagSlugSet = new Set<string>();
  for (const game of allGames) {
    const tags = game.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
    for (const t of tags) tagSlugSet.add(getTagSlug(t));
  }
  const tagRoutes: MetadataRoute.Sitemap = [...tagSlugSet].map((slug) => ({
    url: `${baseUrl}/tag/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...gameRoutes, ...categoryRoutes, ...tagRoutes];
}
