"use client";

import { GridState, PlacedWord } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";
import CrosswordPlayerGrid from "@/components/CrosswordPlayerGrid";
import { Check, Share2, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

type Props = {
  initialGrid: GridState;
  title: string;
  id: string;
};

export default function PuzzleClient({ initialGrid, title, id }: Props) {
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Determine which word is currently active based on activeCell and direction
  const activeWord = useMemo(() => {
    if (!activeCell) return null;
    return initialGrid.placedWords.find((w) => {
      if (w.direction !== direction) return false;
      if (direction === "across") {
        return (
          w.row === activeCell.r &&
          activeCell.c >= w.col &&
          activeCell.c < w.col + w.answer.length
        );
      } else {
        return (
          w.col === activeCell.c &&
          activeCell.r >= w.row &&
          activeCell.r < w.row + w.answer.length
        );
      }
    }) || null;
  }, [activeCell, direction, initialGrid.placedWords]);

  const handleCellClick = (r: number, c: number) => {
    if (activeCell?.r === r && activeCell?.c === c) {
      // Toggle direction if clicking same cell
      setDirection(direction === "across" ? "down" : "across");
    } else {
      setActiveCell({ r, c });
    }
  };

  const handleInputChange = (r: number, c: number, char: string) => {
    if (!activeCell) return;
    
    const value = char.slice(-1).toUpperCase();
    if (!/^[A-Z]$/.test(value) && value !== "") return;

    const newInputs = { ...userInputs, [`${r}-${c}`]: value };
    setUserInputs(newInputs);

    if (value) {
      // Move to next cell
      moveCursor(r, c, 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (userInputs[`${r}-${c}`]) {
        // Clear current
        const newInputs = { ...userInputs };
        delete newInputs[`${r}-${c}`];
        setUserInputs(newInputs);
      } else {
        // Move back and clear
        moveCursor(r, c, -1);
      }
    } else if (e.key === "ArrowRight") {
      setActiveCell({ r, c: Math.min(initialGrid.cols - 1, c + 1) });
    } else if (e.key === "ArrowLeft") {
      setActiveCell({ r, c: Math.max(0, c - 1) });
    } else if (e.key === "ArrowDown") {
      setActiveCell({ r: Math.min(initialGrid.rows - 1, r + 1), c });
    } else if (e.key === "ArrowUp") {
      setActiveCell({ r: Math.max(0, r - 1), c });
    }
  };

  const moveCursor = (r: number, c: number, step: number) => {
    if (direction === "across") {
      let nextC = c + step;
      // Skip black cells? For simple implementation, just go to next valid cell
      while (nextC >= 0 && nextC < initialGrid.cols) {
        if (initialGrid.cells[r][nextC].letter) {
          setActiveCell({ r, c: nextC });
          return;
        }
        nextC += step;
      }
    } else {
      let nextR = r + step;
      while (nextR >= 0 && nextR < initialGrid.rows) {
        if (initialGrid.cells[nextR][c].letter) {
          setActiveCell({ r: nextR, c });
          return;
        }
        nextR += step;
      }
    }
  };

  const checkSolution = () => {
    let correct = true;
    let filled = true;

    for (let r = 0; r < initialGrid.rows; r++) {
      for (let c = 0; c < initialGrid.cols; c++) {
        const expected = initialGrid.cells[r][c].letter;
        if (expected) {
          const actual = userInputs[`${r}-${c}`];
          if (!actual) filled = false;
          if (actual !== expected) correct = false;
        }
      }
    }

    if (correct && filled) {
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setShowErrors(true);
      setTimeout(() => setShowErrors(false), 2000);
    }
  };

  const handleClueClick = (word: PlacedWord) => {
    setActiveCell({ r: word.row, c: word.col });
    setDirection(word.direction);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-gray-200 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-500 text-sm">Solved: {Object.keys(userInputs).length} letters</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={checkSolution} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold shadow-sm">
              <Check className="w-4 h-4" /> Check
            </button>
          </div>
        </header>

        {isCompleted && (
           <div className="mb-8 p-6 bg-green-100 rounded-xl border border-green-200 text-center animate-in fade-in slide-in-from-top-4">
             <div className="flex justify-center mb-2">
               <Trophy className="w-12 h-12 text-green-600" />
             </div>
             <h2 className="text-2xl font-bold text-green-800">Congratulations!</h2>
             <p className="text-green-700">You completed the puzzle!</p>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Grid Area */}
          <div className="lg:col-span-7 flex justify-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-auto">
            <CrosswordPlayerGrid
              grid={initialGrid}
              userInputs={userInputs}
              activeCell={activeCell}
              direction={direction}
              onCellClick={handleCellClick}
              onInputChange={handleInputChange}
              onKeyDown={handleKeyDown}
              highlightedWord={activeWord}
            />
          </div>

          {/* Clues Area */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
               <h3 className="text-lg font-bold border-b pb-2 mb-4">Across</h3>
               <div className="space-y-2">
                 {initialGrid.placedWords.filter(w => w.direction === "across").map(word => (
                   <div 
                     key={word.answer}
                     onClick={() => handleClueClick(word)}
                     className={`cursor-pointer p-2 rounded hover:bg-gray-50 text-sm flex gap-2
                       ${activeWord === word ? "bg-blue-50 ring-1 ring-blue-200" : ""}
                     `}
                   >
                     <span className="font-bold w-4 text-right">{word.num}</span>
                     <span>{word.clue}</span>
                   </div>
                 ))}
               </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
               <h3 className="text-lg font-bold border-b pb-2 mb-4">Down</h3>
               <div className="space-y-2">
                 {initialGrid.placedWords.filter(w => w.direction === "down").map(word => (
                   <div 
                     key={word.answer}
                     onClick={() => handleClueClick(word)}
                     className={`cursor-pointer p-2 rounded hover:bg-gray-50 text-sm flex gap-2
                       ${activeWord === word ? "bg-blue-50 ring-1 ring-blue-200" : ""}
                     `}
                   >
                     <span className="font-bold w-4 text-right">{word.num}</span>
                     <span>{word.clue}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
