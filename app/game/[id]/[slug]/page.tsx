import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { GamePlayer } from "@/components/GamePlayer";
import { GameCard } from "@/components/GameCarousel";
import Link from "next/link";
import {
  getGameById,
  getRelatedGames,
  allCategories,
  getTagSlug,
  getGameSlug,
} from "@/lib/games";
import { getBaseUrl } from "@/lib/site";
import type { Game } from "@/lib/games";

const META_DESCRIPTION_MAX_LENGTH = 155;

function truncateDescription(text: string, maxLen: number = META_DESCRIPTION_MAX_LENGTH): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 3).trim() + "...";
}

function buildGameJsonLd(game: Game, id: string, slug: string): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/game/${id}/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": url,
    name: game.title,
    description: game.description,
    url,
    applicationCategory: "Game",
    image: game.thumb,
    screenshot: game.thumb,
    ...(game.category && { genre: game.category }),
    ...(game.tags && {
      keywords: game.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }),
  };
}

export async function generateMetadata({ params }: GamePageProps) {
  const { id, slug } = await params;
  const game = getGameById(id);
  if (!game || getGameSlug(game.title) !== slug) {
    return {};
  }

  const canonicalPath = `/game/${id}/${slug}`;
  const description = truncateDescription(
    [game.description, game.tags].filter(Boolean).join(" · ") || game.title
  );

  return {
    title: `${game.title} - Play Free Online`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: `${game.title} - Play Free Online`,
      description,
      siteName: "GnatBuzz",
      images: [
        {
          url: game.thumb,
          width: game.width,
          height: game.height,
          alt: game.title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} - Play Free Online`,
      description,
      images: [game.thumb],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

type GamePageProps = {
  params: Promise<{ id: string; slug: string }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { id, slug } = await params;
  const game = getGameById(id);

  if (!game) {
    redirect("/");
  }

  const canonicalSlug = getGameSlug(game.title);
  if (decodeURIComponent(slug) !== canonicalSlug) {
    redirect("/");
  }

  const related = getRelatedGames(game, 24);
  const gameJsonLd = buildGameJsonLd(game, id, slug);

  return (
    <div className="flex min-h-screen flex-col bg-[#fdf7ee] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Header categories={allCategories} />
      {/* PC：main 填满视口剩余高度，随窗口等比例变化；移动端保持自然流式布局 */}
      <main className="mx-auto flex min-h-0 flex-1 flex-col px-4 pb-16 pt-4 md:pt-6 lg:h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:flex-none">
        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:grid lg:h-full lg:flex-none lg:grid-cols-[1fr_280px] lg:items-stretch lg:gap-6">
          {/* 左侧：播放区 + 详情 */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-0">
            <div className="min-h-0 flex-1 lg:min-h-0">
              <GamePlayer game={game} />
            </div>
            <div className="mt-4 flex shrink-0 flex-col justify-center lg:mt-3 lg:min-h-[5rem] lg:max-h-[7.5rem]">
              <h1 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                {game.title}
              </h1>
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-700 md:line-clamp-3 md:text-base">
                {game.description}
              </p>
              {game.category && (
                <p className="mt-1 shrink-0 text-xs text-slate-500 md:text-sm">
                  More From {game.category}
                </p>
              )}
            </div>
          </div>

          {/* 右侧：Tags + 推荐（PC），内容多时可滚动 */}
          <aside className="hidden min-h-0 lg:block lg:w-[280px] lg:shrink-0">
            <div className="space-y-3 pr-1">
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
                  {related.map((g) => (
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
