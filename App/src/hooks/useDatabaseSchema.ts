import { useState, useEffect } from 'react';
import type { DatabaseInstance } from '../db';

export interface ColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: any;
  primaryKey: boolean;
}

export interface ForeignKey {
  from: string;
  table: string;
  to: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKey[];
}

export interface DatabaseSchema {
  tables: TableInfo[];
}

/**
 * Hook to extract complete database schema for ER diagram
 */
export function useDatabaseSchema(db: DatabaseInstance | null) {
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setSchema(null);
      return;
    }

    const extractSchema = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get all table names
        const tablesResult = db.execute(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        );

        if (!tablesResult.success || !tablesResult.data) {
          throw new Error('Failed to fetch tables');
        }

        const tables: TableInfo[] = [];

        // For each table, get columns and foreign keys
        for (const tableRow of tablesResult.data) {
          const tableName = tableRow.name as string;

          // Get column information
          const columnsResult = db.execute(`PRAGMA table_info(${tableName});`);
          
          if (!columnsResult.success || !columnsResult.data) {
            continue;
          }

          const columns: ColumnInfo[] = columnsResult.data.map((col: any) => ({
            name: col.name,
            type: col.type || 'ANY',
            notNull: col.notnull === 1,
            defaultValue: col.dflt_value,
            primaryKey: col.pk === 1,
          }));

          // Get foreign key information
          const fkResult = db.execute(`PRAGMA foreign_key_list(${tableName});`);
          
          const foreignKeys: ForeignKey[] = [];
          if (fkResult.success && fkResult.data) {
            foreignKeys.push(
              ...fkResult.data.map((fk: any) => ({
                from: fk.from,
                table: fk.table,
                to: fk.to,
              }))
            );
          }

          tables.push({
            name: tableName,
            columns,
            foreignKeys,
          });
        }

        setSchema({ tables });
      } catch (err: any) {
        setError(err.message || 'Failed to extract schema');
        console.error('Schema extraction error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    extractSchema();
  }, [db]);

  return { schema, isLoading, error };
}