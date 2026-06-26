import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const booksDir = path.join(root, "books");
const registryPath = path.join(booksDir, "registry.json");
const reportPath = path.join(booksDir, "registry-report.md");

const plannedBooks = {
  "library-of-the-federation": {
    title: "Library of the Federation",
    status: "planned",
    purpose: "Canonical map of federation books, source records, publishing packets, and cross-book dependencies."
  },
  "civilizational-resilience": {
    title: "Civilizational Resilience",
    status: "planned",
    purpose: "Future volume on resilience, social recovery, distributed infrastructure, and long-horizon federation survival."
  },
  "dynastylink": {
    title: "DynastyLink",
    status: "planned",
    purpose: "Future volume for trust identity, federation membership, dynasty trust onboarding, and cooperative continuity."
  },
  "aift-constitution-and-doctrine": {
    title: "AIFT Constitution and Doctrine",
    status: "planned",
    purpose: "Future constitutional and doctrinal foundation for AI Freedom Trust Federation governance."
  },
  "ai-stewardship-and-alignment": {
    title: "AI Stewardship and Alignment",
    status: "planned",
    purpose: "Future volume on AI stewardship, alignment, provenance, sovereignty, and human-centered automation."
  },
  "federation-theory": {
    title: "Federation Theory",
    status: "planned",
    purpose: "Future volume on federated governance, cooperative infrastructure, and social operating systems."
  },
  "greenshift-theory": {
    title: "Greenshift Theory",
    status: "planned",
    purpose: "Future volume on ecological transition, green-zone systems, and biozone civilization design."
  },
  "the-green-zone": {
    title: "The Green Zone",
    status: "planned",
    purpose: "Future volume on regenerative zones, local resilience, food, energy, water, and community sovereignty."
  },
  "booksmith-ai-manual": {
    title: "BookSmith AI Manual",
    status: "planned",
    purpose: "Future manual for using BookSmith AI as an author-first, local-first publishing studio."
  },
  "krystal-spiral": {
    title: "Krystal Spiral",
    status: "planned",
    purpose: "Future symbolic and theoretical volume connected to spiral geometry, consciousness, and coherence."
  },
  "coincidence-and-the-eternal-now": {
    title: "Coincidence and the Eternal Now",
    status: "planned",
    purpose: "Future volume on coincidence, coherence, time, observation, and meaning."
  }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function listBookConfigs() {
  if (!fs.existsSync(booksDir)) return [];

  return fs.readdirSync(booksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(booksDir, entry.name, "book.config.json"))
    .filter((file) => fs.existsSync(file));
}

const existingBooks = {};

for (const configPath of listBookConfigs()) {
  const config = readJson(configPath);
  const slug = config.slug || path.basename(path.dirname(configPath));

  existingBooks[slug] = {
    slug,
    title: config.title || slug,
    status: config.status || "draft",
    version: config.version || "0.1.0",
    path: path.relative(root, path.dirname(configPath)).replaceAll("\\", "/"),
    purpose: config.purpose || "",
    relatedBooks: Array.isArray(config.relatedBooks) ? config.relatedBooks : []
  };
}

const books = {
  ...plannedBooks,
  ...existingBooks
};

for (const [slug, book] of Object.entries(books)) {
  book.slug = slug;
}

const registry = {
  schema: "booksmith.federation-library-registry.v1",
  generatedAt: new Date().toISOString(),
  policy: {
    knownBookStatuses: ["active", "draft", "planned", "archived"],
    plannedBooksSatisfyRelatedBookReferences: true,
    unknownRelatedBooksFailValidation: true
  },
  books
};

writeJson(registryPath, registry);

const relatedRefs = [];

for (const book of Object.values(books)) {
  for (const related of book.relatedBooks || []) {
    relatedRefs.push({
      from: book.slug,
      to: related,
      known: Boolean(books[related]),
      targetStatus: books[related]?.status || null
    });
  }
}

fs.writeFileSync(reportPath, [
  "# BookSmith Federation Library Registry",
  "",
  `Generated: ${registry.generatedAt}`,
  `Books known: ${Object.keys(books).length}`,
  "",
  "## Books",
  "",
  ...Object.values(books)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((book) => `- \`${book.slug}\` — ${book.title} (${book.status})`),
  "",
  "## Related Book References",
  "",
  relatedRefs.length
    ? relatedRefs.map((ref) => `- \`${ref.from}\` -> \`${ref.to}\` ${ref.known ? `(${ref.targetStatus})` : "(UNKNOWN)"}`).join("\n")
    : "None.",
  "",
].join("\n"));

console.log(`Registry written: ${path.relative(root, registryPath)}`);
console.log(`Report written: ${path.relative(root, reportPath)}`);
console.log(`Books known: ${Object.keys(books).length}`);
