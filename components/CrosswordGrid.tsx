type Props = {
  grid: { letter: string | null }[][];
};

export default function CrosswordGrid({ grid }: Props) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${grid.length}, 32px)` }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-8 h-8 border text-center flex items-center justify-center
              ${cell.letter ? "bg-white" : "bg-gray-200"}`}
          >
            {cell.letter}
          </div>
        ))
      )}
    </div>
  );
}
