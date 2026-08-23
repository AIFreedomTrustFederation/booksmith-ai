export function readProviderSettings(): Promise<{ providers: Array<Record<string, unknown>> }>;
export function writeProviderSettings(input: { providers: Array<{ id: string; enabled?: boolean; baseUrl?: string; defaultModel?: string }> }): Promise<{ providers: Array<Record<string, unknown>> }>;
