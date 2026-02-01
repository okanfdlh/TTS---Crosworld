import { Direction, GridState, PlacedWord } from "@/lib/types";
import { useEffect, useRef } from "react";

type Props = {
  grid: GridState;
  userInputs: Record<string, string>;
  activeCell: { r: number; c: number } | null;
  direction: Direction;
  onCellClick: (r: number, c: number) => void;
  onInputChange: (r: number, c: number, char: string) => void;
  onKeyDown: (e: React.KeyboardEvent, r: number, c: number) => void;
  highlightedWord: PlacedWord | null;
};

export default function CrosswordPlayerGrid({
  grid,
  userInputs,
  activeCell,
  onCellClick,
  onInputChange,
  onKeyDown,
  highlightedWord,
}: Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (activeCell) {
      inputRefs.current[`${activeCell.r}-${activeCell.c}`]?.focus();
    }
  }, [activeCell]);

  const isCellInHighlightedWord = (r: number, c: number) => {
    if (!highlightedWord) return false;

    if (highlightedWord.direction === "across") {
      return (
        r === highlightedWord.row &&
        c >= highlightedWord.col &&
        c < highlightedWord.col + highlightedWord.answer.length
      );
    }

    return (
      c === highlightedWord.col &&
      r >= highlightedWord.row &&
      r < highlightedWord.row + highlightedWord.answer.length
    );
  };

  return (
    <div
      className="grid gap-0.5 border-2 border-black bg-black w-fit select-none"
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, minmax(32px, 1fr))`,
      }}
    >
      {grid.cells.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r}-${c}`;
          const isBlack = !cell.letter;
          const isActive = activeCell?.r === r && activeCell?.c === c;
          const isHighlighted = isCellInHighlightedWord(r, c);
          const value = userInputs[key] || "";

          if (isBlack) {
            return (
              <div
                key={key}
                className="bg-gray-900 w-8 h-8 sm:w-10 sm:h-10"
              />
            );
          }

          return (
            <div
              key={key}
              onClick={() => onCellClick(r, c)}
              className={`
                relative w-8 h-8 sm:w-10 sm:h-10
                flex items-center justify-center
                font-bold uppercase
                cursor-pointer
                ${
                  isActive
                    ? "bg-yellow-200"
                    : isHighlighted
                    ? "bg-blue-100"
                    : "bg-white"
                }
              `}
            >
              {cell.clueIndex && (
                <span
                  className="
                    absolute top-0.5 left-0.5
                    text-[8px] sm:text-[10px]
                    text-gray-600
                    font-normal
                    pointer-events-none
                    select-none
                  "
                >
                  {cell.clueIndex}
                </span>
              )}

              <input
                ref={(el) => {
                  inputRefs.current[key] = el;
                }}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => onInputChange(r, c, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, r, c)}
                className="
                  w-full h-full
                  bg-transparent
                  text-center
                  outline-none
                  uppercase
                  text-base sm:text-xl
                  font-bold
                  text-black
                  caret-black
                "
              />
            </div>
          );
        })
      )}
    </div>
  );
}
