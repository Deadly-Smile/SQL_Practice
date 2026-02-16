import type { Database } from 'sql.js';

export type DatabaseMode = 'practice' | 'challenge';

export interface QueryResult {
  success: boolean;
  message?: string;
  data?: any[];
  columns?: string[];
}

export interface DatabaseInstance {
  db: Database;
  mode: DatabaseMode;
  execute: (query: string) => QueryResult;
  reset: () => Promise<void>;
  dispose: () => void;
}