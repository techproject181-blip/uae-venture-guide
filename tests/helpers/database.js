import mongoose from "mongoose";
import { afterAll, beforeAll } from "vitest";
import { connectDB } from "@/lib/db";

// The Docker MongoDB from `npm run db:up`. CI points this at its own MongoDB.
const SERVER = process.env.TEST_MONGODB_SERVER ?? "mongodb://127.0.0.1:27018";

/**
 * Gives a test file its own empty database, so tests never touch development
 * data or each other's data. The database is deleted when the file finishes.
 */
export function setupTestDatabase(name) {
  beforeAll(async () => {
    process.env.MONGODB_URI = `${SERVER}/uae_venture_guide_test_${name}`;
    try {
      await connectDB();
    } catch (error) {
      throw new Error(`Cannot reach MongoDB at ${SERVER}. Start it with: npm run db:up`, { cause: error });
    }
    // Wait until every model's indexes exist (unique keys, text search), then
    // remove anything an earlier, interrupted run left behind.
    for (const model of Object.values(mongoose.models)) {
      await model.init();
      await model.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
}
