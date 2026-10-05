import { closeDatabase, openDatabase, removeTestAccounts } from "./database.js";
import { RUN } from "./helpers.js";

/** After the tests: deletes this run's accounts and everything they made. */
export default async function globalTeardown() {
  await openDatabase();
  await removeTestAccounts(RUN);
  await closeDatabase();
}
