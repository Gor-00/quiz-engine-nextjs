export type LanguageCode = "en" | "am" | "fr";

export type LocalizedText =
  | string
  | {
      en: string;
      am: string;
      fr: string;
    };

export type Answer = {
  text: LocalizedText;
  correct: boolean;
};

export type Question = {
  question: LocalizedText;
  answers: [Answer, Answer];
};

export type ResultMessages = {
  "0-3": LocalizedText;
  "4-7": LocalizedText;
  "8-10": LocalizedText;
};

export type Quiz = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  image: string;
  category: string;
  tags?: string[];
  questions: Question[];
  resultMessages?: ResultMessages;
  shareText?: LocalizedText;
};

