import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

export type BookRegistryEntry = {
  slug: string;
  title: string;
  series: string;
  status: string;
  purpose: string;
};

export type BookRegistry = {
  libraryId: string;
  title: string;
  description: string;
  defaultImprint: string;
  preparedWith: string;
  version: string;
  books: BookRegistryEntry[];
};

export type BookConfig = BookRegistryEntry & {
  subtitle?: string;
  version?: string;
  relatedBooks?: string[];
  canonicalTerms?: string[];
  publishingTargets?: string[];
  provenanceRequired?: boolean;
};

export type SourceRegistryEntry = {
  sourceId: string;
  bookSlug: string;
  sourceType: string;
  location: string;
  rightsStatus: string;
  status: string;
  notes?: string;
};

export type SourceRegistry = {
  registryId: string;
  version: string;
  description: string;
  sources: SourceRegistryEntry[];
};

export type BookFolderStatus = {
  manuscript: boolean;
  sources: boolean;
  assets: boolean;
  latex: boolean;
  exports: boolean;
};

export type BookshelfBook = {
  registry: BookRegistryEntry;
  config: BookConfig | null;
  configPath: string;
  folders: BookFolderStatus;
  connectedSources: SourceRegistryEntry[];
  issues: string[];
};

export type FederatedLibrary = {
  registry: BookRegistry;
  sources: SourceRegistry;
  books: BookshelfBook[];
  series: string[];
  statuses: string[];
};

const repositoryRoot = process.cwd();

async function readJson<T>(relativePath: string): Promise<T> {
  const filePath = path.join(repositoryRoot, relativePath);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function pathExists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(repositoryRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(relativePath: string): Promise<boolean> {
  try {
    const result = await stat(path.join(repositoryRoot, relativePath));
    return result.isDirectory();
  } catch {
    return false;
  }
}

function bookIssues(registry: BookRegistryEntry, config: BookConfig | null): string[] {
  const issues: string[] = [];

  if (!config) {
    issues.push("Missing book.config.json");
    return issues;
  }

  if (config.slug !== registry.slug) {
    issues.push("Config slug does not match registry slug");
  }

  if (config.title !== registry.title) {
    issues.push("Config title differs from registry title");
  }

  if (config.series !== registry.series) {
    issues.push("Config series differs from registry series");
  }

  if (config.status !== registry.status) {
    issues.push("Config status differs from registry status");
  }

  return issues;
}

export async function loadFederatedLibrary(): Promise<FederatedLibrary> {
  const registry = await readJson<BookRegistry>("library/book-registry.json");
  const sources = (await pathExists("library/source-registry.json"))
    ? await readJson<SourceRegistry>("library/source-registry.json")
    : {
        registryId: "missing-source-registry",
        version: "0.0.0",
        description: "No source registry file found.",
        sources: [],
      };

  const books = await Promise.all(
    registry.books.map(async (book) => {
      const configPath = `books/${book.slug}/book.config.json`;
      const config = (await pathExists(configPath))
        ? await readJson<BookConfig>(configPath)
        : null;

      const folders: BookFolderStatus = {
        manuscript: await directoryExists(`books/${book.slug}/manuscript`),
        sources: await directoryExists(`books/${book.slug}/sources`),
        assets: await directoryExists(`books/${book.slug}/assets`),
        latex: await directoryExists(`books/${book.slug}/latex`),
        exports: await directoryExists(`books/${book.slug}/exports`),
      };

      return {
        registry: book,
        config,
        configPath,
        folders,
        connectedSources: sources.sources.filter((source) => source.bookSlug === book.slug),
        issues: bookIssues(book, config),
      } satisfies BookshelfBook;
    }),
  );

  return {
    registry,
    sources,
    books,
    series: [...new Set(registry.books.map((book) => book.series))].sort(),
    statuses: [...new Set(registry.books.map((book) => book.status))].sort(),
  };
}
