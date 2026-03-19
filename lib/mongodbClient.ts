import { MongoClient } from "mongodb";
import { resolveMongoUri } from "@/lib/mongoUri";

declare global {
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise() {
  const uri = resolveMongoUri();
  const mongoClient = new MongoClient(uri);
  return mongoClient.connect();
}

const clientPromise = global.mongoClientPromise ?? (global.mongoClientPromise = createMongoClientPromise());

export default clientPromise;
