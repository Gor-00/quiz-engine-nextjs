"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type Props = {
  title?: string;
  description?: string;
};

export function AiGenerateLauncher({
  title = "AI Auto-Generation",
  description = "Pick options and jump to Create Quiz with an AI-generated draft loaded into the editor."
}: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>(
    "history"
  );
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTY_OPTIONS)[number]>(
    "medium"
  );
  const [numQuestions, setNumQuestions] = useState(10);
  const [includeImages, setIncludeImages] = useState(true);

  function go() {
    const params = new URLSearchParams();
    params.set("ai", "1");
    params.set("category", category);
    params.set("difficulty", difficulty);
    params.set("numQuestions", String(numQuestions));
    params.set("includeImages", includeImages ? "1" : "0");
    router.push(`/admin/create-quiz?${params.toString()}`);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">{title}</h2>
          <p className="mt-1 text-xs text-slate-300">{description}</p>
        </div>
        <button
          type="button"
          onClick={go}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
        >
          Generate in Create Quiz
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block text-xs text-slate-300">
          Category
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
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
    </div>
  );
}

