import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import { getDb } from "@/lib/mongodb";
import { emptyLocalized, type DbQuiz, type AdsConfig } from "@/lib/adminTypes";
import { getQuizImageUrl } from "@/lib/generateImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateParams = {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  numQuestions?: number;
  includeImages?: boolean;
};

const defaultAds: AdsConfig = { vignette: true, inline: true, sticky: true };

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureLocalized(value: any) {
  const v = value ?? {};
  const en = typeof v?.en === "string" ? v.en : "";
  const am = typeof v?.am === "string" ? v.am : en;
  const fr = typeof v?.fr === "string" ? v.fr : en;
  return { en, am, fr };
}

function normalizeGeneratedQuiz(payload: any, params: Required<GenerateParams>): DbQuiz {
  const title = ensureLocalized(payload?.title);
  const description = ensureLocalized(payload?.description);
  const shareText = ensureLocalized(payload?.shareText);
  const resultMessages = {
    "0-3": ensureLocalized(payload?.resultMessages?.["0-3"]),
    "4-7": ensureLocalized(payload?.resultMessages?.["4-7"]),
    "8-10": ensureLocalized(payload?.resultMessages?.["8-10"])
  };

  const questionsRaw = Array.isArray(payload?.questions) ? payload.questions : [];
  const questions = questionsRaw.slice(0, params.numQuestions).map((q: any) => {
    const question = ensureLocalized(q?.question);
    const answersRaw = Array.isArray(q?.answers) ? q.answers : [];
    const answers = answersRaw.slice(0, 4).map((a: any) => ({
      text: ensureLocalized(a?.text),
      correct: Boolean(a?.correct)
    }));

    // Ensure at least 2 answers.
    while (answers.length < 2) {
      answers.push({ text: emptyLocalized(""), correct: answers.length === 0 });
    }

    // Ensure exactly one correct.
    const correctCount = answers.filter((a: { correct: boolean }) => a.correct)
      .length;
    if (correctCount !== 1) {
      answers.forEach((a: { correct: boolean }, idx: number) => {
        a.correct = idx === 0;
      });
    }

    return {
      question,
      answers: answers as any
    };
  });

  // Ensure at least 1 question.
  if (questions.length === 0) {
    questions.push({
      question: emptyLocalized(""),
      answers: [
        { text: emptyLocalized(""), correct: true },
        { text: emptyLocalized(""), correct: false }
      ]
    } as any);
  }

  const baseTitle = title.en || "quiz";
  const slug = slugify(payload?.slug || baseTitle) || `quiz-${Date.now()}`;

  const quizImage = params.includeImages
    ? String(payload?.image || "").trim() ||
      getQuizImageUrl({ category: params.category, image: "" })
    : getQuizImageUrl({ category: params.category, image: "" });

  return {
    slug,
    title: ensureLocalized(title),
    description: ensureLocalized(description),
    category: params.category,
    image: quizImage,
    questions: questions as any,
    resultMessages,
    shareText: ensureLocalized(shareText),
    ads: payload?.ads ? payload.ads : defaultAds,
    createdAt: "",
    updatedAt: ""
  };
}

function validateQuiz(quiz: DbQuiz) {
  const fieldErrors: Record<string, string> = {};
  if (!quiz.slug) fieldErrors.slug = "Slug is required";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(quiz.slug)) {
    fieldErrors.slug = "Slug must be lowercase and URL-safe (letters, numbers, dashes)";
  }

  for (const lang of ["en", "am", "fr"] as const) {
    if (!(quiz.title as any)?.[lang]?.trim()) fieldErrors[`title.${lang}`] = `Title (${lang}) is required`;
    if (!(quiz.description as any)?.[lang]?.trim()) fieldErrors[`description.${lang}`] = `Description (${lang}) is required`;
    if (!(quiz.shareText as any)?.[lang]?.trim()) fieldErrors[`shareText.${lang}`] = `Share text (${lang}) is required`;
    if (!(quiz.resultMessages as any)?.["0-3"]?.[lang]?.trim()) fieldErrors[`resultMessages.0-3.${lang}`] = `Result message 0-3 (${lang}) is required`;
    if (!(quiz.resultMessages as any)?.["4-7"]?.[lang]?.trim()) fieldErrors[`resultMessages.4-7.${lang}`] = `Result message 4-7 (${lang}) is required`;
    if (!(quiz.resultMessages as any)?.["8-10"]?.[lang]?.trim()) fieldErrors[`resultMessages.8-10.${lang}`] = `Result message 8-10 (${lang}) is required`;
  }

  if (!quiz.category) fieldErrors.category = "Category is required";
  if (!quiz.image) fieldErrors.image = "Image is required";

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    fieldErrors.questions = "At least one question is required";
  } else {
    quiz.questions.forEach((q: any, idx: number) => {
      for (const lang of ["en", "am", "fr"] as const) {
        if (!(q?.question as any)?.[lang]?.trim()) {
          fieldErrors[`questions.${idx}.question.${lang}`] = `Question ${idx + 1} missing (${lang}) text`;
        }
      }
      if (!Array.isArray(q?.answers) || q.answers.length < 2) {
        fieldErrors[`questions.${idx}.answers`] = `Question ${idx + 1} needs at least 2 answers`;
      } else {
        const correctCount = q.answers.filter((a: any) => a?.correct).length;
        if (correctCount !== 1) {
          fieldErrors[`questions.${idx}.answers.correct`] = `Question ${idx + 1} must have exactly one correct answer`;
        }
        q.answers.forEach((a: any, aIdx: number) => {
          for (const lang of ["en", "am", "fr"] as const) {
            if (!(a?.text as any)?.[lang]?.trim()) {
              fieldErrors[`questions.${idx}.answers.${aIdx}.text.${lang}`] = `Answer ${aIdx + 1} missing (${lang}) text`;
            }
          }
        });
      }
    });
  }

  return fieldErrors;
}

async function ensureUniqueSlug(baseSlug: string) {
  const db = await getDb();
  const collection = db.collection("quizzes");

  let slug = baseSlug;
  for (let i = 0; i < 10; i += 1) {
    const exists = await collection.findOne({ slug });
    if (!exists) return slug;
    slug = `${baseSlug}-${Math.random().toString(16).slice(2, 6)}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

async function callGeminiVertex(params: Required<GenerateParams>) {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    return null;
  }

  const projectId = process.env.GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error("GCP_PROJECT_ID is required when using Vertex AI");
  }

  const location = process.env.GCP_LOCATION || "us-central1";
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash-002";

  const system = `You generate viral quiz JSON for a Next.js app. Output ONLY valid JSON (no markdown, no explanation).`;
  const user = `Generate a quiz object with this TypeScript shape:
{
  slug: string,
  title: {en:string, am:string, fr:string},
  description: {en:string, am:string, fr:string},
  category: string,
  image: string,
  questions: Array<{
    question: {en:string, am:string, fr:string},
    answers: Array<{ text:{en:string, am:string, fr:string}, correct:boolean }>
  }>,
  resultMessages: {
    "0-3": {en:string, am:string, fr:string},
    "4-7": {en:string, am:string, fr:string},
    "8-10": {en:string, am:string, fr:string}
  },
  shareText: {en:string, am:string, fr:string},
  ads: { vignette:boolean, inline:boolean, sticky:boolean }
}
Rules:
- category="${params.category}"
- difficulty="${params.difficulty}" influences question complexity and wording.
- EXACTLY ${params.numQuestions} questions.
- Each question must have 2-4 answers and EXACTLY ONE correct:true.
- Fill all languages (en, am, fr) with natural translations (not copies).
- image must be a plausible URL/path string (can be empty if you cannot decide).
- ads should be {vignette:true, inline:true, sticky:true}.
Return only JSON.`;

  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken =
    typeof accessTokenResponse === "string"
      ? accessTokenResponse
      : accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error("Failed to get Google access token");
  }

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: system }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: user }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    })
  });

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    const detail = data?.error?.message || "Vertex AI request failed";
    throw new Error(detail);
  }

  const content = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("\n");
  if (typeof content !== "string") {
    throw new Error("Gemini returned empty response");
  }

  const raw = content.trim();
  const unfenced = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch {
    throw new Error("Gemini returned non-JSON content");
  }
}

async function fallbackGenerate(params: Required<GenerateParams>) {
  // Deterministic fallback (no external API). Uses same text for all languages.
  const titleEn = `Can you pass this ${params.category} quiz?`;
  const slug = slugify(`${params.category}-${params.difficulty}-${Date.now()}`);

  const questions = Array.from({ length: params.numQuestions }, (_, i) => ({
    question: {
      en: `(${i + 1}/${params.numQuestions}) ${params.category} question #${i + 1}`,
      am: `(${i + 1}/${params.numQuestions}) ${params.category} հարց #${i + 1}`,
      fr: `(${i + 1}/${params.numQuestions}) Question ${params.category} #${i + 1}`
    },
    answers: [
      { text: { en: "Option A", am: "Տարբերակ A", fr: "Option A" }, correct: true },
      { text: { en: "Option B", am: "Տարբերակ B", fr: "Option B" }, correct: false }
    ]
  }));

  return {
    slug,
    title: { en: titleEn, am: titleEn, fr: titleEn },
    description: {
      en: `A ${params.difficulty} ${params.category} quiz with ${params.numQuestions} questions.`,
      am: `Ա ${params.difficulty} ${params.category} քվիզ՝ ${params.numQuestions} հարցով։`,
      fr: `Un quiz ${params.category} ${params.difficulty} avec ${params.numQuestions} questions.`
    },
    category: params.category,
    image: params.includeImages ? getQuizImageUrl({ category: params.category, image: "" }) : "",
    questions,
    resultMessages: {
      "0-3": { en: "Better luck next time!", am: "Լավ հաջողություն հաջորդ անգամ!", fr: "Mieux la prochaine fois !" },
      "4-7": { en: "Not bad!", am: "Չի վատ է!", fr: "Pas mal !" },
      "8-10": { en: "You are a true expert!", am: "Դուք իսկական մասնագետ եք!", fr: "Vous êtes un vrai expert !" }
    },
    shareText: {
      en: `I just played this ${params.category} quiz — can you beat my score?`,
      am: `Ես հենց նոր խաղացի այս ${params.category} քվիզը — կկարողանա՞ս գերազանցել իմ միավորը։`,
      fr: `Je viens de faire ce quiz ${params.category} — peux-tu battre mon score ?`
    },
    ads: defaultAds
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateParams;
    const params: Required<GenerateParams> = {
      category: String(body?.category || "history"),
      difficulty: (body?.difficulty || "medium") as any,
      numQuestions: Math.max(1, Math.min(30, Number(body?.numQuestions || 10))),
      includeImages: Boolean(body?.includeImages ?? true)
    };

    // Fallback generator is used when GOOGLE_APPLICATION_CREDENTIALS is not set.
    const raw = (await callGeminiVertex(params)) ?? (await fallbackGenerate(params));
    let quiz = normalizeGeneratedQuiz(raw, params);

    quiz = { ...quiz, slug: await ensureUniqueSlug(quiz.slug) };

    const fieldErrors = validateQuiz(quiz);
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: "Generated quiz failed validation", fieldErrors },
        { status: 422 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate quiz";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

