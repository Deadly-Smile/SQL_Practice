import { createDatabase } from './sql';
import type { Database } from "sql.js";
import { schemaSQL } from './schema';
import { seedSQL } from './seed';
import type { QueryResult } from './types';

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
  const instanceDb = await loadDatabase();

  return {
    db: instanceDb,
    mode: 'practice' as const,
    execute(query: string): QueryResult {
      try {
        const trimmed = query.trim().toLowerCase();

        // ---------------------------
        // SELECT queries
        // ---------------------------
        if (trimmed.startsWith("select")) {
          const results = this.db.exec(query);
          console.log("Query executed successfully.");

          if (!results || results.length === 0) {
            return {
              success: true,
              columns: [],
              data: [],
            };
          }

          const raw = results[0];

          // Normalize result shape (handles `columns` OR `lc`)
          const columns: string[] = raw.columns ?? raw.lc ?? [];
          const values: any[][] = raw.values ?? [];

          const data = values.map((row: any[]) =>
            Object.fromEntries(
              columns.map((col: string, i: number) => [col, row[i]])
            )
          );

          return {
            success: true,
            columns,
            data,
          };
        }

        // ---------------------------
        // Non-SELECT queries
        // ---------------------------
        this.db.run(query);

        // Save only after write operations
        saveDatabase(this.db);

        return {
          success: true,
          message: "Query executed successfully",
        };

      } catch (error: any) {
        return {
          success: false,
          message: error || "Query execution failed",
        };
      }
    },

    async reset(): Promise<void> {
      this.db.close();
      localStorage.removeItem(STORAGE_KEY);

      this.db = await loadDatabase();
      saveDatabase(this.db);
    },

    dispose(): void {
      this.db.close();
    },
  };
}

/**
 * Reset practice database to default schema
 */
export function resetPracticeDB(): void {
  localStorage.removeItem(STORAGE_KEY);
}