import mongoose from "mongoose";
import { afterAll, beforeAll } from "vitest";
import { connectDB } from "@/lib/db";

// The MongoDB from .env.local (or the environment, in CI). Each test file
// swaps in its own database name.
const SERVER = process.env.MONGODB_URI;

/**
 * Gives a test file its own empty database, so tests never touch development
 * data or each other's data. The database is deleted when the file finishes.
 */
export function setupTestDatabase(name) {
  beforeAll(async () => {
    if (!SERVER) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
    const url = new URL(SERVER);
    url.pathname = `/uae_venture_guide_test_${name}`;
    process.env.MONGODB_URI = url.toString();
    try {
      await connectDB();
    } catch (error) {
      throw new Error(`Cannot reach MongoDB at ${url.host}. Check MONGODB_URI in .env.local`, { cause: error });
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
