import { NewQuizzes } from "@/components/NewQuizzes";
import { AdSlot } from "@/components/AdSlot";

export default function NewPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft sm:p-7">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">
          Fresh drops
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          Brand new quizzes just for you ✨
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          We&apos;re constantly generating new viral quizzes. Try the latest
          ones before your friends do.
        </p>
        <AdSlot position="top" />
      </section>
      <NewQuizzes />
    </div>
  );
}

