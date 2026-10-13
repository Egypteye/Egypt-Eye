// Strips // and /* */ comments, then reports every remaining em-dash: those
// are the ones a visitor can actually read.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const files = execSync(
  "grep -rl '—' src/content/flyingDresses.ts src/content/outfitCollection.ts src/app/flying-dresses --include=*.ts --include=*.tsx"
).toString().trim().split("\n");
let visible = 0, inComments = 0;
const hits = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  let out = "", i = 0, mode = "code";
  const lines = src.split("\n");
  lines.forEach((line, n) => {
    let clean = "", m = mode;
    for (let j = 0; j < line.length; j++) {
      const two = line.slice(j, j + 2);
      if (m === "code" && two === "/*") { m = "block"; j++; continue; }
      if (m === "block" && two === "*/") { m = "code"; j++; continue; }
      if (m === "code" && two === "//") { break; }
      if (m === "code") clean += line[j];
    }
    mode = m;
    const inLine = (line.match(/—/g) || []).length;
    const inClean = (clean.match(/—/g) || []).length;
    inComments += inLine - inClean;
    visible += inClean;
    if (inClean) hits.push(`${f}:${n + 1}: ${clean.trim()}`);
  });
}
console.log(`VISIBLE (in strings/JSX): ${visible}`);
console.log(`in code comments only:    ${inComments}`);
console.log("---");
console.log(hits.join("\n"));
