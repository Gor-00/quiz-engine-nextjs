"use client";

import { useEffect, useState } from "react";
import type { DbQuiz } from "@/lib/adminTypes";

type Props = {
  quiz: DbQuiz;
  setQuiz: React.Dispatch<React.SetStateAction<DbQuiz>>;
  isEdit: boolean;
  onMessage?: (message: string) => void;
  initial?: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
    numQuestions?: number;
    includeImages?: boolean;
    autoGenerate?: boolean;
  };
};

const CATEGORY_OPTIONS = [
  "history",
  "science",
  "sports",
  "geography",
  "movies",
  "music",
  "nostalgia"
] as const;

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"] as const;

export function AiAutoGeneration({
  quiz,
  setQuiz,
  isEdit,
  onMessage,
  initial
}: Props) {
  const [category, setCategory] = useState(
    initial?.category || quiz.category || "history"
  );
  const [difficulty, setDifficulty] = useState<
    (typeof DIFFICULTY_OPTIONS)[number]
  >(initial?.difficulty || "medium");
  const [numQuestions, setNumQuestions] = useState(initial?.numQuestions ?? 10);
  const [includeImages, setIncludeImages] = useState(
    initial?.includeImages ?? true
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    onMessage?.("Generating quiz with AI…");

    try {
      const res = await fetch("/api/admin/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          difficulty,
          numQuestions,
          includeImages
        })
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate quiz");
      }

      const generated = data as DbQuiz;

      setQuiz((prev) => ({
        ...prev,
        ...generated,
        slug: isEdit ? prev.slug : generated.slug
      }));

      onMessage?.("AI quiz generated. You can edit inline before saving.");
    } catch (e) {
      setError((e as Error).message);
      onMessage?.("AI generation failed.");
    } finally {
      setLoading(false);
    }
  }

  const [autoRan, setAutoRan] = useState(false);

  useEffect(() => {
    if (!initial?.autoGenerate) return;
    if (autoRan) return;
    if (loading) return;
    setAutoRan(true);
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.autoGenerate, autoRan]);

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            AI Auto-Generation
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Generate a full multi-language quiz JSON and load it into the form for
            inline editing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void generate()}
          disabled={loading}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Quiz"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block text-xs text-slate-300">
          Category
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-300">
          Difficulty
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-300">
          Questions
          <input
            type="number"
            min={1}
            max={30}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value || 10))}
          />
        </label>

        <label className="flex items-end gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={includeImages}
            onChange={(e) => setIncludeImages(e.target.checked)}
            className="h-4 w-4 rounded border border-slate-700 bg-slate-950"
          />
          Include images
        </label>
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      <p className="text-[11px] text-slate-400">
        Tip: Click “Generate Quiz” multiple times to regenerate, then edit and save
        using the existing Save button.
      </p>
    </div>
  );
}

