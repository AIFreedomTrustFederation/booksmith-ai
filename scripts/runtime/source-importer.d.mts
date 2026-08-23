export function importSource(input: {
  bookSlug: string;
  fileName?: string;
  contentBase64?: string;
  text?: string;
  url?: string;
  rightsStatus?: string;
  notes?: string;
}): Promise<{
  record: Record<string, unknown>;
  metadata: Record<string, unknown>;
  directory: string;
}>;
