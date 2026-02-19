import type { DatabaseInstance, ColumnInfo, TableSchema } from './types';

/**
 * Get all table names from the database
 */
export function getTableNames(db: DatabaseInstance): string[] {
  try {
    const result = db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    );
    
    if (result.success && result.data) {
      return result.data.map((row: any) => row.name);
    }
    return [];
  } catch (error) {
    console.error('Error fetching table names:', error);
    return [];
  }
}

/**
 * Get column information for a specific table
 */
export function getTableSchema(db: DatabaseInstance, tableName: string): ColumnInfo[] {
  try {
    const result = db.execute(`PRAGMA table_info(${tableName});`);
    console.log("This is the table schema:", result);
    
    if (result.success && result.data) {
      return result.data as ColumnInfo[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching schema for table ${tableName}:`, error);
    return [];
  }
}

/**
 * Get all data from a specific table
 */
export function getTableData(db: DatabaseInstance, tableName: string): any[] {
  try {
    const result = db.execute(`SELECT * FROM ${tableName};`);
    
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching data from table ${tableName}:`, error);
    return [];
  }
}

/**
 * Get complete information about a table (schema + data)
 */
export function getCompleteTableInfo(db: DatabaseInstance, tableName: string): TableSchema {
  return {
    tableName,
    columns: getTableSchema(db, tableName),
    data: getTableData(db, tableName),
  };
}

/**
 * Get all tables with their complete information
 */
export function getAllTablesInfo(db: DatabaseInstance): TableSchema[] {
  const tableNames = getTableNames(db);
  return tableNames.map(tableName => getCompleteTableInfo(db, tableName));
}
