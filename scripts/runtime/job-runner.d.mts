export type RuntimeJobRecord = {
  id: string;
  kind: string;
  bookSlug: string | null;
  status: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  log: string;
};

export function listJobKinds(): Array<{ kind: string; consequential: boolean }>;
export function startJob(input: { kind: string; bookSlug?: string; confirmation?: string }): Promise<RuntimeJobRecord>;
export function getJob(id: string): Promise<RuntimeJobRecord | null>;
export function recentJobs(limit?: number): Promise<RuntimeJobRecord[]>;
