import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const mainTex = path.join(exportDir, "main.tex");

if (!fs.existsSync(mainTex)) {
  console.error(`Missing ${mainTex}`);
  console.error("Run npm run render:latex first.");
  process.exit(1);
}

let tex = fs.readFileSync(mainTex, "utf8");

function addPackage(afterPackage, packageLine) {
  if (tex.includes(packageLine)) return;
  tex = tex.replace(afterPackage, `${afterPackage}\n${packageLine}`);
}

addPackage("\\usepackage{hyperref}", "\\usepackage{xurl}");
addPackage("\\usepackage{xurl}", "\\usepackage{ragged2e}");

const proofSettings = `
% Booksmith proof overflow controls.
% These are proof-stage safety rails, not a substitute for final typography review.
\\emergencystretch=3em
\\tolerance=2000
\\hbadness=10000
\\hfuzz=1pt
\\sloppy
\\Urlmuskip=0mu plus 2mu
`;

if (!tex.includes("Booksmith proof overflow controls")) {
  tex = tex.replace("\\begin{document}", `${proofSettings}\n\\begin{document}`);
}

tex = tex.replaceAll(
  "\\titleformat{\\chapter}[display]{\\normalfont\\huge\\bfseries}{\\chaptertitlename\\ \\thechapter}{20pt}{\\Huge}",
  "\\titleformat{\\chapter}[display]{\\normalfont\\LARGE\\bfseries\\RaggedRight}{\\chaptertitlename\\ \\thechapter}{16pt}{\\Large\\RaggedRight}"
);

fs.writeFileSync(mainTex, tex, "utf8");

console.log("patched exported main.tex with Booksmith proof overflow controls");
