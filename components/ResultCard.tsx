import Link from "next/link";
import type { Quiz } from "@/lib/types";
import type { ScoreResult } from "@/lib/scoreCalculator";
import { ShareButtons } from "./ShareButtons";
import { AdSlot } from "./AdSlot";
import { BadgeDisplay } from "./BadgeDisplay";
import { useI18n } from "./LanguageProvider";

type ResultCardProps = {
  quiz: Quiz;
  scoreResult: ScoreResult;
};

export function ResultCard({ quiz, scoreResult }: ResultCardProps) {
  const { localize } = useI18n();
  const url = `https://example.com/result/${quiz.slug}?score=${scoreResult.score}`;

  const customMessage =
    scoreResult.score <= 3
      ? quiz.resultMessages?.["0-3"]
      : scoreResult.score <= 7
        ? quiz.resultMessages?.["4-7"]
        : quiz.resultMessages?.["8-10"];

  const finalMessage = localize(customMessage) || scoreResult.message;

  const shareTitle =
    localize(quiz.shareText) ||
    `I scored ${scoreResult.score}/${scoreResult.total} on "${localize(quiz.title)}"`;

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft sm:grid-cols-[3fr,2fr] sm:p-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">
          Your result
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          You scored {scoreResult.score}/{scoreResult.total}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <p className="text-base font-semibold text-emerald-400">
            {finalMessage}
          </p>
          <BadgeDisplay score={scoreResult.score} total={scoreResult.total} />
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Challenge your friends to beat your score and keep the quiz loop
          going. The more they play, the more quizzes you unlock.
        </p>
        <ShareButtons url={url} title={shareTitle} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/quiz/${quiz.slug}?restart=1`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-400 sm:flex-none sm:px-6"
          >
            Restart Quiz 🔁
          </Link>
          <Link
            href={`/category/${quiz.category}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-500/70 hover:bg-slate-900 sm:flex-none sm:px-6"
          >
            More {quiz.category} quizzes ➜
          </Link>
        </div>
      </div>
      <div>
        <AdSlot position="result" />
      </div>
    </section>
  );
}

