import { prisma } from "@/lib/prisma";
import CrosswordGridPlayer from "../../../components/CrosswordGridPlayer";

type Props = {
  params: { id: string };
};

export default async function PuzzlePage({ params }: Props) {
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: Number(params.id) },
  });

  if (!puzzle) {
    return <div className="p-8">Puzzle not found</div>;
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Crossword Puzzle #{puzzle.id}
      </h1>

      <div className="flex gap-8">
        <CrosswordGridPlayer grid={puzzle.grid as any} />

        <div>
          <h2 className="font-semibold mb-2">Clues</h2>
          <ul className="space-y-1 text-sm">
            {(puzzle.words as any[]).map((w, i) => (
              <li key={i}>
                <strong>
                  {w.direction === "across" ? "Across" : "Down"}
                </strong>{" "}
                ({w.answer.length}) – {w.clue}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
