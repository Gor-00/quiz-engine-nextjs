import mongoose from "mongoose";
import { resolveMongoUri } from "@/lib/mongoUri";

const MONGODB_URI = resolveMongoUri();

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

if (!global.mongooseConn) {
  global.mongooseConn = { conn: null, promise: null };
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (global.mongooseConn?.conn) {
    return global.mongooseConn.conn;
  }

  if (!global.mongooseConn?.promise) {
    global.mongooseConn!.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    });
  }

  global.mongooseConn!.conn = await global.mongooseConn!.promise;
  return global.mongooseConn!.conn!;
}

// Backward-compatible helper used by existing routes.
export async function getDb() {
  const connection = await connectMongo();
  if (!connection.connection.db) {
    throw new Error("MongoDB connection is not ready");
  }
  return connection.connection.db;
}

