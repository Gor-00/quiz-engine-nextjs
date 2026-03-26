/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import nextEnv from "@next/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.join(__dirname, "..");
const { loadEnvConfig } = nextEnv;

// Load .env.local/.env so migration works like Next.js runtime.
loadEnvConfig(projectDir);

function resolveMongoUri() {
  const candidates = [
    process.env.MONGODB_URI,
    process.env.MONGODB_URL,
    process.env.MONGO_URL,
    process.env.DATABASE_URL
  ];

  const uri = candidates.find((value) => typeof value === "string" && value);
  if (!uri) {
    throw new Error(
      "MongoDB URI is missing. Set MONGODB_URI (or MONGODB_URL / MONGO_URL / DATABASE_URL)."
    );
  }
  return uri;
}

function pickArmenian(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const localized = value;
  return String(localized.am ?? localized.en ?? localized.fr ?? "");
}

function buildArmenianPayload(quiz) {
  return {
    title: pickArmenian(quiz.title),
    description: pickArmenian(quiz.description),
    category: String(quiz.category ?? ""),
    image: String(quiz.image ?? ""),
    tags: Array.isArray(quiz.tags) ? quiz.tags.map((tag) => String(tag)) : [],
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map((question) => {
          const answers = Array.isArray(question?.answers) ? question.answers : [];
          const correctIndex = answers.findIndex((a) => Boolean(a?.correct));

          return {
            question: pickArmenian(question?.question),
            answers: answers.map((answer) => pickArmenian(answer?.text)),
            correctIndex: correctIndex >= 0 ? correctIndex : 0
          };
        })
      : []
  };
}

async function main() {
  const uri = resolveMongoUri();
  const quizzesPath = path.join(__dirname, "..", "data", "quizzes.json");
  const quizzes = JSON.parse(fs.readFileSync(quizzesPath, "utf8"));

  if (!Array.isArray(quizzes)) {
    throw new Error("data/quizzes.json must be an array");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const dbNameFromUri = new URL(uri).pathname.replace(/^\//, "");
    const db = client.db(dbNameFromUri || undefined);
    const collection = db.collection("quizzes");

    let updatedCount = 0;
    let missingCount = 0;

    for (const localQuiz of quizzes) {
      const slug = String(localQuiz?.slug ?? "");
      if (!slug) continue;

      const update = buildArmenianPayload(localQuiz);
      const result = await collection.updateOne(
        { slug },
        { $set: update },
        { upsert: false }
      );

      if (result.matchedCount === 0) {
        missingCount += 1;
      } else if (result.modifiedCount > 0) {
        updatedCount += 1;
      }
    }

    console.log(`Processed quizzes: ${quizzes.length}`);
    console.log(`Updated in Mongo: ${updatedCount}`);
    console.log(`Missing in Mongo: ${missingCount}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
