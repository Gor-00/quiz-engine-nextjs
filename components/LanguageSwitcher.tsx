"use client";

import { useI18n } from "./LanguageProvider";

const FLAG_BY_LANG: Record<string, string> = {
  en: "🇺🇸",
  am: "🇦🇲",
  fr: "🇫🇷"
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {(["en", "am", "fr"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
            language === lang
              ? "border-indigo-400 bg-indigo-500/20"
              : "border-slate-700 bg-slate-900 hover:border-indigo-400/70"
          }`}
          aria-label={lang}
        >
          <span>{FLAG_BY_LANG[lang]}</span>
        </button>
      ))}
    </div>
  );
}

