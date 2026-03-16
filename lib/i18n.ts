import type { LanguageCode, LocalizedText } from "./types";

export const SUPPORTED_LANGUAGES: LanguageCode[] = ["en", "am", "fr"];
export const DEFAULT_LANGUAGE: LanguageCode = "en";

const messages = {
  home: {
    en: "Home",
    am: "Գլխավոր",
    fr: "Accueil"
  },
  categories: {
    en: "Categories",
    am: "Կատեգորիաներ",
    fr: "Catégories"
  },
  popular: {
    en: "Popular",
    am: "Հանրաճանաչ",
    fr: "Populaires"
  },
  new: {
    en: "New",
    am: "Նոր",
    fr: "Nouveaux"
  },
  searchPlaceholder: {
    en: "Search quizzes… 🔍",
    am: "Փնտրել վիկտորինաներ… 🔍",
    fr: "Rechercher des quiz… 🔍"
  },
  startQuiz: {
    en: "Start Quiz",
    am: "Սկսել վիկտորինան",
    fr: "Commencer le quiz"
  },
  shareWithFriends: {
    en: "Share with friends",
    am: "Կիսվել ընկերների հետ",
    fr: "Partager avec des amis"
  },
  viralQuiz: {
    en: "Viral Quiz",
    am: "Վիրուսային վիկտորինա",
    fr: "Quiz viral"
  },
  popularQuizzes: {
    en: "Popular quizzes 🔥",
    am: "Հանրաճանաչ վիկտորինաներ 🔥",
    fr: "Quiz populaires 🔥"
  },
  newQuizzes: {
    en: "New quizzes ✨",
    am: "Նոր վիկտորինաներ ✨",
    fr: "Nouveaux quiz ✨"
  }
} as const;

export type MessageKey = keyof typeof messages;

export function getMessage(key: MessageKey, lang: LanguageCode): string {
  const entry = messages[key];
  if (!entry) return key;
  return entry[lang] ?? entry[DEFAULT_LANGUAGE];
}

export function getLocalizedText(
  value: LocalizedText | undefined,
  lang: LanguageCode
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value[DEFAULT_LANGUAGE];
}

