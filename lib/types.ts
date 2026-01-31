export type Direction = "across" | "down";

export type PlacedWord = {
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
};

export type Cell = {
  letter: string | null;
};
