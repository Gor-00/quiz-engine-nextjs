export type AnalyticsEvent =
  | "quiz_start"
  | "quiz_complete"
  | "share_click"
  | "restart_quiz"
  | "next_quiz_from_result";

type AnalyticsPayload = {
  quizSlug?: string;
  score?: number;
  total?: number;
  category?: string;
  label?: string;
};

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  // Placeholder hook for Google Analytics, Pixel, etc.
  // eslint-disable-next-line no-console
  console.debug("[analytics]", event, payload);
}

