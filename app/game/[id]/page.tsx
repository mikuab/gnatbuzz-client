import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { GamePlayer } from "@/components/GamePlayer";
import { GameCard } from "@/components/GameCarousel";
import Link from "next/link";
import {
  getGameById,
  getRelatedGames,
  getCategories,
  getTagSlug,
} from "@/lib/games";

type GamePageProps = {
  params: Promise<{ id: string }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  const game = getGameById(id);

  if (!game) {
    notFound();
  }

  const categories = getCategories();
  const related = getRelatedGames(game, 12);

  return (
    <div className="min-h-screen bg-[#fdf7ee] text-slate-900">
      <Header categories={categories} />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:pt-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-4 md:space-y-5">
            {/* PC 直接 iframe，移动端为缩略图 + Play Now */}
            <GamePlayer game={game} />

            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                {game.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="text-amber-500" aria-hidden>★</span>
                  <span>4.2</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                {game.description}
              </p>
            </div>

            {game.category && (
              <p className="text-xs text-slate-500 md:text-sm">
                More From {game.category}
              </p>
            )}
          </div>

          {/* 右侧关联游戏推荐（PC） */}
          <aside className="hidden lg:block">
            <div className="space-y-3">
              <div>
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {game.tags
                    ?.split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Link
                        key={tag}
                        href={`/tag/${getTagSlug(tag)}`}
                        className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100 hover:ring-amber-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  {!game.tags && (
                    <span className="text-xs text-slate-500">No tags</span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Related Games
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {related.slice(0, 10).map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* 移动端：推荐与标签展示在下方 */}
        <section className="mt-8 lg:hidden">
          <div className="space-y-4">
            {game.tags && (
              <div>
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {game.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Link
                        key={tag}
                        href={`/tag/${getTagSlug(tag)}`}
                        className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100 hover:ring-amber-200"
                      >
                        {tag}
                      </Link>
                    ))}
                </div>
              </div>
            )}
            <div>
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                Related Games
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {related.slice(0, 10).map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
