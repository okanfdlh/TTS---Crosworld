"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Check, Share2, ArrowLeft, Trophy } from "lucide-react";

import { GridState, PlacedWord } from "@/lib/types";
import CrosswordPlayerGrid from "@/components/CrosswordPlayerGrid";

type Props = {
  initialGrid: GridState;
  title: string;
  id: string;
};

export default function PuzzleClient({ initialGrid, title }: Props) {
  /* ---------------- state ---------------- */

  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);

  /* ---------------- memo ---------------- */

  const activeWord = useMemo<PlacedWord | null>(() => {
    if (!activeCell) return null;

    return (
      initialGrid.placedWords.find((w) => {
        if (w.direction !== direction) return false;

        if (direction === "across") {
          return (
            w.row === activeCell.r &&
            activeCell.c >= w.col &&
            activeCell.c < w.col + w.answer.length
          );
        }

        return (
          w.col === activeCell.c &&
          activeCell.r >= w.row &&
          activeCell.r < w.row + w.answer.length
        );
      }) || null
    );
  }, [activeCell, direction, initialGrid]);

  /* ---------------- helpers ---------------- */

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  const moveCursor = (r: number, c: number, step: number) => {
    if (direction === "across") {
      let nextC = c + step;
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

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  useEffect(() => {
    let correct = 0;

    for (let r = 0; r < initialGrid.rows; r++) {
      for (let c = 0; c < initialGrid.cols; c++) {
        const expected = initialGrid.cells[r][c].letter;
        if (expected && userInputs[`${r}-${c}`] === expected) {
          correct++;
        }
      }
    }

    setScore(correct);
  }, [userInputs, initialGrid]);

  /* ---------------- handlers ---------------- */

  const handleCellClick = (r: number, c: number) => {
    if (activeCell?.r === r && activeCell?.c === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setActiveCell({ r, c });
    }
  };

  const handleInputChange = (r: number, c: number, char: string) => {
    const value = char.slice(-1).toUpperCase();
    if (!/^[A-Z]$/.test(value) && value !== "") return;

    setUserInputs((prev) => ({ ...prev, [`${r}-${c}`]: value }));
    if (value) moveCursor(r, c, 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setUserInputs((prev) => {
        if (prev[`${r}-${c}`]) {
          const copy = { ...prev };
          delete copy[`${r}-${c}`];
          return copy;
        }
        moveCursor(r, c, -1);
        return prev;
      });
    }
  };

  const handleClueClick = (word: PlacedWord) => {
    setActiveCell({ r: word.row, c: word.col });
    setDirection(word.direction);
  };

  const checkSolution = () => {
    if (isCompleted) return;

    let filled = true;
    let correct = true;

    for (let r = 0; r < initialGrid.rows; r++) {
      for (let c = 0; c < initialGrid.cols; c++) {
        const expected = initialGrid.cells[r][c].letter;
        if (!expected) continue;

        const actual = userInputs[`${r}-${c}`];
        if (!actual) filled = false;
        if (actual !== expected) correct = false;
      }
    }

    if (filled && correct) {
      setIsCompleted(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } else {
      setShowErrors(true);
      setTimeout(() => setShowErrors(false), 1500);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              <p className="text-sm text-black/50 dark:text-white/50">
                ⏱ {formatTime(seconds)} · ⭐ Score: {score}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       border border-black/20 dark:border-white/20
                       hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>

            <button
              onClick={checkSolution}
              className="flex items-center gap-2 px-4 py-2
                       bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 text-sm font-bold"
            >
              <Check className="w-4 h-4" /> Check
            </button>
          </div>
        </header>

        {/* Success */}
        {isCompleted && (
          <div className="mb-8 p-6 rounded-xl text-center
                        bg-green-500/10
                        text-green-600 dark:text-green-400
                        border border-green-500/30">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Puzzle Completed 🎉</h2>
            <p className="text-sm">
              Time: {formatTime(seconds)} · Final Score: {score}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Grid */}
          <div
            className="lg:col-span-7 flex justify-center overflow-auto
                     bg-background p-6 rounded-xl
                     border border-black/10 dark:border-white/10"
          >
            <CrosswordPlayerGrid
              grid={initialGrid}
              userInputs={userInputs}
              activeCell={activeCell}
              direction={direction}
              onCellClick={handleCellClick}
              onInputChange={handleInputChange}
              onKeyDown={handleKeyDown}
              highlightedWord={activeWord}
              showErrors={showErrors}
            />
          </div>

          {/* Clues */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {(["across", "down"] as const).map((dir) => (
              <div
                key={dir}
                className="bg-background p-6 rounded-xl
                         border border-black/10 dark:border-white/10 flex-1"
              >
                <h3 className="text-lg font-bold border-b border-black/10 dark:border-white/10 pb-2 mb-4 capitalize">
                  {dir}
                </h3>

                <div className="space-y-2">
                  {initialGrid.placedWords
                    .filter((w) => w.direction === dir)
                    .map((word) => (
                      <div
                        key={word.num}
                        onClick={() => handleClueClick(word)}
                        className={`cursor-pointer p-2 rounded text-sm flex gap-2
                        hover:bg-black/5 dark:hover:bg-white/10
                        ${activeWord === word
                            ? "bg-blue-500/10 ring-1 ring-blue-500/30"
                            : ""
                          }
                      `}
                      >
                        <span className="font-bold w-5 text-right">
                          {word.num}
                        </span>
                        <span>{word.clue}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
