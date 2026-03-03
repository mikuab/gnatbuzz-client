import Header from "../components/Header";
import { GameCarousel } from "../components/GameCarousel";
import { getCategories, getGameSections } from "@/lib/games";
import Filter from "@/components/Filter";

const sections = getGameSections();
const categories = getCategories();

export const metadata = {
  title: "GnatBuzz - Free Online Games - Play Action, Puzzle & Arcade Games",
  description:
    "Play the best free online games. Action games, puzzle games, racing games and more. No download required.",
  keywords: [
    "free online games",
    "no download games",
    "action games",
    "puzzle games",
    "browser games"
  ]
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdf7ee] text-slate-900">
      <Header categories={categories} />
      <main className="mx-auto flex w-full flex-col gap-4 px-4 pb-16 pt-4 md:gap-8 md:pt-6">
        <Filter categories={categories} />
        <section aria-label="Game sections" className="space-y-2 md:space-y-6">
          {sections.map((section) => (
            <GameCarousel key={section.id} section={section} />
          ))}
        </section>
      </main>
    </div>
  );
}
