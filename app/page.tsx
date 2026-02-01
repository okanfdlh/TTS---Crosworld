import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Gamepad2, Calendar, Grid } from "lucide-react";
import { GridState } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </header>

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

        {puzzles.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              No puzzles yet. Be the first to create one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puzzles.map((puzzle) => {
              const data = JSON.parse(puzzle.data) as GridState;

              return (
                <Link
                  key={puzzle.id}
                  href={`/puzzle/${puzzle.id}`}
                  className="
                    group block
                    bg-card text-card-foreground
                    p-6 rounded-xl
                    border border-border
                    shadow-sm
                    hover:shadow-md
                    hover:border-primary/40
                    transition
                  "
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold group-hover:text-primary transition">
                      {puzzle.title}
                    </h3>

                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded uppercase">
                      {data.placedWords.length} Words
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Grid className="w-4 h-4" />
                      <span>{data.cols}×{data.rows}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(puzzle.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
