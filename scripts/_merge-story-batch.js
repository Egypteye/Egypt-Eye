// Usage: node scripts/_merge-story-batch.js <worktreeStoriesPath> <slug1> <slug2> ...
const fs = require("fs");
const path = require("path");

const [, , worktreePath, ...slugs] = process.argv;
if (!worktreePath || slugs.length === 0) {
  console.error("Usage: node _merge-story-batch.js <worktreeStoriesPath> <slug1> <slug2> ...");
  process.exit(1);
}

const mainPath = path.join(__dirname, "..", "src", "content", "stories.ts");

function splitTopLevelStoryObjects(text) {
  const arrayStartMarker = "export const stories: Story[] = [";
  const arrayStart = text.indexOf(arrayStartMarker);
  if (arrayStart === -1) throw new Error("Could not find stories array start");
  let i = arrayStart + arrayStartMarker.length;

  const items = [];
  let depth = 0;
  let itemStart = null;
  let inString = null;

  while (i < text.length) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      i += 1;
      continue;
    }
    if (ch === "{") {
      if (depth === 0 && itemStart === null) {
        itemStart = i;
      }
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      if (depth === 0 && itemStart !== null) {
        let end = i + 1;
        if (text[end] === ",") end += 1;
        if (text[end] === "\n") end += 1;
        items.push({ start: itemStart, end, text: text.slice(itemStart, end) });
        itemStart = null;
      }
      i += 1;
      continue;
    }
    if (ch === "]" && depth === 0) {
      break;
    }
    i += 1;
  }
  return items;
}

function ownSlugOf(itemText) {
  const m = itemText.match(/slug: "([a-z0-9-]+)"/);
  return m ? m[1] : null;
}

function findBySlug(items, slug) {
  const matches = items.filter((it) => ownSlugOf(it.text) === slug);
  if (matches.length === 0) throw new Error(`No top-level story object found for slug: ${slug}`);
  if (matches.length > 1) throw new Error(`Ambiguous: ${matches.length} top-level objects whose OWN slug is: ${slug}`);
  return matches[0];
}

let mainText = fs.readFileSync(mainPath, "utf8");
const worktreeText = fs.readFileSync(worktreePath, "utf8");

const results = [];
for (const slug of slugs) {
  const mainItems = splitTopLevelStoryObjects(mainText);
  const worktreeItems = splitTopLevelStoryObjects(worktreeText);
  const oldObj = findBySlug(mainItems, slug);
  const newObj = findBySlug(worktreeItems, slug);
  mainText = mainText.slice(0, oldObj.start) + newObj.text + mainText.slice(oldObj.end);
  results.push({ slug, oldChars: oldObj.text.length, newChars: newObj.text.length });
}

fs.writeFileSync(mainPath, mainText);
console.log("Merged:", JSON.stringify(results, null, 2));

const finalItems = splitTopLevelStoryObjects(mainText);
console.log("Final top-level story object count:", finalItems.length);
const seen = new Set();
for (const it of finalItems) {
  const s = ownSlugOf(it.text);
  if (!s) {
    console.error("WARNING: a top-level object has no slug match:", it.text.slice(0, 80));
    continue;
  }
  if (seen.has(s)) console.error("WARNING: duplicate slug:", s);
  seen.add(s);
}
console.log("Unique slugs found:", seen.size);
