"use client";

import Link from "next/link";
import useSWR from "swr";
import type { AnalyticsDoc, DbQuiz } from "@/lib/adminTypes";
import { AiGenerateLauncher } from "@/components/admin/AiGenerateLauncher";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AnalyticsPage() {
  const { data: analytics } = useSWR<AnalyticsDoc[]>(
    "/api/admin/analytics",
    fetcher
  );
  const { data: quizzes } = useSWR<DbQuiz[]>("/api/admin/quizzes", fetcher);

  const rows =
    analytics?.map((a) => ({
      ...a,
      quiz: quizzes?.find((q) => q._id === a.quizId)
    })) ?? [];

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
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Basic per-quiz metrics: views, completions, and completion rate.
        </p>
      </section>

      <AiGenerateLauncher
        title="AI Auto-Generation"
        description="Generate a new quiz draft (opens in Create Quiz)."
      />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
            <tr>
              <th className="py-2">Quiz</th>
              <th className="py-2">Views</th>
              <th className="py-2">Completions</th>
              <th className="py-2">CTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row._id?.toString?.() ?? row.quizId}
                className="border-b border-slate-900"
              >
                <td className="py-1">
                  {row.quiz?.slug ?? row.quizId}
                </td>
                <td className="py-1">{row.views}</td>
                <td className="py-1">{row.completions}</td>
                <td className="py-1">
                  {row.views
                    ? `${Math.round((row.completions / row.views) * 100)}%`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

