import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Available Crossword Puzzles
      </h1>

      <ul className="space-y-2">
        {puzzles.map((p) => (
          <li key={p.id}>
            <Link
              href={`/puzzle/${p.id}`}
              className="text-blue-600 underline"
            >
              Puzzle #{p.id}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/create"
        className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create New Puzzle
      </Link>
    </main>
  );
}
