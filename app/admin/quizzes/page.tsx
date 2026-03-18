"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ApiQuiz } from "@/lib/quizTransform";
import { AiGenerateLauncher } from "@/components/admin/AiGenerateLauncher";

type ApiError = {
  error?: string;
  hint?: string;
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function loadQuizzes() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/quizzes", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        const err = data as ApiError;
        throw new Error(err.hint ? `${err.error}\n${err.hint}` : err.error);
      }
      setQuizzes(data as ApiQuiz[]);
    } catch (error) {
      setMessage((error as Error).message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuizzes();
  }, []);

  async function handleDelete(slug: string) {
    const ok = window.confirm(`Delete quiz "${slug}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingSlug(slug);
    setMessage(null);
    try {
      const res = await fetch(`/api/quizzes/${encodeURIComponent(slug)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data as ApiError;
        throw new Error(err.hint ? `${err.error}\n${err.hint}` : err.error);
      }
      setQuizzes((prev) => prev.filter((q) => q.slug !== slug));
      setMessage(`Quiz "${slug}" deleted.`);
    } catch (error) {
      setMessage((error as Error).message || "Failed to delete quiz");
    } finally {
      setDeletingSlug(null);
    }
  }

  const filtered = quizzes.filter((quiz) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      quiz.slug.toLowerCase().includes(q) ||
      quiz.title.toLowerCase().includes(q) ||
      quiz.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
        <Link
          href="/admin"
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-500"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              Manage quizzes
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Edit or delete existing quizzes.
            </p>
          </div>
          <Link
            href="/admin/create-quiz"
            className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white"
          >
            Create new
          </Link>
        </div>
      </section>

      <AiGenerateLauncher
        title="AI Auto-Generation"
        description="Generate a fresh quiz draft and open it in the Create Quiz editor."
      />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
        <div className="mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by slug, title, or category..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {loading ? (
          <p className="text-sm text-slate-300">Loading quizzes…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-300">No quizzes found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((quiz) => (
              <article
                key={quiz.slug}
                className="quiz-card-hover flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
              >
                <div className="relative block aspect-[16/9] bg-slate-950">
                  {quiz.image ? (
                    <Image
                      src={quiz.image}
                      alt={quiz.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-400">
                    <span className="rounded-full bg-indigo-500/15 px-2 py-0.5">
                      {quiz.category}
                    </span>
                    <span className="text-slate-500">
                      {quiz.questions?.length ?? 0} questions
                    </span>
                  </div>
                  <h2 className="line-clamp-2 text-base font-semibold leading-snug">
                    {quiz.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {quiz.description}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    slug: {quiz.slug}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/create-quiz?slug=${encodeURIComponent(
                        quiz.slug
                      )}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-indigo-500"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(quiz.slug)}
                      disabled={deletingSlug === quiz.slug}
                      className="inline-flex items-center justify-center rounded-full border border-red-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {deletingSlug === quiz.slug ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {message && (
          <p className="mt-3 whitespace-pre-line text-xs text-slate-300">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

