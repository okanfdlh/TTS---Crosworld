import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Gamepad2, Calendar, Grid } from "lucide-react";
import { GridState } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 pb-16 pt-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Crossword Creator
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, share, and play crossword puzzles. Generate custom grids instantly with our smart algorithm.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" /> Create New Puzzle
          </Link>
        </div>
      </div>

      {/* Puzzle List */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Recent Puzzles</h2>
        </div>

        {puzzles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No puzzles yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puzzles.map((puzzle) => {
              const data = JSON.parse(puzzle.data) as GridState;
              return (
                <Link
                  key={puzzle.id}
                  href={`/puzzle/${puzzle.id}`}
                  className="group block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {puzzle.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded uppercase">
                      {data.placedWords.length} Words
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Grid className="w-4 h-4" />
                      <span>{data.cols}x{data.rows}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(puzzle.createdAt).toLocaleDateString()}</span>
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
