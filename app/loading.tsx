import { QuizCardSkeleton } from "@/components/QuizCardSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft sm:p-7">
        <div className="mb-2 h-3 w-28 animate-pulse rounded bg-slate-800" />
        <div className="h-8 w-4/5 animate-pulse rounded bg-slate-800 sm:w-2/3" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-900 sm:w-3/4" />
      </section>

      <section className="space-y-3">
        <QuizCardSkeleton count={9} />
      </section>
    </div>
  );
}
