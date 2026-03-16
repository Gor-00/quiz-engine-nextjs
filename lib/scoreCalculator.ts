export type ScoreResult = {
  score: number;
  total: number;
  message: string;
};

export function getScoreMessage(score: number, total: number): string {
  if (score <= 3) return "Better luck next time";
  if (score <= 7) return "Not bad";
  return "You are a true expert";
}

export function buildScoreResult(score: number, total: number): ScoreResult {
  return {
    score,
    total,
    message: getScoreMessage(score, total)
  };
}

