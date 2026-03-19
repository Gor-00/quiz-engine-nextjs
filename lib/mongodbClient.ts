import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  const mongoClient = new MongoClient(uri);
  return mongoClient.connect();
}

const clientPromise = global.mongoClientPromise ?? (global.mongoClientPromise = createMongoClientPromise());

export default clientPromise;
