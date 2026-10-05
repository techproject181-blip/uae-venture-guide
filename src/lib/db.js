import mongoose from "mongoose";

// Next.js reloads files during development, so the connection is kept on
// globalThis and reused instead of opening a new one after every change.
const cached = globalThis.mongooseCache ?? (globalThis.mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  }

  cached.promise ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // let the next request try again
    throw error;
  }
  return cached.conn;
}
