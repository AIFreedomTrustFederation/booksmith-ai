import fs from "node:fs";

const file = "src/lib/proof/repair-engine.ts";
let s = fs.readFileSync(file, "utf8");

// Fix bad JSON validation pattern:
// JSON.stringify(...) + "\\n"; JSON.parse(...) parses literal backslash-n.
s = s.replace(
  /const repairEngineJson = JSON\.stringify\(result, null, 2\) \+ "\\\\n";\s*JSON\.parse\(repairEngineJson\);/m,
  `const repairEngineJson = JSON.stringify(result, null, 2);
  JSON.parse(repairEngineJson);`
);

s = s.replace(
  /repairEngineJson,\s*"utf8",/m,
  `repairEngineJson + "\\n",
    "utf8",`
);

fs.writeFileSync(file, s);
console.log("Fixed repair-engine.ts JSON newline validation.");
