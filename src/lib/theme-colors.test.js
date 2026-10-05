import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { palette } from "@/lib/theme-colors";

// Every colour lives in the :root block of globals.css. These tests keep it that way.

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")) + 1);
const tokens = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));

/** A token's final value, following var(--…) links. */
function resolve(name) {
  const value = tokens[name];
  const link = value?.match(/^var\(--([\w-]+)\)$/);
  return link ? resolve(link[1]) : value;
}

/** Every .js and .jsx file under src/. */
function sourceFiles(dir = new URL("..", import.meta.url).pathname) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.jsx?$/.test(entry) ? [path] : [];
  });
}

// Tailwind's own colour names, which would bypass the palette.
const TAILWIND_COLOURS =
  /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\b(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration)-(white|black)\b/;
const RAW_COLOUR = /#[0-9a-f]{3,8}\b(?![\w-])|\brgba?\(|\bhsla?\(/i;
// Files that may hold real colour values: the mirror for the PDF, and tests.
const ALLOWED = [/theme-colors\.js$/, /\.test\.js$/];

describe("colour palette", () => {
  it("the PDF's copy of the palette matches globals.css", () => {
    for (const [name, value] of Object.entries(palette)) expect(resolve(name), `--${name}`).toBe(value);
  });

  it("globals.css writes colours only in its :root palette", () => {
    const outside = css.replace(root, "");
    expect(outside.match(new RegExp(RAW_COLOUR.source, "gi")) ?? []).toEqual([]);
  });

  it("components use palette tokens, never raw colours or Tailwind's own colours", () => {
    const problems = sourceFiles()
      .filter((file) => !ALLOWED.some((pattern) => pattern.test(file)))
      .flatMap((file) =>
        readFileSync(file, "utf8")
          .split("\n")
          .map((line, index) => ({ line, index }))
          .filter(({ line }) => RAW_COLOUR.test(line) || TAILWIND_COLOURS.test(line))
          .map(({ line, index }) => `${file.split("/src/")[1]}:${index + 1}  ${line.trim().slice(0, 90)}`),
      );
    expect(problems).toEqual([]);
  });
});
