import bcrypt from "bcryptjs";
import { User } from "../../src/models/User.js";
import { closeDatabase, openDatabase, removeTestAccounts } from "./database.js";
import { ADMIN_EMAIL, PASSWORD, RUN } from "./helpers.js";

/** Before the tests: clears accounts an interrupted run left behind, then adds this run's administrator. */
export default async function globalSetup() {
  await openDatabase();
  await removeTestAccounts(RUN);
  await User.create({
    name: "Test administrator",
    email: ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(PASSWORD, 10),
    role: "admin",
    status: "active",
  });
  await closeDatabase();
}
