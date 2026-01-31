"use client";

import { useState } from "react";
import CrosswordGrid from "@/components/CrosswordGrid";
import { generateCrossword } from "@/lib/generator";

type WordInput = {
  answer: string;
  clue: string;
};

type PlacedWord = {
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
};

type PreviewResult = {
  grid: { letter: string | null }[][];
  placedWords: PlacedWord[];
};

export default function CreatePage() {
  const [words, setWords] = useState<WordInput[]>([
    { answer: "", clue: "" },
  ]);

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  function addWord() {
    setWords([...words, { answer: "", clue: "" }]);
  }

  function removeWord(index: number) {
    setWords(words.filter((_, i) => i !== index));
  }

  function updateWord(
    index: number,
    field: keyof WordInput,
    value: string
  ) {
    const updated = [...words];

    if (field === "answer") {
      updated[index][field] = value
        .toUpperCase()
        .replace(/[^A-Z]/g, "");
    } else {
      updated[index][field] = value;
    }

    setWords(updated);
  }

  function validate() {
    if (words.length < 5) return false;
    return words.every(
      (w) => w.answer.trim().length > 0 && w.clue.trim().length > 0
    );
  }

  function handleGenerate() {
    if (!validate()) {
      alert("Minimum 5 words with valid answers & clues");
      return;
    }

    const result = generateCrossword(words);
    setPreview(result);
  }

  async function handlePublish() {
    if (!preview) return;

    setLoading(true);

    const res = await fetch("/api/puzzles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Crossword ${new Date().toLocaleString()}`,
        grid: preview.grid,
        words: preview.placedWords,
      }),
    });

    const puzzle = await res.json();
    window.location.href = `/puzzle/${puzzle.id}`;
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        Create Crossword Puzzle
      </h1>

      <div className="space-y-4">
        {words.map((word, index) => (
          <div
            key={index}
            className="border p-4 rounded-md space-y-2"
          >
            <input
              type="text"
              placeholder="Answer (A-Z)"
              value={word.answer}
              onChange={(e) =>
                updateWord(index, "answer", e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="text"
              placeholder="Clue"
              value={word.clue}
              onChange={(e) =>
                updateWord(index, "clue", e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
            />

            {words.length > 1 && (
              <button
                onClick={() => removeWord(index)}
                className="text-sm text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addWord}
        className="mt-4 px-4 py-2 bg-gray-200 rounded"
      >
        + Add Word
      </button>

      <p className="text-sm text-gray-500 mt-2">
        Words: {words.length} / Minimum 5
      </p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={!validate()}
          className={`px-6 py-2 rounded text-white
            ${
              validate()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Generate TTS
        </button>

        {preview && (
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Publishing..." : "Publish Puzzle"}
          </button>
        )}
      </div>

      {preview && (
        <div className="mt-8">
          <h2 className="font-bold mb-2">Preview</h2>
          <CrosswordGrid grid={preview.grid} />
        </div>
      )}
    </main>
  );
}
