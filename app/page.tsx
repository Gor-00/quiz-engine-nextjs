import { AdSlot } from "@/components/AdSlot";
import { ViralTitle } from "@/components/ViralTitle";
import { InfiniteQuizFeed } from "@/components/InfiniteQuizFeed";
import { fetchAllQuizzesFromApi } from "@/lib/serverQuizApi";

function shuffleArray<T>(input: T[]): T[] {
  // Fisher-Yates shuffle (stable within this single server render).
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function HomePage() {
  const quizzes = shuffleArray(await fetchAllQuizzesFromApi());

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft sm:p-7">
        <ViralTitle
          kicker="Viral quiz platform"
          main="Only 1 in 50 people can pass these quizzes. Can you? 🤔"
        />
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Mobile-first, addictive quizzes built for Facebook traffic, Google
          Discover, and AdSense revenue. Tap a quiz below and see if you can
          score 8/10.
        </p>
        <AdSlot position="top" />
      </section>
      <InfiniteQuizFeed
        quizzes={quizzes}
        initialCount={quizzes.length}
        pageSize={quizzes.length}
      />
    </div>
  );
}

