"use client";

type Cell = {
  solution: string | null;
  value: string;
};

type Props = {
  cells: Cell[][];
  onChange: (row: number, col: number, value: string) => void;
  activeCell: { row: number; col: number } | null;
  setActiveCell: (pos: { row: number; col: number }) => void;
};

export default function CrosswordPlayerGrid({
  cells,
  onChange,
  activeCell,
  setActiveCell,
}: Props) {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cells[0].length}, 40px)`,
      }}
    >
      {cells.map((row, r) =>
        row.map((cell, c) => {
          if (!cell.solution) {
            return (
              <div
                key={`${r}-${c}`}
                className="w-10 h-10 bg-black"
              />
            );
          }

          const isActive =
            activeCell?.row === r && activeCell?.col === c;

          return (
            <input
              key={`${r}-${c}`}
              value={cell.value}
              maxLength={1}
              onClick={() => setActiveCell({ row: r, col: c })}
              onChange={(e) =>
                onChange(r, c, e.target.value.toUpperCase())
              }
              className={`w-10 h-10 border text-center font-bold uppercase
                ${isActive ? "bg-blue-100 border-blue-500" : ""}
              `}
            />
          );
        })
      )}
    </div>
  );
}