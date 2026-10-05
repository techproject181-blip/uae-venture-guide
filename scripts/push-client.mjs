// Pushes main to the client's GitHub repository with every commit authored by
// the client. Code, messages and dates stay the same; only the name and email
// change. The rewrite gives the same commit ids every time, so each push adds
// the new commits on top, like a normal push. Your own repository keeps your name.
// Usage:
//   npm run push:client
//   npm run push:client -- --force    only when the client's main must be replaced
import { execFileSync } from "node:child_process";

const CLIENT_REPO = "https://github.com/techproject181-blip/uae-venture-guide.git";
const CLIENT_NAME = "techproject181-blip";
const CLIENT_EMAIL = "338208677+techproject181-blip@users.noreply.github.com";

function git(args, input) {
  return execFileSync("git", args, { input, maxBuffer: 64 * 1024 * 1024 });
}

const identity = `${CLIENT_NAME} <${CLIENT_EMAIL}>`;
const commits = git(["rev-list", "--reverse", "--topo-order", "main"]).toString().trim().split("\n");
const rewritten = new Map();

for (const id of commits) {
  const raw = git(["cat-file", "commit", id]);
  const split = raw.indexOf("\n\n");
  const header = raw.subarray(0, split).toString().split("\n");
  const message = raw.subarray(split);

  const lines = [];
  let skipping = false;
  for (const line of header) {
    // A signature belongs to the old commit, so it is dropped with its continuation lines.
    if (line.startsWith(" ") && skipping) continue;
    skipping = line.startsWith("gpgsig") || line.startsWith("mergetag");
    if (skipping) continue;

    const parent = line.match(/^parent (\w+)$/);
    const person = line.match(/^(author|committer) .* (\d+ [+-]\d{4})$/);
    if (parent) lines.push(`parent ${rewritten.get(parent[1])}`);
    else if (person) lines.push(`${person[1]} ${identity} ${person[2]}`);
    else lines.push(line);
  }

  const object = Buffer.concat([Buffer.from(lines.join("\n")), message]);
  rewritten.set(id, git(["hash-object", "-t", "commit", "-w", "--stdin"], object).toString().trim());
}

const head = rewritten.get(commits.at(-1));
console.log(`main ${commits.at(-1).slice(0, 7)} -> client ${head.slice(0, 7)}`);
execFileSync("git", ["push", ...process.argv.slice(2), CLIENT_REPO, `${head}:refs/heads/main`], { stdio: "inherit" });
