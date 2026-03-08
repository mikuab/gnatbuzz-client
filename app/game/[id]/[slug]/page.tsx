import { notFound, redirect } from "next/navigation";
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
    notFound();
  }

  const canonicalSlug = getGameSlug(game.title);
  if (slug !== canonicalSlug) {
    redirect(`/game/${id}/${canonicalSlug}`);
  }

  const related = getRelatedGames(game, 12);
  const gameJsonLd = buildGameJsonLd(game, id, slug);

  return (
    <div className="min-h-screen bg-[#fdf7ee] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Header categories={allCategories} />
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
