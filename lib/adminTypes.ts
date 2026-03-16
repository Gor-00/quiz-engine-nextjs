import type {
  LanguageCode,
  LocalizedText,
  Question,
  ResultMessages
} from "./types";
import type { ObjectId } from "mongodb";

export type AdsConfig = {
  vignette: boolean;
  inline: boolean;
  sticky: boolean;
};

export type DbQuiz = {
  _id?: ObjectId | string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: string;
  image: string;
  questions: Question[];
  resultMessages: ResultMessages;
  shareText: LocalizedText;
  ads: AdsConfig;
  createdAt: string;
  updatedAt: string;
};

export type DbCategory = {
  _id?: ObjectId | string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
};

export type AnalyticsDoc = {
  _id?: ObjectId | string;
  quizId: string;
  views: number;
  completions: number;
  shares: number;
};

export const emptyLocalized = (value = ""): LocalizedText => ({
  en: value,
  am: value,
  fr: value
});

export const LANGS: LanguageCode[] = ["en", "am", "fr"];

