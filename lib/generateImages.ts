import type { Quiz } from "./types";

export function getQuizImageUrl(quiz: Pick<Quiz, "category" | "image">): string {
  if (quiz.image) return quiz.image;

  switch (quiz.category) {
    case "history":
      return "/images/history.jpg";
    case "nostalgia":
      return "/images/90s.jpg";
    case "movies":
      return "/images/80s.jpg";
    case "music":
      return "/images/80s.jpg";
    case "science":
      return "/images/science.jpg";
    case "geography":
      return "/images/geography.jpg";
    case "sports":
      return "/images/sports.jpg";
    default:
      return "/images/preview.jpg";
  }
}

