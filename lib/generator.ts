import { Cell, PlacedWord } from "./types";

const GRID_SIZE = 15;

/**
 * Generate crossword grid from words
 * Strategy:
 * 1. Place first word in the center (across)
 * 2. For each next word, try to intersect with existing words
 * 3. Skip word if cannot be placed
 */
export function generateCrossword(words: { answer: string; clue: string }[]) {
  // init empty grid
  const grid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ letter: null }))
  );

  const placedWords: PlacedWord[] = [];

  // sort words by length (longer first)
  const sorted = [...words].sort(
    (a, b) => b.answer.length - a.answer.length
  );

  // place first word
  const first = sorted[0];
  const startCol = Math.floor((GRID_SIZE - first.answer.length) / 2);
  const startRow = Math.floor(GRID_SIZE / 2);

  first.answer.split("").forEach((char, i) => {
    grid[startRow][startCol + i].letter = char;
  });

  placedWords.push({
    answer: first.answer,
    clue: first.clue,
    row: startRow,
    col: startCol,
    direction: "across",
  });

  // place remaining words
  for (let i = 1; i < sorted.length; i++) {
    const word = sorted[i];
    let placed = false;

    for (const pw of placedWords) {
      for (let j = 0; j < pw.answer.length; j++) {
        for (let k = 0; k < word.answer.length; k++) {
          if (pw.answer[j] !== word.answer[k]) continue;

          const row =
            pw.direction === "across" ? pw.row - k : pw.row + j;
          const col =
            pw.direction === "across" ? pw.col + j : pw.col - k;

          const direction =
            pw.direction === "across" ? "down" : "across";

          if (canPlace(grid, word.answer, row, col, direction)) {
            placeWord(grid, word.answer, row, col, direction);

            placedWords.push({
              answer: word.answer,
              clue: word.clue,
              row,
              col,
              direction,
            });

            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (placed) break;
    }
  }

  return { grid, placedWords };
}

// ---------- helpers ----------

function canPlace(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down"
) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;

    if (r < 0 || c < 0 || r >= grid.length || c >= grid.length)
      return false;

    if (grid[r][c].letter && grid[r][c].letter !== word[i])
      return false;
  }
  return true;
}

function placeWord(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down"
) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;
    grid[r][c].letter = word[i];
  }
}
