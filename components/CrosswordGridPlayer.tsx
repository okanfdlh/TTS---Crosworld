"use client";

import { useState } from "react";

type Cell = {
  letter: string | null;
};

type Props = {
  grid: Cell[][];
};

export default function CrosswordGridPlayer({ grid }: Props) {
  const [answers, setAnswers] = useState(
    grid.map((row) => row.map(() => ""))
  );

  function handleChange(
    row: number,
    col: number,
    value: string
  ) {
    if (!/^[A-Z]?$/.test(value)) return;

    const updated = answers.map((r) => [...r]);
    updated[row][col] = value;
    setAnswers(updated);
  }

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${grid.length}, 32px)` }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell.letter ? (
            <input
              key={`${r}-${c}`}
              maxLength={1}
              value={answers[r][c]}
              onChange={(e) =>
                handleChange(r, c, e.target.value.toUpperCase())
              }
              className="w-8 h-8 border text-center font-bold"
            />
          ) : (
            <div
              key={`${r}-${c}`}
              className="w-8 h-8 bg-gray-300"
            />
          )
        )
      )}
    </div>
  );
}
