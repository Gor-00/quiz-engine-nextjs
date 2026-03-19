const MONGO_URI_ENV_KEYS = [
  "MONGODB_URI",
  "MONGODB_URL",
  "MONGO_URL",
  "DATABASE_URL"
] as const;

function normalizeMongoUri(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function resolveMongoUri(): string {
  for (const key of MONGO_URI_ENV_KEYS) {
    const value = normalizeMongoUri(process.env[key]);
    if (value) return value;
  }

  throw new Error(
    `MongoDB connection string is not set. Define one of: ${MONGO_URI_ENV_KEYS.join(", ")}`
  );
}
