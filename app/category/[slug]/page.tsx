import Header from "@/components/Header";
import Filter from "@/components/Filter";
import { GameGrid } from "@/components/GameGrid";
import {
  allGames,
  allCategories,
  getCategorySlug,
} from "@/lib/games";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = findCategoryBySlug(allCategories, slug);

  const title = category ? `${category} games` : "Games";
  const subtitle = category ? `Category: ${category}` : "";

  const games = allGames.filter((game) => {
    if (category) {
      const target = category.toLowerCase();
      return game.category.toLowerCase().includes(target);
    }

    const gameSlug = getCategorySlug(game.category);
    return gameSlug === slug;
  });

  return (
    <div className="min-h-screen bg-[#fdf7ee] text-slate-900">
      <Header categories={allCategories} />
      <main className="mx-auto flex w-full flex-col gap-4 px-4 pb-16 pt-4 md:gap-8 md:pt-6">
        <Filter categories={allCategories} />

        <section className="space-y-4 md:space-y-6">
          <header className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 md:text-sm">{subtitle}</p>
            )}
            <p className="text-xs text-slate-500 md:text-sm">
              Total{" "}
              <span className="font-medium">
                {games.length}
              </span>{" "}
              games
            </p>
          </header>

          <GameGrid games={games} />
        </section>
      </main>
    </div>
  );
}

function findCategoryBySlug(categories: string[], slug: string) {
  return categories.find(
    (category) => getCategorySlug(category) === slug,
  );
}
