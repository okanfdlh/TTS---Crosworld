"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  RefreshCw,
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { generateCrossword } from "@/lib/generator";
import { GridState } from "@/lib/types";
import CrosswordGrid from "@/components/CrosswordGrid";

type WordItem = {
  id: number;
  answer: string;
  clue: string;
};

const sanitizeAnswer = (value: string) =>
  value.toUpperCase().replace(/[^A-Z]/g, "");

export default function CreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [words, setWords] = useState<WordItem[]>([
    { id: 1, answer: "REACT", clue: "A JavaScript library for building user interfaces" },
    { id: 2, answer: "NEXTJS", clue: "The React Framework for the Web" },
    { id: 3, answer: "VERCEL", clue: "Platform for frontend frameworks and static sites" },
    { id: 4, answer: "TYPESCRIPT", clue: "JavaScript with syntax for types" },
    { id: 5, answer: "TAILWIND", clue: "A utility-first CSS framework" },
  ]);

  const [grid, setGrid] = useState<GridState | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /* ---------------- helpers ---------------- */

  const getValidWords = () =>
    words.filter((w) => w.answer.length >= 2 && w.clue.trim().length > 0);

  /* ---------------- handlers ---------------- */

  const addWord = () => {
    setWords((prev) => [
      ...prev,
      { id: Date.now(), answer: "", clue: "" },
    ]);
  };

  const removeWord = (id: number) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWord = (
    id: number,
    field: "answer" | "clue",
    value: string
  ) => {
    setWords((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
            ...w,
            [field]: field === "answer" ? sanitizeAnswer(value) : value,
          }
          : w
      )
    );
  };

  const handleGenerate = () => {
    setError("");

    const validWords = getValidWords();
    if (validWords.length < 2) {
      setError("Please add at least 2 valid words with clues.");
      return;
    }

    try {
      const result = generateCrossword(validWords);
      setGrid(result);
    } catch {
      setError("Failed to generate puzzle. Try different or shorter words.");
    }
  };

  const handleSave = async () => {
    if (!grid || !title.trim()) return;

    setIsSaving(true);
    setError("");

    try {
      const res = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          gridState: grid,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save puzzle");
      }

      const puzzle = await res.json();
      router.push(`/puzzle/${puzzle.id}`);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save puzzle.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- render ---------------- */

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Puzzle
            </h1>
          </div>

          {grid && (
            <button
              onClick={handleSave}
              disabled={!title || isSaving}
              className="flex items-center gap-2 px-6 py-2
                       bg-green-600 text-white rounded-lg
                       disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Publish
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="bg-background p-6 rounded-xl
                        border border-black/10 dark:border-white/10">
            <label className="block text-sm font-medium mb-1 text-foreground">
              Puzzle Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Web Dev Challenge"
              className="w-full px-4 py-2 mb-6 rounded-lg
                       bg-background text-foreground
                       border border-black/20 dark:border-white/20
                       placeholder:text-black/40
                       dark:placeholder:text-white/40"
            />

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {words.map((word, index) => (
                <div
                  key={word.id}
                  className="flex gap-3 items-start p-3 rounded-lg
                           bg-background
                           border border-black/10 dark:border-white/10"
                >
                  <span className="mt-2 text-sm text-black/40 dark:text-white/40">
                    {index + 1}
                  </span>

                  <div className="flex-1 space-y-2">
                    <input
                      value={word.answer}
                      onChange={(e) =>
                        updateWord(word.id, "answer", e.target.value)
                      }
                      placeholder="ANSWER"
                      className="w-full px-3 py-1.5 rounded
                               bg-background text-foreground
                               border border-black/20 dark:border-white/20
                               font-mono uppercase
                               placeholder:text-black/40
                               dark:placeholder:text-white/40"
                    />

                    <input
                      value={word.clue}
                      onChange={(e) =>
                        updateWord(word.id, "clue", e.target.value)
                      }
                      placeholder="Clue"
                      className="w-full px-3 py-1.5 rounded
                               bg-background text-foreground
                               border border-black/20 dark:border-white/20
                               placeholder:text-black/40
                               dark:placeholder:text-white/40"
                    />
                  </div>

                  <button
                    onClick={() => removeWord(word.id)}
                    className="text-black/40 dark:text-white/40
                             hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addWord}
              className="w-full mt-4 py-2 rounded-lg
                       border-2 border-dashed
                       border-black/30 dark:border-white/30
                       text-black/50 dark:text-white/50"
            >
              <Plus className="inline w-4 h-4 mr-2" />
              Add Word
            </button>

            <button
              onClick={handleGenerate}
              className="w-full mt-6 py-3
                       bg-blue-600 text-white
                       rounded-lg font-bold"
            >
              <RefreshCw className="inline w-4 h-4 mr-2" />
              Generate Puzzle
            </button>

            {error && (
              <div className="mt-4 p-3 rounded
                            bg-red-500/10
                            text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="bg-background p-6 rounded-xl
                        border border-black/10 dark:border-white/10
                        flex items-center justify-center">
            {grid ? (
              <CrosswordGrid grid={grid} />
            ) : (
              <p className="text-black/40 dark:text-white/40 text-center">
                Add words and click Generate
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
