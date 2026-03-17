 "use client";

import { useEffect, useMemo, useState } from "react";
import type { LanguageCode, Question as UiQuestion } from "@/lib/types";
import {
  LANGS,
  emptyLocalized,
  type AdsConfig,
  type DbQuiz
} from "@/lib/adminTypes";
import { ImageUpload } from "@/components/ImageUpload";
import { uiQuizToApiQuiz } from "@/lib/quizTransform";

type Step = 1 | 2 | 3 | 4;

type ValidationErrors = {
  slug?: string;
  title?: string;
  description?: string;
  image?: string;
  questions?: string;
};

type ApiErrorResponse = {
  error?: string;
  hint?: string;
  fieldErrors?: Record<string, string>;
};

const defaultAds: AdsConfig = {
  vignette: true,
  inline: true,
  sticky: true
};

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
  ads: defaultAds,
  createdAt: "",
  updatedAt: ""
};

export default function CreateQuizPage() {
  const [quiz, setQuiz] = useState<DbQuiz>(defaultQuiz);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [slugToLoad, setSlugToLoad] = useState("");

  const isEdit = mode === "edit";

  function normalizeSlug(input: string) {
    let s = input.trim();
    // allow user paste "/quiz/my-slug" or "/my-slug"
    if (s.startsWith("/quiz/")) s = s.slice("/quiz/".length);
    if (s.startsWith("/")) s = s.slice(1);
    s = s.toLowerCase().replace(/\s+/g, "-");
    s = s.replace(/[^a-z0-9-]/g, "");
    s = s.replace(/-+/g, "-");
    return s;
  }

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
    const q: UiQuestion = {
      question: emptyLocalized(""),
      answers: [
        { text: emptyLocalized(""), correct: true },
        { text: emptyLocalized(""), correct: false }
      ]
    };
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, q] }));
  }

  function removeQuestion(index: number) {
    setQuiz((prev) => {
      const questions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions };
    });
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

  const hasAtLeastOneQuestion = useMemo(
    () => quiz.questions.length > 0,
    [quiz.questions.length]
  );

  function validate(): boolean {
    const nextErrors: ValidationErrors = {};

    if (!quiz.slug.trim()) {
      nextErrors.slug = "Slug is required.";
    } else if (quiz.slug.includes("/")) {
      nextErrors.slug = "Slug must not contain '/'. Example: harry-potter-quiz";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(quiz.slug)) {
      nextErrors.slug = "Use only lowercase letters, numbers, and dashes.";
    }

    const titleEn = (quiz.title as any).en ?? "";
    const descEn = (quiz.description as any).en ?? "";

    if (!titleEn.trim()) {
      nextErrors.title = "Title (EN) is required.";
    }
    if (!descEn.trim()) {
      nextErrors.description = "Description (EN) is required.";
    }
    if (!quiz.image.trim()) {
      nextErrors.image = "Image is required.";
    }

    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      nextErrors.questions = "At least one question is required.";
    } else {
      for (const [index, q] of quiz.questions.entries()) {
        const questionEn = (q.question as any).en ?? "";
        if (!questionEn.trim()) {
          nextErrors.questions = `Question ${index + 1} is missing English text.`;
          break;
        }
        if (!Array.isArray(q.answers) || q.answers.length < 2) {
          nextErrors.questions = `Question ${index + 1} must have at least 2 answers.`;
          break;
        }
        const correctIndex = q.answers.findIndex((a) => a.correct);
        if (correctIndex === -1) {
          nextErrors.questions = `Question ${index + 1} must have a correct answer.`;
          break;
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function loadQuizBySlug(slug: string) {
    if (!slug.trim()) return;
    setLoadingExisting(true);
    setMessage(null);
    setErrors({});

    try {
      const res = await fetch(`/api/quizzes/${encodeURIComponent(slug)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load quiz");
      }

      const fromApi = data as any;

      const loaded: DbQuiz = {
        slug: fromApi.slug,
        title: {
          en: fromApi.title,
          am: fromApi.title,
          fr: fromApi.title
        },
        description: {
          en: fromApi.description,
          am: fromApi.description,
          fr: fromApi.description
        },
        category: fromApi.category,
        image: fromApi.image,
        questions: (fromApi.questions || []).map((q: any) => ({
          question: {
            en: q.question,
            am: q.question,
            fr: q.question
          },
          answers: (q.answers || []).map((answer: string, index: number) => ({
            text: {
              en: answer,
              am: answer,
              fr: answer
            },
            correct: index === q.correctIndex
          }))
        })),
        resultMessages: {
          "0-3": emptyLocalized("Better luck next time!"),
          "4-7": emptyLocalized("Not bad!"),
          "8-10": emptyLocalized("You are a true expert!")
        },
        shareText: emptyLocalized("I just played this quiz on QuizLoop!"),
        ads: defaultAds,
        createdAt: "",
        updatedAt: ""
      };

      setQuiz(loaded);
      setMode("edit");
      setOriginalSlug(slug);
      setStep(1);
      setMessage(`Loaded quiz "${slug}" for editing.`);
    } catch (err) {
      setMode("create");
      setOriginalSlug(null);
      setMessage((err as Error).message);
    } finally {
      setLoadingExisting(false);
    }
  }

  useEffect(() => {
    // no auto-load; use slug input + Load button
  }, []);

  async function ensureSlugUnique(slug: string): Promise<boolean> {
    const res = await fetch(`/api/quizzes/${encodeURIComponent(slug)}`);
    if (res.status === 404) return true;
    if (res.ok) return false;
    return true;
  }

  async function handleSubmit() {
    setSaving(true);
    setMessage(null);

    try {
      const ok = validate();
      if (!ok) {
        setSaving(false);
        return;
      }

      if (!isEdit) {
        const unique = await ensureSlugUnique(quiz.slug);
        if (!unique) {
          setErrors((prev) => ({
            ...prev,
            slug: "Slug must be unique. A quiz with this slug already exists."
          }));
          setSaving(false);
          return;
        }
      }

      const uiQuiz = {
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        image: quiz.image,
        tags: [],
        questions: quiz.questions as any
      };

      const apiQuiz = uiQuizToApiQuiz(uiQuiz as any);

      const endpoint =
        isEdit && originalSlug
          ? `/api/quizzes/${encodeURIComponent(originalSlug)}`
          : "/api/quizzes";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiQuiz)
      });

      const data = (await res.json()) as ApiErrorResponse;

      if (!res.ok) {
        if (data?.fieldErrors) {
          // Merge server field errors into our UI errors
          setErrors((prev) => ({
            ...prev,
            slug: data.fieldErrors?.slug ?? prev.slug,
            title: data.fieldErrors?.title ?? prev.title,
            description: data.fieldErrors?.description ?? prev.description,
            image: data.fieldErrors?.image ?? prev.image,
            questions: data.fieldErrors?.questions ?? prev.questions
          }));
        }
        const detail = data?.hint ? `${data.error}\n${data.hint}` : data?.error;
        throw new Error(detail || "Failed to save quiz");
      }

      setMessage(
        isEdit ? "Quiz updated successfully." : "Quiz created successfully."
      );
      if (!isEdit) {
        setQuiz(defaultQuiz);
        setMode("create");
        setOriginalSlug(null);
        setStep(1);
      }
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
          {isEdit ? "Edit quiz" : "Create quiz"}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Multi-language quiz wizard. All steps stay on this page; nothing is
          saved to the server until you click Save.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Load existing by slug:</span>
            <input
              className="w-36 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              placeholder="my-quiz-slug"
              value={slugToLoad}
              onChange={(e) => setSlugToLoad(normalizeSlug(e.target.value))}
            />
            <button
              type="button"
              onClick={() => {
                if (slugToLoad) void loadQuizBySlug(slugToLoad);
              }}
              disabled={loadingExisting || !slugToLoad}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:border-indigo-500 disabled:opacity-60"
            >
              {loadingExisting ? "Loading…" : "Load"}
            </button>
        </div>
      </section>

      <div className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-100">General information</h2>

          <label className="block text-xs text-slate-300">
            Slug
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              value={quiz.slug}
              onChange={(e) =>
                setQuiz((q) => ({ ...q, slug: normalizeSlug(e.target.value) }))
              }
              disabled={isEdit}
            />
          </label>
          {errors.slug && (
            <p className="text-[10px] text-red-400">{errors.slug}</p>
          )}

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

          <ImageUpload
            label="Quiz image"
            value={quiz.image}
            onChange={(url) => setQuiz((q) => ({ ...q, image: url }))}
          />
          {errors.image && (
            <p className="text-[10px] text-red-400">{errors.image}</p>
          )}

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
          {errors.title && (
            <p className="text-[10px] text-red-400">{errors.title}</p>
          )}
          {errors.description && (
            <p className="text-[10px] text-red-400">{errors.description}</p>
          )}
        </div>

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
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300">
                  Question {qIndex + 1}
                </p>
                <button
                  type="button"
                  className="rounded-full p-1 text-red-400 hover:bg-red-500/10"
                  onClick={() => removeQuestion(qIndex)}
                  aria-label="Remove question"
                  title="Remove question"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 16h10l1-16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>
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
          {!hasAtLeastOneQuestion && (
            <p className="text-[10px] text-slate-400">
              Add at least one question to continue.
            </p>
          )}
          {errors.questions && (
            <p className="text-[10px] text-red-400">{errors.questions}</p>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-100">
            Result messages & share text
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

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-100">
            Ads configuration & preview
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
            <p>Slug: {quiz.slug || "—"}</p>
            <p>Category: {quiz.category}</p>
            <p>Questions: {quiz.questions.length}</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save quiz"}
          </button>
          {message && (
            <p className="whitespace-pre-line text-xs text-slate-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

