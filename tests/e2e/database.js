import mongoose from "mongoose";
import { AiUsage } from "../../src/models/AiUsage.js";
import { ChatMessage } from "../../src/models/ChatMessage.js";
import { FunderProfile } from "../../src/models/FunderProfile.js";
import { FundingInterest } from "../../src/models/FundingInterest.js";
import { InterestMessage } from "../../src/models/InterestMessage.js";
import { LoginAttempt } from "../../src/models/LoginAttempt.js";
import { MentorProfile } from "../../src/models/MentorProfile.js";
import { MentorRequest } from "../../src/models/MentorRequest.js";
import { Plan } from "../../src/models/Plan.js";
import { Post } from "../../src/models/Post.js";
import { RequestMessage } from "../../src/models/RequestMessage.js";
import { User } from "../../src/models/User.js";
import { TEST_DOMAIN } from "./helpers.js";

// Database access for global-setup.js and global-teardown.js. The browser
// tests use the same database as `npm run dev`.

export async function openDatabase() {
  if (!process.env.MONGODB_URI) process.loadEnvFile(".env.local");
  // The tests add an administrator with a known password, so run them only
  // against the project's own database, never a live site with real users.
  await mongoose.connect(process.env.MONGODB_URI);
}

export function closeDatabase() {
  return mongoose.disconnect();
}

/**
 * Deletes test accounts and everything they made: this run's accounts, and
 * any an interrupted run left behind more than an hour ago. Accounts of a run
 * still going on at the same time are left alone.
 */
export async function removeTestAccounts(run) {
  const testEmail = new RegExp(`${TEST_DOMAIN.replace(".", "\\.")}$`);
  const thisRun = new RegExp(`-${run}${TEST_DOMAIN.replace(".", "\\.")}$`);
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const userIds = await User.find({ $or: [{ email: thisRun }, { email: testEmail, createdAt: { $lt: anHourAgo } }] }).distinct("_id");
  const planIds = await Plan.find({ ownerId: { $in: userIds } }).distinct("_id");
  const requestIds = await MentorRequest.find({ $or: [{ entrepreneurId: { $in: userIds } }, { mentorId: { $in: userIds } }] }).distinct("_id");
  await Promise.all([
    Plan.deleteMany({ _id: { $in: planIds } }),
    ChatMessage.deleteMany({ planId: { $in: planIds } }),
    FundingInterest.deleteMany({ $or: [{ planId: { $in: planIds } }, { funderId: { $in: userIds } }] }),
    InterestMessage.deleteMany({ authorId: { $in: userIds } }),
    MentorRequest.deleteMany({ _id: { $in: requestIds } }),
    RequestMessage.deleteMany({ $or: [{ requestId: { $in: requestIds } }, { authorId: { $in: userIds } }] }),
    Post.deleteMany({ authorId: { $in: userIds } }),
    MentorProfile.deleteMany({ userId: { $in: userIds } }),
    FunderProfile.deleteMany({ userId: { $in: userIds } }),
    AiUsage.deleteMany({ userId: { $in: userIds } }),
    LoginAttempt.deleteMany({ $or: [{ email: thisRun }, { email: testEmail, createdAt: { $lt: anHourAgo } }] }),
  ]);
  await User.deleteMany({ _id: { $in: userIds } });
}
