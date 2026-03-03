import Header from "@/components/Header";
import Filter from "@/components/Filter";
import { GameGrid } from "@/components/GameGrid";
import {
  allGames,
  getCategories,
  getCategorySlug,
  type Category,
} from "@/lib/games";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = getCategories();
  const category = findCategoryBySlug(categories, slug);

  const title = category ? `${category.label} games` : "Games";
  const subtitle = category ? `Category: ${category.label}` : "";

  const games = allGames.filter((game) => {
    if (category) {
      const target = category.label.toLowerCase();
      return game.category.toLowerCase().includes(target);
    }

    const gameSlug = getCategorySlug(game.category);
    return gameSlug === slug;
  });

  return (
    <div className="min-h-screen bg-[#fdf7ee] text-slate-900">
      <Header categories={categories} />
      <main className="mx-auto flex w-full flex-col gap-4 px-4 pb-16 pt-4 md:gap-8 md:pt-6">
        <Filter categories={categories} />

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

function findCategoryBySlug(categories: Category[], slug: string) {
  return categories.find(
    (category) => getCategorySlug(category.label) === slug,
  );
}

export function generateStaticParams() {
  const categories = getCategories();

  return categories.map((category) => ({
    slug: getCategorySlug(category.label),
  }));
}

