/* eslint-disable no-console */
// Simple offline generator to create 100–200 quiz objects into data/quizzes.json.
// Run with: node scripts/generate-quizzes.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, "..", "data", "quizzes.json");

const categories = [
  "history",
  "movies",
  "music",
  "science",
  "geography",
  "sports",
  "nostalgia"
];

const baseResultMessages = {
  "0-3": {
    en: "Better luck next time!",
    am: "Լավ հաջողություն հաջորդ անգամ!",
    fr: "Mieux vaut la prochaine fois!"
  },
  "4-7": {
    en: "Not bad!",
    am: "Չի վատ է!",
    fr: "Pas mal !"
  },
  "8-10": {
    en: "You are a true expert!",
    am: "Դուք իսկական մասնագետ եք!",
    fr: "Vous êtes un vrai expert !"
  }
};

function localizeAll(str) {
  return { en: str, am: str, fr: str };
}

function makeTitle(category, index) {
  const templates = [
    `Only 1 in 50 people can pass this ${category} quiz 🤯`,
    `Can you score 8/10 on this ${category} challenge? 💥`,
    `Do you really know your ${category}? Take the test! ✅`,
    `This viral ${category} quiz is stumping everyone 😱`,
    `Prove you're a true ${category} genius in 10 questions 🧠`
  ];
  return localizeAll(templates[index % templates.length]);
}

function makeDescription(category) {
  return localizeAll(
    `10 fast questions to see how deep your ${category} knowledge really goes. Most people fail at 6/10.`
  );
}

function imageForCategory(category) {
  switch (category) {
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

function makeQuestions(category) {
  const base = [
    {
      question: localizeAll(
        `True or false: You can ace any ${category} quiz in your sleep.`
      ),
      answers: [
        { text: localizeAll("True, obviously"), correct: true },
        { text: localizeAll("False, I'm here to try"), correct: false }
      ]
    },
    {
      question: localizeAll(
        `When it comes to ${category}, how confident are you?`
      ),
      answers: [
        { text: localizeAll("10/10, bring it on"), correct: true },
        { text: localizeAll("I'm just here for fun"), correct: false }
      ]
    },
    {
      question: localizeAll(
        `Which option sounds more like you in ${category}?`
      ),
      answers: [
        { text: localizeAll("I quote random facts daily"), correct: true },
        {
          text: localizeAll("I vaguely remember some of it"),
          correct: false
        }
      ]
    },
    {
      question: localizeAll(
        `Be honest: did you Google before starting this ${category} quiz?`
      ),
      answers: [
        { text: localizeAll("Nope, pure brain power"), correct: true },
        { text: localizeAll("Maybe a tiny bit…"), correct: false }
      ]
    },
    {
      question: localizeAll(
        `If this quiz were graded, what would you expect?`
      ),
      answers: [
        { text: localizeAll("A+, obviously"), correct: true },
        {
          text: localizeAll("I'll be happy with a pass"),
          correct: false
        }
      ]
    },
    {
      question: localizeAll(
        `Would your friends call you the "${category} expert"?`
      ),
      answers: [
        { text: localizeAll("Yes, 100%"), correct: true },
        { text: localizeAll("Not really"), correct: false }
      ]
    },
    {
      question: localizeAll(
        `How often do you read or watch content about ${category}?`
      ),
      answers: [
        { text: localizeAll("All the time"), correct: true },
        { text: localizeAll("Hardly ever"), correct: false }
      ]
    },
    {
      question: localizeAll(
        `If this quiz gets hard, what will you do?`
      ),
      answers: [
        {
          text: localizeAll("Push through like a legend"),
          correct: true
        },
        {
          text: localizeAll("Rage quit and blame the questions"),
          correct: false
        }
      ]
    },
    {
      question: localizeAll(
        `Would you share this ${category} quiz if you score 9/10 or higher?`
      ),
      answers: [
        { text: localizeAll("Of course, flex time"), correct: true },
        { text: localizeAll("No, I keep wins private"), correct: false }
      ]
    },
    {
      question: localizeAll(
        `Ready for your final ${category} question?`
      ),
      answers: [
        { text: localizeAll("Hit me with it"), correct: true },
        { text: localizeAll("I'm already tired"), correct: false }
      ]
    }
  ];

  return base;
}

function buildQuizzes() {
  const quizzes = [];
  const perCategory = 20; // 7 * 20 = 140 quizzes

  categories.forEach((category) => {
    for (let i = 1; i <= perCategory; i += 1) {
      const slug = `${category}-quiz-${i}`;
      const title = makeTitle(category, i);
      const description = makeDescription(category);
      const image = imageForCategory(category);

      quizzes.push({
        slug,
        title,
        description,
        image,
        category,
        tags: [category, "viral", "challenge", "10-questions"],
        questions: makeQuestions(category),
        resultMessages: baseResultMessages,
        shareText: localizeAll(
          `I just tried this ${category} quiz on QuizLoop and scored big. Can you beat me?`
        )
      });
    }
  });

  return quizzes;
}

function main() {
  const quizzes = buildQuizzes();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(quizzes, null, 2));
  console.log(`Wrote ${quizzes.length} quizzes to ${OUTPUT_PATH}`);
}

main();

