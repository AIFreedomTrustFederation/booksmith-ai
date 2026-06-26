import fs from "node:fs";
import path from "node:path";

const target = process.argv[2] || "books/fhqcm/exports/pdf/booksmith-repair-engine-v2.json";
const file = path.resolve(process.cwd(), target);

if (!fs.existsSync(file)) {
  console.error(`Missing JSON file: ${target}`);
  process.exit(1);
}

const raw = fs.readFileSync(file, "utf8");

try {
  JSON.parse(raw);
  console.log(`VALID: ${target}`);
  process.exit(0);
} catch (error) {
  console.log(`INVALID: ${target}`);
  console.log(error.message);
}

function repairTruncatedJsonObjectWithResults(input) {
  let text = input.trimEnd();

  const openBraces = [...text.matchAll(/\{/g)].length;
  const closeBraces = [...text.matchAll(/\}/g)].length;
  const openBrackets = [...text.matchAll(/\[/g)].length;
  const closeBrackets = [...text.matchAll(/\]/g)].length;

  const missingBrackets = Math.max(0, openBrackets - closeBrackets);
  const missingBraces = Math.max(0, openBraces - closeBraces);

  for (let i = 0; i < missingBrackets; i++) text += "\n]";
  for (let i = 0; i < missingBraces; i++) text += "\n}";

  return text + "\n";
}

const repaired = repairTruncatedJsonObjectWithResults(raw);

try {
  const parsed = JSON.parse(repaired);
  fs.copyFileSync(file, `${file}.broken`);
  fs.writeFileSync(file, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  console.log(`REPAIRED: ${target}`);
  console.log(`Backup: ${target}.broken`);
} catch (error) {
  console.error("Automatic repair failed.");
  console.error(error.message);
  process.exit(2);
}
