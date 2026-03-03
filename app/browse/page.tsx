import Header from "@/components/Header";
import Filter from "@/components/Filter";
import { GameGrid } from "@/components/GameGrid";
import { allGames, getCategories } from "@/lib/games";

type BrowsePageProps = {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    sort?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const categories = getCategories();

  const query = params.q?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const sort = params.sort?.trim() ?? "";

  const { filteredGames, title, subtitle } = getFilteredGames({
    query,
    tag,
    sort,
  });

  const total = filteredGames.length;

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
              <p className="text-xs text-slate-500 md:text-sm">
                {subtitle}
              </p>
            )}
            <p className="text-xs text-slate-500 md:text-sm">
              Showing{" "}
              <span className="font-medium">
                {total}
              </span>{" "}
              games
            </p>
          </header>

          <GameGrid games={filteredGames} />
        </section>
      </main>
    </div>
  );
}

type FilterOptions = {
  query: string;
  tag: string;
  sort: string;
};

function getFilteredGames(options: FilterOptions) {
  const { query, tag, sort } = options;
  let games = allGames;
  let title = "All games";
  let subtitle = "";

  if (sort === "newest") {
    games = [...games].sort((a, b) => Number(b.id) - Number(a.id));
    title = "New games";
  } else if (sort === "popular") {
    games = games;
    title = "Popular games";
  }

  if (tag) {
    const target = tag.toLowerCase();
    games = games.filter((game) =>
      game.tags.toLowerCase().includes(target),
    );
    title = `Games tagged "${tag}"`;
  }
  if (query) {
    const keyword = query.toLowerCase();
    games = games.filter((game) => {
      return (
        game.title.toLowerCase().includes(keyword) ||
        game.description.toLowerCase().includes(keyword) ||
        game.tags.toLowerCase().includes(keyword) ||
        game.category.toLowerCase().includes(keyword)
      );
    });
    title = `Search results for "${query}"`;
    subtitle = "";
  }

  if (query) {
    subtitle = `Keyword: ${query}`;
  } else if (sort === "newest") {
    subtitle = "Newest games first";
  } else if (sort === "popular") {
    subtitle = "Most popular games";
  }

  return { filteredGames: games, title, subtitle };
}
