#!/usr/bin/env node

/**
 * Migrates quizzes from localized format {en, am, fr} to the Mongoose-compatible
 * flat-string format expected by the public API and frontend.
 *
 * Transforms:
 *   title: {en, am, fr}       → title: string (en value)
 *   description: {en, am, fr} → description: string (en value)
 *   question: {en, am, fr}    → question: string (en value)
 *   answers: [{text: {en,am,fr}, correct: bool}] → answers: string[], correctIndex: number
 *
 * Also removes admin-only fields: resultMessages, shareText, ads, difficulty, updatedAt
 *
 * Usage: node scripts/migrate-quiz-format.mjs
 */

import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gor22mkrtchyan_db_user:VccGSxkNISGT6PTJ@cluster0.joto7jr.mongodb.net/quizloop?retryWrites=true&w=majority";
const MONGODB_DB = process.env.MONGODB_DB || "quizloop";

function getText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "en" in value) {
    return String(value.en ?? "");
  }
  return "";
}

function needsMigration(doc) {
  if (doc.title && typeof doc.title === "object" && "en" in doc.title) return true;
  if (doc.description && typeof doc.description === "object" && "en" in doc.description) return true;
  if (Array.isArray(doc.questions) && doc.questions.length > 0) {
    const q = doc.questions[0];
    if (q.question && typeof q.question === "object" && "en" in q.question) return true;
    if (Array.isArray(q.answers) && q.answers.length > 0 && typeof q.answers[0] === "object" && "text" in q.answers[0]) return true;
  }
  return false;
}

function migrateDoc(doc) {
  const update = {};
  const unset = {};

  update.title = getText(doc.title);
  update.description = getText(doc.description);

  if (Array.isArray(doc.questions)) {
    update.questions = doc.questions.map((q) => {
      const question = getText(q.question);

      let answers;
      let correctIndex = 0;

      if (Array.isArray(q.answers) && q.answers.length > 0 && typeof q.answers[0] === "object" && "text" in q.answers[0]) {
        answers = q.answers.map((a) => getText(a.text));
        correctIndex = q.answers.findIndex((a) => a.correct === true);
        if (correctIndex < 0) correctIndex = 0;
      } else if (Array.isArray(q.answers) && typeof q.answers[0] === "string") {
        answers = q.answers;
        correctIndex = q.correctIndex ?? 0;
      } else {
        answers = ["Option A", "Option B"];
        correctIndex = 0;
      }

      return { question, answers, correctIndex };
    });
  }

  // Convert createdAt string to Date if needed
  if (typeof doc.createdAt === "string") {
    update.createdAt = new Date(doc.createdAt);
  }

  // Remove admin-only fields not in the Mongoose schema
  for (const field of ["resultMessages", "shareText", "ads", "difficulty", "updatedAt"]) {
    if (field in doc) {
      unset[field] = "";
    }
  }

  // Ensure tags field exists
  if (!doc.tags) {
    update.tags = [];
  }

  return { update, unset };
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection("quizzes");

  const allDocs = await collection.find({}).toArray();
  console.log(`Found ${allDocs.length} quizzes in the database.\n`);

  let migrated = 0;
  let skipped = 0;

  for (const doc of allDocs) {
    if (!needsMigration(doc)) {
      skipped++;
      continue;
    }

    const { update, unset } = migrateDoc(doc);

    const updateOp = { $set: update };
    if (Object.keys(unset).length > 0) {
      updateOp.$unset = unset;
    }

    await collection.updateOne({ _id: doc._id }, updateOp);
    migrated++;
    console.log(`✅ Migrated: "${update.title}" (slug: ${doc.slug})`);
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`DONE: ${migrated} migrated, ${skipped} already correct (${allDocs.length} total)`);
  console.log("═".repeat(50));

  await client.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
