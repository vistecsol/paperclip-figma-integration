export function designApi(service: unknown): (request: unknown) => Promise<{ status: number; body: unknown }>;
export function designStore(db: unknown): unknown;
export function hostDesignOperations(options: unknown): Record<string, unknown>;
export class DesignError extends Error { constructor(code: string, status?: number); code: string; status: number; }
