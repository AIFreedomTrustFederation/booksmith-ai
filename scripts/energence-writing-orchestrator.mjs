import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const slug = process.argv[2] || "energence";
const bookRoot = path.join(root, "books", slug);
const planPath = path.join(bookRoot, "writing", "chapter-plan.json");
const queueDir = path.join(bookRoot, "writing", "queue");
const reportPath = path.join(bookRoot, "writing", "writing-queue-report.json");

if (!fs.existsSync(planPath)) {
  console.error(`Missing chapter plan: ${path.relative(root, planPath)}`);
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
fs.mkdirSync(queueDir, { recursive: true });

const packets = [];
for (const chapter of plan.chapters) {
  const filename = chapter.slug + ".md";
  const relative = path.join("writing", "queue", filename).replaceAll("\\", "/");
  const packet = [
    "---",
    `book: ${slug}`,
    `chapter: ${chapter.number}`,
    `title: "${chapter.title.replaceAll('"', '\\"')}"`,
    `status: proposal-requested`,
    `target_words: ${chapter.targetWords}`,
    "author_approval_required: true",
    "---",
    "",
    `# Chapter ${chapter.number}: ${chapter.title}`,
    "",
    "## Author-canon constraint",
    "",
    "Read `sources/author-canon.md` first. Preserve the author's theory as canon. Mark scientific qualifications, historical context, alternative readings, and AI-generated synthesis as editorial proposals until approved.",
    "",
    "## Primary texts",
    "",
    chapter.primaryTexts,
    "",
    "## Required chapter movement",
    "",
    ...chapter.requiredSections.map((section, index) => `${index + 1}. **${section}.**`),
    "",
    "## Evidence discipline",
    "",
    "- Separate biblical exegesis from constructive Energence theology.",
    "- Separate established science from philosophical inference.",
    "- Do not use Scripture as a modern genetics, cosmology, or quantum-physics textbook.",
    "- State the strongest naturalistic and classical-theist objections fairly.",
    "- Never equate evolutionary fitness with moral worth or divine favor.",
    "- Add citation placeholders only when the source still requires verification.",
    "",
    "## Deliverables",
    "",
    "- Proposed chapter draft in `manuscript/chapters/" + chapter.slug + ".md`",
    "- Source notes and bibliography candidates",
    "- Fact-check and Scripture-context checklist",
    "- Figure or diagram opportunities",
    "- Explicit author decisions still required",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(queueDir, filename), packet);
  packets.push({ chapter: chapter.number, title: chapter.title, packet: relative, status: "READY_FOR_DRAFT_PROPOSAL" });
}

const report = { slug, generatedAt: new Date().toISOString(), packets, counts: { total: packets.length, ready: packets.length } };
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.counts, null, 2));
console.log(`Writing queue: ${path.relative(root, queueDir)}`);
