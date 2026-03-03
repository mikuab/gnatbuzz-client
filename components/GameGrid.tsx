import type { Game } from "@/lib/games";
import { GameCard } from "./GameCarousel";

type GameGridProps = {
  games: Game[];
};

export function GameGrid({ games }: GameGridProps) {
  if (!games.length) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No games found. Try a different category or search term.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

