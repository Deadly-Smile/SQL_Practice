import { createDatabase } from './sql';
import type { Database } from "sql.js";
import { schemaSQL } from './schema';
import { seedSQL } from './seed';
import type { QueryResult, PossibleExecResult, DatabaseInstance } from './types';

const STORAGE_KEY = 'practice_db';

/**
 * Save database to localStorage
 */
function saveDatabase(db: Database): void {
  try {
    const data = db.export();
    const array = Array.from(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

/**
 * Load database from localStorage or create new one
 */
async function loadDatabase(): Promise<Database> {

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const buffer = new Uint8Array(JSON.parse(saved));
      return await createDatabase(buffer);
    } catch (error) {
      console.error('Failed to load saved database, creating new one:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Create fresh database
  const db = await createDatabase();
  db.run(schemaSQL);
  db.run(seedSQL);
  saveDatabase(db);

  return db;
}

/**
 * Create Practice Mode database instance
 */
export async function createPracticeDB() {
  let db = await loadDatabase();

  const execute = (raw_query: string): QueryResult => {
    try {
      const query = raw_query.trim().toLowerCase();

      const results = db.exec(query);

      if (!results || results.length === 0) {
        return {
          success: true,
          columns: [],
          data: [],
        };
      }

      const raw = results[0] as PossibleExecResult;
      // Normalize result shape (handles `columns` OR `lc`)
      const columns: string[] = Array.isArray(raw.columns)
      ? (raw.columns as string[])
        : Array.isArray(raw.lc)
        ? (raw.lc as string[])
        : [];

      const values: unknown[][] = Array.isArray(raw.values)
        ? (raw.values as unknown[][])
        : [];

      const data = values.map((row) =>
        Object.fromEntries(
          columns.map((col, i) => [col, row[i]])
        )
      );

      if (!query.startsWith("select")) {
        saveDatabase(db);
      }

      return {
        success: true,
        columns,
        data,
      };
    } catch (error: unknown) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : String(error) || 'Query execution failed',
        };
    }
  }

  const reset = async (): Promise<void> => {
    db.close();

    db = await createDatabase();
    db.run(schemaSQL);
    db.run(seedSQL);

    instance.db = db; // keep external reference updated
  };

  const dispose = (): void => {
    db.close();
  };

  const instance: DatabaseInstance = {
    db,
    mode: 'practice' as const,
    execute,
    reset,
    dispose,
  };

  return instance;
}

/**
 * Reset practice database to default schema
 */
export function resetPracticeDB(): void {
  localStorage.removeItem(STORAGE_KEY);
}