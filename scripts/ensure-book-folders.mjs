import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "library", "book-registry.json");
const folders = ["manuscript", "sources", "assets", "latex", "exports"];

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

for (const book of registry.books) {
  const bookRoot = path.join(root, "books", book.slug);
  fs.mkdirSync(bookRoot, { recursive: true });

  for (const folder of folders) {
    const folderPath = path.join(bookRoot, folder);
    fs.mkdirSync(folderPath, { recursive: true });

    const keepPath = path.join(folderPath, ".gitkeep");
    if (!fs.existsSync(keepPath)) {
      fs.writeFileSync(
        keepPath,
        `# ${book.title} / ${folder}\n\nThis folder is reserved for real Booksmith production data. Do not add fake manuscript or mock source content.\n`,
      );
    }
  }
}

console.log(`Ensured Booksmith folder skeletons for ${registry.books.length} books.`);
