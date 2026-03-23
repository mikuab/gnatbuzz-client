import type { MetadataRoute } from "next";
import {
  allGames,
  allCategories,
  getCategorySlug,
  getTagSlug,
  getGameSlug,
} from "@/lib/games";
import { getBaseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = allGames.map((game) => ({
    url: `${baseUrl}/game/${encodeURIComponent(game.id)}/${encodeURIComponent(
      getGameSlug(game.title),
    )}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categorySlugs = allCategories.map((name) => getCategorySlug(name));
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${encodeURIComponent(slug)}`,
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
    url: `${baseUrl}/tag/${encodeURIComponent(slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...gameRoutes, ...categoryRoutes, ...tagRoutes];
}
