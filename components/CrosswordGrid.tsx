import { GridState } from "@/lib/types";

type Props = {
  grid: GridState;
};

export default function CrosswordGrid({ grid }: Props) {
  return (
    <div
      className="grid gap-0.5 border-2 border-black bg-black w-fit"
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, minmax(32px, 1fr))`,
      }}
    >
      {grid.cells.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold uppercase select-none
              ${cell.letter ? "bg-white text-black" : "bg-gray-900"}`}
          >
            {cell.clueIndex && (
              <span className="absolute top-0.5 left-0.5 text-[10px] leading-none text-gray-600 font-normal">
                {cell.clueIndex}
              </span>
            )}
            {cell.letter}
          </div>
        ))
      )}
    </div>
  );
}
