export { createDatabase, switchDatabaseMode } from './dbFactory';
export { createPracticeDB, resetPracticeDB } from './practiceDb';
export { createChallengeDB, validateChallenge } from './challengeDb';
export { getTableNames, getTableSchema, getTableData, getCompleteTableInfo, getAllTablesInfo } from './tableSchema'
export { schemaSQL } from './schema';
export { seedSQL } from './seed';
export type { DatabaseMode, QueryResult, DatabaseInstance, TableSchema, ColumnInfo } from './types';