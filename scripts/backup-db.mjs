// Saves a copy of a database in the backups folder. mongodump runs inside the
// Docker MongoDB container, so nothing else needs installing, but the container
// must be running (npm run db:up), even to back up the production database.
// Usage:
//   npm run db:backup                  the development database
//   npm run db:backup -- production    the database in .env.production
// To put a development backup back (this replaces the current data):
//   docker exec -i uae-venture-guide-mongo mongorestore --archive --gzip --drop < backups/<file>
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, rmSync } from "node:fs";

const CONTAINER = "uae-venture-guide-mongo";
const target = process.argv[2] ?? "development";
if (!["development", "production"].includes(target)) {
  console.error("Usage: npm run db:backup [-- production]");
  process.exit(1);
}

try {
  process.loadEnvFile(`.env.${target}`);
} catch {
  console.error(`.env.${target} is missing. For production, copy .env.production.example to .env.production and fill it in.`);
  process.exit(1);
}
let uri = process.env.MONGODB_URI;
if (target === "development") {
  // Inside the container the database listens on MongoDB's own port, 27017.
  uri = `mongodb://127.0.0.1:27017${new URL(uri).pathname}`;
}

const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
const file = `backups/${target}-${stamp}.archive.gz`;
mkdirSync("backups", { recursive: true });

// The address goes in as an environment variable (-e with no value copies it
// from here), so a password in it never shows in the list of running commands.
const dump = spawn("docker", ["exec", "-e", "MONGODB_URI", CONTAINER, "sh", "-c", 'mongodump --uri="$MONGODB_URI" --archive --gzip'], {
  env: { ...process.env, MONGODB_URI: uri },
  stdio: ["ignore", "pipe", "inherit"],
});
dump.stdout.pipe(createWriteStream(file));
dump.on("close", (code) => {
  if (code !== 0) {
    rmSync(file, { force: true });
    console.error(`Backup failed. Is the database container running? Start it with: npm run db:up`);
    process.exit(1);
  }
  console.log(`Backup saved: ${file}`);
});
