import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

declare global {
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

const mongoClient = new MongoClient(uri);

const clientPromise =
  global.mongoClientPromise ?? (global.mongoClientPromise = mongoClient.connect());

export default clientPromise;
