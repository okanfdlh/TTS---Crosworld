"use client";

import { useEffect, useState } from "react";
import CrosswordPlayerGrid from "../../../components/CrosswordPlayerGrid";

type Cell = {
  solution: string | null;
  value: string;
};

export default function PuzzlePage({ puzzle }: any) {
  const [cells, setCells] = useState<Cell[][]>([]);
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    const initial: Cell[][] = puzzle.grid.map((row: any[]) =>
      row.map((cell) => ({
        solution: cell.letter,
        value: "",
      }))
    );

    setCells(initial);
  }, [puzzle]);

  function handleChange(row: number, col: number, value: string) {
    setCells((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[row][col].value = value;
      return copy;
    });
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        Crossword Puzzle
      </h1>

      <CrosswordPlayerGrid
        cells={cells}
        activeCell={activeCell}
        setActiveCell={setActiveCell}
        onChange={handleChange}
      />
    </main>
  );
}
