// Creates the administrator account, or resets its password if it already exists.
// Usage: npm run create-admin -- admin@example.com "Passw0rd123" "Admin Name"
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const [rawEmail, password, name = "Administrator"] = process.argv.slice(2);

if (!rawEmail || !password || password.length < 8) {
  console.error('Usage: npm run create-admin -- <email> <password, 8+ characters> ["Full name"]');
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();
const now = new Date();

await mongoose.connect(process.env.MONGODB_URI);
await mongoose.connection.collection("users").updateOne(
  { email },
  {
    $set: {
      name,
      passwordHash: await bcrypt.hash(password, 10),
      role: "admin",
      status: "active",
      updatedAt: now,
    },
    $setOnInsert: { createdAt: now },
  },
  { upsert: true },
);
await mongoose.disconnect();

console.log(`Administrator ready: ${email}`);
