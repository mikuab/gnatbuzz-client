'use client';

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import type { Game, GameSection } from "../lib/games";
import { getCategorySlug, getGameSlug } from "@/lib/games";

type GameCarouselProps = {
  section: GameSection;
  itemsPerPage?: number;
};

export function GameCarousel({ section, itemsPerPage = 8 }: GameCarouselProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const pageSize = Math.max(1, itemsPerPage);

  const pages = useMemo(() => {
    const chunks: Game[][] = [];

    for (let i = 0; i < section.games.length; i += pageSize) {
      chunks.push(section.games.slice(i, i + pageSize));
    }

    return chunks;
  }, [section.games, pageSize]);

  // 与 gap-4 (1rem) 对齐，保证每页内部间距统一
  const cardStyle: CSSProperties = useMemo(() => {
    const gapRem = 1;
    return {
      flex: `0 0 calc((100% - ${(pageSize - 1) * gapRem}rem) / ${pageSize})`,
    };
  }, [pageSize]);

  const [pageIndex, setPageIndex] = useState(0);

  const totalPages = pages.length;
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < totalPages - 1;

  if (!totalPages) {
    return null;
  }

  // 移动端：不分页，直接横向滚动
  if (!isDesktop) {
    return <MobileCarousel section={section} />;
  }

  const goPrev = () => {
    setPageIndex((current) => (current > 0 ? current - 1 : current));
  };

  const goNext = () => {
    setPageIndex((current) =>
      current < totalPages - 1 ? current + 1 : current,
    );
  };

  const viewAllHref = getViewAllHref(section);

  return (
    <section aria-label={section.title} className="space-y-2 md:space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {section.title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-amber-700 hover:underline"
          >
            View all
          </Link>
        )}
      </div>
      <div className="relative">
        {canGoPrev && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous page"
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white md:inline-flex"
          >
            <span className="text-lg leading-none text-slate-700">‹</span>
          </button>
        )}
        {canGoNext && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next page"
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white md:inline-flex"
          >
            <span className="text-lg leading-none text-slate-700">›</span>
          </button>
        )}
        <div className="overflow-hidden px-4">
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${pageIndex * 100}%)` }}
          >
            {pages.map((games, index) => (
              <div
                key={index}
                className="flex min-w-full gap-4 pb-3 pt-1"
                aria-hidden={index !== pageIndex}
              >
                {games.map((game) => (
                  <GameCard key={game.id} game={game} style={cardStyle} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export type GameCardProps = {
  game: Game;
  style?: CSSProperties;
};

export function GameCard({ game, style }: GameCardProps) {
  return (
    <Link
      href={`/game/${game.id}/${getGameSlug(game.title)}`}
      className="group block"
      style={style}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 shadow-sm md:rounded-xl">
        <Image
          src={game.thumb}
          alt={game.title}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-3 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex">
          <span className="line-clamp-2 text-left">{game.title}</span>
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-800 md:hidden">
        {game.title}
      </p>
    </Link>
  );
}

type MobileCarouselProps = {
  section: GameSection;
};

function MobileCarousel({ section }: MobileCarouselProps) {
  return (
    <section aria-label={section.title} className="space-y-2 md:hidden">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">
          {section.title}
        </h2>
      </div>
      <div className="scrollbar-hide overflow-x-auto px-2 pb-1">
        <div className="flex gap-3">
          {section.games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              style={{ flex: "0 0 40%" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(event.matches);
    };

    // 初始化一次
    handler(mql);

    mql.addEventListener("change", handler);
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}

function getViewAllHref(section: GameSection): string | null {
  if (section.kind === "popular") {
    return "/browse?sort=popular";
  }

  if (section.kind === "newest") {
    return "/browse?sort=newest";
  }

  if (section.kind === "category") {
    const baseName = section.categoryName ?? section.title;
    if (!baseName) return null;
    const slug = getCategorySlug(baseName);
    return `/category/${slug}`;
  }

  return null;
}

