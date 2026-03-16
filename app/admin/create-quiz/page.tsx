"use client";

import { useState } from "react";
import type { LanguageCode, Question } from "@/lib/types";
import { LANGS, emptyLocalized, type DbQuiz } from "@/lib/adminTypes";

type Step = 1 | 2 | 3 | 4;

const defaultQuiz: DbQuiz = {
  slug: "",
  title: emptyLocalized(""),
  description: emptyLocalized(""),
  category: "history",
  image: "",
  questions: [],
  resultMessages: {
    "0-3": emptyLocalized("Better luck next time!"),
    "4-7": emptyLocalized("Not bad!"),
    "8-10": emptyLocalized("You are a true expert!")
  },
  shareText: emptyLocalized("I just played this quiz on QuizLoop!"),
  ads: { vignette: true, inline: true, sticky: true },
  createdAt: "",
  updatedAt: ""
};

export default function CreateQuizPage() {
  const [quiz, setQuiz] = useState<DbQuiz>(defaultQuiz);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateLocalized(
    field: "title" | "description" | "shareText",
    lang: LanguageCode,
    value: string
  ) {
    setQuiz((q) => ({
      ...q,
      [field]: { ...(q[field] as any), [lang]: value }
    }));
  }

  function updateResultMessage(
    range: "0-3" | "4-7" | "8-10",
    lang: LanguageCode,
    value: string
  ) {
    setQuiz((q) => ({
      ...q,
      resultMessages: {
        ...q.resultMessages,
        [range]: {
          ...(q.resultMessages[range] as any),
          [lang]: value
        }
      }
    }));
  }

  function addQuestion() {
    const q: Question = {
      question: emptyLocalized(""),
      answers: [
        { text: emptyLocalized(""), correct: true },
        { text: emptyLocalized(""), correct: false }
      ]
    };
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, q] }));
  }

  function updateQuestionText(
    index: number,
    lang: LanguageCode,
    value: string
  ) {
    setQuiz((prev) => {
      const next = [...prev.questions];
      const q = next[index];
      next[index] = {
        ...q,
        question: { ...(q.question as any), [lang]: value }
      };
      return { ...prev, questions: next };
    });
  }

  function updateAnswerText(
    qIndex: number,
    aIndex: number,
    lang: LanguageCode,
    value: string
  ) {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      const q = questions[qIndex];
      const answers = [...q.answers];
      const answer = answers[aIndex];
      answers[aIndex] = {
        ...answer,
        text: { ...(answer.text as any), [lang]: value }
      };
      questions[qIndex] = { ...q, answers: answers as [any, any] };
      return { ...prev, questions };
    });
  }

  function toggleCorrect(qIndex: number, aIndex: number) {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      const q = questions[qIndex];
      const answers = q.answers.map((a, idx) => ({
        ...a,
        correct: idx === aIndex
      })) as [any, any];
      questions[qIndex] = { ...q, answers };
      return { ...prev, questions };
    });
  }

  async function handleSubmit() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz)
      });
      if (!res.ok) throw new Error("Failed to save quiz");
      setMessage("Quiz saved successfully.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          Create quiz
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Multi-language quiz creator. Fill in each step, then save to MongoDB.
        </p>
        <div className="mt-4 flex gap-2 text-xs font-semibold text-slate-300">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s as Step)}
              className={`rounded-full px-3 py-1 ${
                step === s
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              Step {s}
            </button>
          ))}
        </div>
      </section>

      {step === 1 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-100">
            General information
          </h2>
          <label className="block text-xs text-slate-300">
            Slug
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              value={quiz.slug}
              onChange={(e) =>
                setQuiz((q) => ({ ...q, slug: e.target.value.trim() }))
              }
            />
          </label>
          <label className="block text-xs text-slate-300">
            Category
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              value={quiz.category}
              onChange={(e) =>
                setQuiz((q) => ({ ...q, category: e.target.value }))
              }
            >
              <option value="history">History</option>
              <option value="movies">Movies</option>
              <option value="music">Music</option>
              <option value="science">Science</option>
              <option value="geography">Geography</option>
              <option value="sports">Sports</option>
              <option value="nostalgia">Nostalgia</option>
            </select>
          </label>
          <label className="block text-xs text-slate-300">
            Image URL
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              value={quiz.image}
              onChange={(e) =>
                setQuiz((q) => ({ ...q, image: e.target.value }))
              }
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {LANGS.map((lang) => (
              <div key={lang} className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Title ({lang})
                </p>
                <input
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  value={(quiz.title as any)[lang] ?? ""}
                  onChange={(e) =>
                    updateLocalized("title", lang, e.target.value)
                  }
                />
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Description ({lang})
                </p>
                <textarea
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  rows={3}
                  value={(quiz.description as any)[lang] ?? ""}
                  onChange={(e) =>
                    updateLocalized("description", lang, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white"
            >
              Add question
            </button>
          </div>
          {quiz.questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
            >
              <p className="text-xs font-semibold text-slate-300">
                Question {qIndex + 1}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {LANGS.map((lang) => (
                  <textarea
                    key={lang}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    rows={2}
                    placeholder={`Question (${lang})`}
                    value={(q.question as any)[lang] ?? ""}
                    onChange={(e) =>
                      updateQuestionText(qIndex, lang, e.target.value)
                    }
                  />
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.answers.map((a, aIndex) => (
                  <div key={aIndex} className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Answer {aIndex + 1} {a.correct ? "(correct)" : ""}
                    </p>
                    <div className="grid gap-1 sm:grid-cols-3">
                      {LANGS.map((lang) => (
                        <input
                          key={lang}
                          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                          placeholder={`(${lang})`}
                          value={(a.text as any)[lang] ?? ""}
                          onChange={(e) =>
                            updateAnswerText(
                              qIndex,
                              aIndex,
                              lang,
                              e.target.value
                            )
                          }
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCorrect(qIndex, aIndex)}
                      className="mt-1 rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-200"
                    >
                      Mark as correct
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-100">
            Results & share text
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["0-3", "4-7", "8-10"] as const).map((range) => (
              <div key={range} className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Range {range}
                </p>
                {LANGS.map((lang) => (
                  <input
                    key={lang}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    placeholder={`${range} (${lang})`}
                    value={((quiz.resultMessages[range] as any) ?? {})[lang]}
                    onChange={(e) =>
                      updateResultMessage(range, lang, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {LANGS.map((lang) => (
              <div key={lang}>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Share text ({lang})
                </p>
                <textarea
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  rows={3}
                  value={(quiz.shareText as any)[lang] ?? ""}
                  onChange={(e) =>
                    updateLocalized("shareText", lang, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-100">
            Ad settings & preview
          </h2>
          <div className="flex flex-wrap gap-3 text-xs text-slate-200">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={quiz.ads.vignette}
                onChange={(e) =>
                  setQuiz((q) => ({
                    ...q,
                    ads: { ...q.ads, vignette: e.target.checked }
                  }))
                }
              />
              Vignette ads
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={quiz.ads.inline}
                onChange={(e) =>
                  setQuiz((q) => ({
                    ...q,
                    ads: { ...q.ads, inline: e.target.checked }
                  }))
                }
              />
              Inline ads (Q2/Q5/Q8)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={quiz.ads.sticky}
                onChange={(e) =>
                  setQuiz((q) => ({
                    ...q,
                    ads: { ...q.ads, sticky: e.target.checked }
                  }))
                }
              />
              Sticky bottom ad
            </label>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
            <p className="mb-1 font-semibold text-slate-100">Preview</p>
            <p>Slug: {quiz.slug}</p>
            <p>Category: {quiz.category}</p>
            <p>Questions: {quiz.questions.length}</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save quiz"}
          </button>
          {message && (
            <p className="text-xs text-slate-300">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

