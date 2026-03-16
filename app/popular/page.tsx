import { PopularQuizzes } from "@/components/PopularQuizzes";
import { AdSlot } from "@/components/AdSlot";

export default function PopularPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft sm:p-7">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-400">
          Viral hits
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          Today&apos;s most popular quizzes 🔥
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          These are the quizzes people are finishing and sharing the most. Pick
          one and see if you can beat their scores.
        </p>
        <AdSlot position="top" />
      </section>
      <PopularQuizzes />
    </div>
  );
}

