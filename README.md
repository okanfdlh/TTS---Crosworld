# Crossword Puzzle Creator & Player

A full-stack application to create, share, and play crossword puzzles. Built with Next.js 14 (App Router), Tailwind CSS, and Prisma (SQLite).

## Features

### For Creators
- **Smart Generation Algorithm**: Automatically arranges words into a valid crossword grid.
- **Interactive Preview**: See the grid before publishing.
- **Validation**: Ensures puzzles are solvable and valid.
- **Publishing**: Save puzzles with a unique URL.

### For Players
- **Interactive Grid**: Keyboard navigation (Arrow keys), auto-skip filled cells.
- **Clue List**: Click clues to highlight the corresponding word in the grid.
- **Validation**: Check your answers instantly.
- **Celebration**: Confetti on completion!
- **Mobile Responsive**: Play on any device.

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Actions.
- **Database**: SQLite with Prisma ORM.
- **Algorithm**: Randomized Greedy Backtracking with strict validation.

## Algorithm Explanation
The core logic resides in `lib/generator.ts`:
1.  **Sorting**: Words are sorted by length (descending) to place the "backbone" words first.
2.  **Placement Strategy**:
    -   The first word is placed in the center.
    -   Subsequent words are tested against *every* letter of currently placed words to find intersections.
3.  **Validation (`canPlace`)**:
    -   Ensures the word fits within bounds.
    -   Checks that letters match at intersections.
    -   **Crucial**: Checks that the word does not form invalid adjacent 2-letter words with neighbors (isolation check).
4.  **Optimization**: The generator runs multiple attempts (default 20) with shuffled inputs to find the layout that fits the most words.

## How to Run Locally

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Setup Database**
    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is busy).

## Project Structure
-   `app/`: Next.js App Router pages.
    -   `create/`: Puzzle creator.
    -   `puzzle/[id]/`: Player interface.
    -   `actions.ts`: Server actions for database operations.
-   `lib/`: Core logic.
    -   `generator.ts`: The crossword generation algorithm.
    -   `types.ts`: TypeScript definitions.
-   `components/`: Reusable UI components (`CrosswordGrid`, `CrosswordPlayerGrid`).
-   `prisma/`: Database schema.

## Demo Flow
1.  Click "Create New Puzzle".
2.  Add words like "REACT", "NEXTJS", "PRISMA".
3.  Click "Generate Puzzle".
4.  If satisfied, add a Title and click "Publish".
5.  Share the URL or play it yourself!
