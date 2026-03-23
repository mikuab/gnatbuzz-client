import gamesData from "../public/data/games.json";

export type Game = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  url: string;
  category: string;
  tags: string;
  thumb: string;
  width: number;
  height: number;
  supports_mobile: boolean;
  is_featured?: boolean;
  featured_at?: string;
};

export type GameSectionKind = "popular" | "featured" | "newest" | "category";

export type GameSection = {
  id: string;
  title: string;
  games: Game[];
  kind: GameSectionKind;
  categoryName?: string;
};

export type GameSectionConfig = {
  id: string;
  title: string;
  kind: GameSectionKind;
  categoryName?: string;
  limit?: number;
};

const allGames: Game[] = gamesData as Game[];
const allCategories: string[] = getCategories();

export function getGameSections(): GameSection[] {
  const maxLimit = 30;
  const featuredGames = allGames
    .filter((game) => game.is_featured)
    .sort(
      (a, b) =>
        new Date(b.featured_at ?? 0).getTime() -
        new Date(a.featured_at ?? 0).getTime(),
    );
  const categorySections = allCategories.map((category) => ({
    id: category,
    title: `${category} games`,
    kind: "category",
    categoryName: category,
    limit: maxLimit,
    games: allGames.filter((game) => game.category === category),
  }));
  const sortedByIdDesc = [...allGames].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );
  return [
  {
    id: "featured",
    title: "Featured games",
    kind: "featured",
    limit: maxLimit,
    games: featuredGames.slice(0, maxLimit),
  },
  {
    id: "new",
    title: "New games",
    kind: "newest",
    limit: maxLimit,
    games: sortedByIdDesc.slice(0, maxLimit),
  }, ...categorySections] as GameSection[];
}

export function getCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** 游戏标题转 URL slug：全小写，空格替换为 - */
export function getGameSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** 标签转 URL slug，与 getCategorySlug 规则一致 */
export function getTagSlug(tag: string): string {
  return getCategorySlug(tag);
}

/** 根据标签 slug 获取包含该标签的所有游戏 */
export function getGamesByTag(tagSlug: string): Game[] {
  const slugLower = tagSlug.toLowerCase().trim();
  if (!slugLower) return [];
  return allGames.filter((game) => {
    const tags = game.tags
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];
    return tags.some((t) => getTagSlug(t) === slugLower);
  });
}

/** 根据标签 slug 取一个展示用标签名（来自首个匹配游戏的原始 tag 文本） */
export function getTagLabelBySlug(tagSlug: string): string | null {
  const slugLower = tagSlug.toLowerCase().trim();
  if (!slugLower) return null;
  for (const game of allGames) {
    const tags = game.tags
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];
    const found = tags.find((t) => getTagSlug(t) === slugLower);
    if (found) return found;
  }
  return null;
}

export function getTopCategories(limit = 16): string[] {
  const counts = new Map<string, number>();

  for (const game of allGames) {
    const name = game.category?.trim();
    if (!name) continue;

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

function getCategories(): string[] {
  const categories = new Map<string, number>();
  for (const game of allGames) {
    if (game.category) {
      categories.set(game.category, (categories.get(game.category) ?? 0) + 1);
    }
  }
  return Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

export function getGameById(id: string): Game | undefined {
  return allGames.find((g) => g.id === id);
}

/**
 * 获取与当前游戏关联性高的推荐游戏（同分类 + 标签重叠）
 */
export function getRelatedGames(game: Game, limit = 24): Game[] {
  const categoryLower = game.category?.toLowerCase().trim() ?? "";
  const tagSet = new Set(
    game.tags
      ?.toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [],
  );

  const scored = allGames
    .filter((g) => g.id !== game.id)
    .map((g) => {
      let score = 0;
      if (categoryLower && g.category?.toLowerCase().includes(categoryLower)) {
        score += 3;
      }
      const gTags = g.tags
        ?.toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [];
      const shared = gTags.filter((t) => tagSet.has(t));
      score += shared.length;
      return { game: g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.game);
}

export { allGames, allCategories };

