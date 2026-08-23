export type RuntimeManuscriptRecord = {
  bookSlug: string;
  chapterSlug: string;
  path: string;
  exists: boolean;
  text: string;
  hash: string;
  words: number;
};

export function readManuscript(bookSlug: string, chapterSlug: string): Promise<RuntimeManuscriptRecord>;
export function diffManuscript(input: { bookSlug: string; chapterSlug: string; draft: string }): Promise<Record<string, unknown>>;
export function saveManuscript(input: { bookSlug: string; chapterSlug: string; draft: string; expectedHash?: string; commit?: boolean; message?: string }): Promise<Record<string, unknown>>;
export function gitStatus(): Promise<{ available: boolean; branch: string | null; status: string[] }>;
export function recentManuscriptProvenance(limit?: number): Promise<Array<Record<string, unknown>>>;
