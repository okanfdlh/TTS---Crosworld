import { GridState } from "@/lib/types";

export const dummyPuzzle = {
  id: "dummy-puzzle",
  title: "Sample Crossword",
  createdAt: new Date(),
  data: JSON.stringify({
    rows: 5,
    cols: 5,
    cells: [
      [{ letter: "H" }, { letter: "E" }, { letter: "L" }, { letter: "L" }, { letter: "O" }],
      [{ letter: null }, { letter: null }, { letter: null }, { letter: null }, { letter: null }],
      [{ letter: "W" }, { letter: "O" }, { letter: "R" }, { letter: "L" }, { letter: "D" }],
      [{ letter: null }, { letter: null }, { letter: null }, { letter: null }, { letter: null }],
      [{ letter: "T" }, { letter: "E" }, { letter: "S" }, { letter: "T" }, { letter: null }],
    ],
    placedWords: [
      {
        answer: "HELLO",
        clue: "Greeting",
        row: 0,
        col: 0,
        direction: "across",
        num: 1,
      },
      {
        answer: "WORLD",
        clue: "The earth",
        row: 2,
        col: 0,
        direction: "across",
        num: 2,
      },
    ],
  } satisfies GridState),
};
