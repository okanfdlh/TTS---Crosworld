import { Cell, Direction, GridState, InputWord, PlacedWord } from "./types";

const GRID_SIZE = 20; // Working grid size, will be cropped later

export function generateCrossword(words: InputWord[]): GridState {
  let bestGrid: GridState | null = null;
  let maxPlaced = -1;

  // Try multiple attempts to find the best layout
  for (let attempt = 0; attempt < 20; attempt++) {
    const result = generateAttempt(words);
    if (result.placedWords.length > maxPlaced) {
      maxPlaced = result.placedWords.length;
      bestGrid = result;
    }
    // If we placed all words, stop early
    if (maxPlaced === words.length) break;
  }

  if (!bestGrid) throw new Error("Failed to generate crossword");

  return cropGrid(bestGrid);
}

function generateAttempt(words: InputWord[]): GridState {
  // Initialize empty grid
  const grid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ letter: null }))
  );

  const placedWords: PlacedWord[] = [];
  
  // Sort words by length (descending) as a heuristic
  // Shuffle words of same length to get variety across attempts
  const sorted = [...words]
    .sort((a, b) => b.answer.length - a.answer.length || Math.random() - 0.5);

  if (sorted.length === 0) {
    return { rows: GRID_SIZE, cols: GRID_SIZE, cells: grid, placedWords: [] };
  }

  // Place first word in center
  const first = sorted[0];
  const startRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - first.answer.length) / 2);
  
  placeWordOnGrid(grid, first.answer, startRow, startCol, "across");
  placedWords.push({
    ...first,
    row: startRow,
    col: startCol,
    direction: "across",
    num: 0, // Assigned later
  });

  // Try to place remaining words
  const remaining = sorted.slice(1);
  
  // Loop through remaining words and try to place them
  // We repeat the loop because placing one word might open spots for previously skipped words
  let madeProgress = true;
  while (madeProgress) {
    madeProgress = false;
    
    for (let i = 0; i < remaining.length; i++) {
      const word = remaining[i];
      // Check if already placed
      if (placedWords.some(pw => pw.answer === word.answer)) continue;

      const placement = findBestPlacement(grid, word.answer, placedWords);
      if (placement) {
        placeWordOnGrid(grid, word.answer, placement.row, placement.col, placement.direction);
        placedWords.push({
          ...word,
          row: placement.row,
          col: placement.col,
          direction: placement.direction,
          num: 0,
        });
        madeProgress = true;
      }
    }
  }

  // Assign numbers
  const finalWords = assignNumbers(placedWords);

  return {
    rows: GRID_SIZE,
    cols: GRID_SIZE,
    cells: grid,
    placedWords: finalWords,
  };
}

function findBestPlacement(
  grid: Cell[][],
  word: string,
  placedWords: PlacedWord[]
): { row: number; col: number; direction: Direction } | null {
  const potentialPlacements: Array<{ row: number; col: number; direction: Direction; intersections: number }> = [];

  // Iterate over all placed words to find intersection points
  for (const pw of placedWords) {
    for (let i = 0; i < word.length; i++) { // char index in new word
      for (let j = 0; j < pw.answer.length; j++) { // char index in placed word
        if (word[i] === pw.answer[j]) {
          // Found a matching letter. 
          // If placed word is ACROSS, new word must be DOWN, and intersect at (pw.row, pw.col + j)
          // New word starts at:
          //   row = pw.row - i
          //   col = pw.col + j
          
          const direction = pw.direction === "across" ? "down" : "across";
          const row = direction === "down" ? pw.row - i : pw.row + j;
          const col = direction === "down" ? pw.col + j : pw.col - i;

          if (canPlace(grid, word, row, col, direction)) {
            // Count intersections for this placement
            const intersections = countIntersections(grid, word, row, col, direction);
            potentialPlacements.push({ row, col, direction, intersections });
          }
        }
      }
    }
  }

  if (potentialPlacements.length === 0) return null;

  // Pick the one with most intersections, or random among best
  potentialPlacements.sort((a, b) => b.intersections - a.intersections);
  return potentialPlacements[0];
}

function canPlace(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: Direction
): boolean {
  if (row < 0 || col < 0) return false;
  if (direction === "across") {
    if (col + word.length > GRID_SIZE) return false;
  } else {
    if (row + word.length > GRID_SIZE) return false;
  }

  // Check Head (cell before word)
  const headRow = direction === "across" ? row : row - 1;
  const headCol = direction === "across" ? col - 1 : col;
  if (isValidCell(headRow, headCol) && grid[headRow][headCol].letter !== null) return false;

  // Check Tail (cell after word)
  const tailRow = direction === "across" ? row : row + word.length;
  const tailCol = direction === "across" ? col + word.length : col;
  if (isValidCell(tailRow, tailCol) && grid[tailRow][tailCol].letter !== null) return false;

  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;
    const currentCell = grid[r][c];

    // Conflict check
    if (currentCell.letter !== null && currentCell.letter !== word[i]) {
      return false;
    }

    // If cell is empty, we must ensure it doesn't form invalid adjacent words
    if (currentCell.letter === null) {
      // Check neighbors perpendicular to direction
      if (direction === "across") {
        // Check Up and Down
        if (isValidCell(r - 1, c) && grid[r - 1][c].letter !== null) return false;
        if (isValidCell(r + 1, c) && grid[r + 1][c].letter !== null) return false;
      } else {
        // Check Left and Right
        if (isValidCell(r, c - 1) && grid[r][c - 1].letter !== null) return false;
        if (isValidCell(r, c + 1) && grid[r][c + 1].letter !== null) return false;
      }
    }
  }

  return true;
}

function countIntersections(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: Direction
): number {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;
    if (grid[r][c].letter === word[i]) {
      count++;
    }
  }
  return count;
}

function placeWordOnGrid(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: Direction
) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;
    grid[r][c].letter = word[i];
  }
}

function isValidCell(row: number, col: number) {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function assignNumbers(words: PlacedWord[]): PlacedWord[] {
  // Sort by row then col
  const sorted = [...words].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  let currentNum = 1;
  // We need to group words that start at the same location
  // Map "row,col" -> number
  const coordsToNum = new Map<string, number>();

  for (const word of sorted) {
    const key = `${word.row},${word.col}`;
    if (!coordsToNum.has(key)) {
      coordsToNum.set(key, currentNum++);
    }
    word.num = coordsToNum.get(key)!;
  }

  return sorted;
}

function cropGrid(state: GridState): GridState {
  let minRow = GRID_SIZE, maxRow = 0;
  let minCol = GRID_SIZE, maxCol = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (state.cells[r][c].letter) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  // Add some padding
  minRow = Math.max(0, minRow - 1);
  maxRow = Math.min(GRID_SIZE - 1, maxRow + 1);
  minCol = Math.max(0, minCol - 1);
  maxCol = Math.min(GRID_SIZE - 1, maxCol + 1);

  const newRows = maxRow - minRow + 1;
  const newCols = maxCol - minCol + 1;
  const newCells = Array.from({ length: newRows }, () =>
    Array.from({ length: newCols }, () => ({ letter: null } as Cell))
  );

  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      newCells[r][c] = state.cells[r + minRow][c + minCol];
    }
  }

  const adjustedWords = state.placedWords.map(pw => ({
    ...pw,
    row: pw.row - minRow,
    col: pw.col - minCol
  }));

  // Re-map numbers to cells in the cropped grid
  // We need to clear old clueIndices and set new ones
  // But wait, the cells are copied by reference if not careful? 
  // Above we did a shallow copy of objects.
  // Actually, we should just regenerate the clue indices on the cells based on the adjusted words.
  
  // Clear any existing clue indices in the new grid
  for(let r=0; r<newRows; r++) {
    for(let c=0; c<newCols; c++) {
      if(newCells[r][c].letter) {
         // Create new object to detach reference
         newCells[r][c] = { letter: newCells[r][c].letter, clueIndex: undefined };
      }
    }
  }

  for (const pw of adjustedWords) {
    if (newCells[pw.row][pw.col]) {
      newCells[pw.row][pw.col].clueIndex = pw.num;
    }
  }

  return {
    rows: newRows,
    cols: newCols,
    cells: newCells,
    placedWords: adjustedWords
  };
}
