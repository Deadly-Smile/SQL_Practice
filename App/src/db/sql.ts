import initSqlJs from "sql.js";
import type { Database, SqlJsStatic } from "sql.js";

let SQL: SqlJsStatic | null = null;

/**
 * Ensures SQL.js is initialized only once.
 */
async function getSQL(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: () => "/sql-wasm.wasm"
    });
  }

  return SQL;
}

/**
 * Creates a new SQLite database instance.
 * Optionally accepts a buffer (for persistence loading).
 */
export async function createDatabase(
  buffer?: Uint8Array
): Promise<Database> {

  const SQLInstance = await getSQL();

  if (buffer) {
    return new SQLInstance.Database(buffer);
  }

  return new SQLInstance.Database();
}
