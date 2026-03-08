import Header from "@/components/Header";
import Filter from "@/components/Filter";
import { GameGrid } from "@/components/GameGrid";
import {
  allCategories,
  getGamesByTag,
  getTagLabelBySlug,
} from "@/lib/games";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const games = getGamesByTag(slug);
  const tagLabel = getTagLabelBySlug(slug);

  const title = tagLabel ? `Tag: ${tagLabel}` : "Games";
  const subtitle = tagLabel ? `Tag: ${tagLabel}` : "";

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
              <span className="font-medium">{games.length}</span> games
            </p>
          </header>

          <GameGrid games={games} />
        </section>
      </main>
    </div>
  );
}
