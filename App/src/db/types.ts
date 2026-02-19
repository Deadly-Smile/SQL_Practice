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

export interface PossibleExecResult {
  columns?: unknown;
  values?: unknown;
  lc?: unknown;
};

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  data: any[];
}