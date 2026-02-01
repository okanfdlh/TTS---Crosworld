import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Gamepad2, Calendar, Grid } from "lucide-react";
import { GridState } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { dummyPuzzle } from "@/lib/dummy-puzzle";

export const dynamic = "force-dynamic";

export default async function Home() {
  // fetch from DB
  const dbPuzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
  });

  // fallback to dummy puzzle
  const puzzles = dbPuzzles.length > 0 ? dbPuzzles : [dummyPuzzle];
  const isUsingDummy = dbPuzzles.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Hero Section */}
      <div className="border-b border-border pb-16 pt-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Crossword Creator
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, share, and play crossword puzzles.
            Generate custom grids instantly with our smart algorithm.
          </p>

          <Link
            href="/create"
            className="
              inline-flex items-center gap-2
              px-8 py-4
              bg-primary text-primary-foreground
              rounded-full
              text-lg font-bold
              shadow-lg
              hover:shadow-xl
              transition
              hover:-translate-y-0.5
            "
          >
            <Plus className="w-6 h-6" />
            Create New Puzzle
          </Link>
        </div>
      </div>

      {/* Puzzle List */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Recent Puzzles</h2>
        </div>

        {isUsingDummy && (
          <p className="mb-6 text-sm text-muted-foreground">
            Showing a sample puzzle because the database is empty.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzles.map((puzzle) => {
            const data = JSON.parse(puzzle.data) as GridState;
            const isSample = puzzle.id === "dummy-puzzle";

            const Card = (
              <div
                className={`
                  group block
                  bg-card text-card-foreground
                  p-6 rounded-xl
                  border border-border
                  shadow-sm
                  transition
                  ${
                    isSample
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:shadow-md hover:border-primary/40"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-primary transition">
                    {puzzle.title}
                  </h3>

                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded uppercase">
                    {isSample
                      ? "Sample"
                      : `${data.placedWords.length} Words`}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Grid className="w-4 h-4" />
                    <span>
                      {data.cols}×{data.rows}
                    </span>
                  </div>

                  {!isSample && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(puzzle.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );

            // clickable only if NOT dummy
            return isSample ? (
              <div key={puzzle.id}>{Card}</div>
            ) : (
              <Link key={puzzle.id} href={`/puzzle/${puzzle.id}`}>
                {Card}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
