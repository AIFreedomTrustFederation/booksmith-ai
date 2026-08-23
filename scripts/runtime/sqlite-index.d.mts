export type IndexSummary = {
  dbPath: string;
  documentCount: number;
  entityCount: number;
  edgeCount: number;
  rebuiltAt: string;
};

export function rebuildBooksmithIndex(): Promise<IndexSummary>;
export function searchBooksmithIndex(query: string, options?: { bookSlug?: string; limit?: number }): Promise<Array<Record<string, unknown>>>;
export function booksmithGraph(bookSlug?: string): Promise<{ entities: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> }>;
export function indexStatus(): Promise<{ ready: boolean; dbPath: string; metadata?: Record<string, string>; error?: string }>;
