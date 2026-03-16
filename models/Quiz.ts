import { Schema, model, models, type InferSchemaType } from "mongoose";

const QuestionSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answers: {
      type: [String],
      required: true,
      validate: {
        validator: (answers: string[]) =>
          Array.isArray(answers) && answers.length >= 2,
        message: "Question must have at least two answers"
      }
    },
    correctIndex: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const QuizSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    questions: { type: [QuestionSchema], required: true, default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: "quizzes",
    versionKey: false
  }
);

export type QuizDocument = InferSchemaType<typeof QuizSchema>;

const QuizModel = models.Quiz || model("Quiz", QuizSchema);

export default QuizModel;
