export type Direction = "across" | "down";

export interface Cell {
  letter: string | null;
  clueIndex?: number; // The number displayed in the cell (e.g. "1")
}

export interface InputWord {
  answer: string;
  clue: string;
}

export interface PlacedWord extends InputWord {
  row: number;
  col: number;
  direction: Direction;
  num: number; // The clue number (e.g. 1, 2, 3)
}

export interface GridState {
  rows: number;
  cols: number;
  cells: Cell[][];
  placedWords: PlacedWord[];
}
