import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const mainTex = path.join(exportDir, "main.tex");
const publisherTex = path.join(exportDir, "frontmatter", "publisher.tex");
const figureMacros = path.join(exportDir, "assets", "images", "latex", "figure-includes.tex");

const actions = [];

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function patchMain() {
  let tex = fs.readFileSync(mainTex, "utf8");

  function ensurePackage(pkg) {
    const line = `\\usepackage{${pkg}}`;
    if (!tex.includes(line)) {
      tex = tex.replace("\\usepackage{csquotes}", `\\usepackage{csquotes}\n${line}`);
      actions.push(`added ${pkg}`);
    }
  }

  ensurePackage("xurl");
  ensurePackage("ragged2e");

  tex = tex.replace(
    /\\titleformat\{\\chapter\}\[display\]\{[\s\S]*?\}\{20pt\}\{\\Huge\}/,
    "\\titleformat{\\chapter}[display]{\\normalfont\\Large\\bfseries\\RaggedRight}{\\chaptertitlename\\ \\thechapter}{12pt}{\\Large\\RaggedRight}"
  );

  const controls = `% Booksmith Typography Repair v3
% Remove overflowing running headers in proof/export builds.
\\pagestyle{plain}

% Give TeX more legal line-breaking room without changing the manuscript text.
\\emergencystretch=8em
\\tolerance=5000
\\hbadness=10000
\\hfuzz=2pt
\\sloppy
\\Urlmuskip=0mu plus 4mu
`;

  if (!tex.includes("Booksmith Typography Repair v3")) {
    tex = tex.replace("\\begin{document}", `${controls}\n\\begin{document}`);
    actions.push("disabled running headers and added proof line-breaking controls");
  }

  write(mainTex, tex);
}

function patchPublisherNote() {
  if (!fs.existsSync(publisherTex)) return;

  let tex = fs.readFileSync(publisherTex, "utf8");

  tex = tex.replace(
    /\\begin\{quote\}\s*\\emph\{Fractal\\_Holographic\\_Quantum\\_Consciousness\\_Model\\_\\_A\\_Unified\\_Framework\\_for\\_Matter\\_\\_Energy\\_\\_and\\_Consciousness \(3\)\}\s*\\end\{quote\}/m,
    `\\begin{quote}
\\small\\ttfamily\\path{Fractal_Holographic_Quantum_Consciousness_Model__A_Unified_Framework_for_Matter__Energy__and_Consciousness_3}
\\end{quote}`
  );

  write(publisherTex, tex);
  actions.push("converted raw source filename to breakable \\path{}");
}

function patchFigureMacros() {
  if (!fs.existsSync(figureMacros)) return;

  let tex = fs.readFileSync(figureMacros, "utf8");

  tex = tex.replace("{/FHQCMImageRoot/#2}", "{\\FHQCMImageRoot/#2}");

  if (!tex.includes("FHQCMFigurePlaceholderCounter")) {
    tex = tex.replace(
      "\\newcommand{\\FHQCMFigurePlaceholder}[3]{%",
      "\\newcounter{FHQCMFigurePlaceholderCounter}\n\\newcommand{\\FHQCMFigurePlaceholder}[3]{%\n  \\stepcounter{FHQCMFigurePlaceholderCounter}"
    );

    tex = tex.replace(
      "\\label{fig:#3}",
      "\\label{fig:#3-\\theFHQCMFigurePlaceholderCounter}"
    );

    actions.push("made placeholder figure labels unique");
  }

  write(figureMacros, tex);
}

patchMain();
patchPublisherNote();
patchFigureMacros();

console.log("Typography Repair v3 complete.");
for (const action of actions) console.log("-", action);
