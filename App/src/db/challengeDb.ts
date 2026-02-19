import { createDatabase } from './sql';
import { schemaSQL } from './schema';
import { seedSQL } from './seed';
import type { QueryResult, DatabaseInstance, PossibleExecResult } from './types';

const FORBIDDEN_KEYWORDS = [
  'drop',
  'delete',
  'update',
  'insert',
  'alter',
  'truncate',
  'create',
  'replace',
];

function isQueryAllowed(query: string): { allowed: boolean; keyword?: string } {
  const lower = query.toLowerCase().trim();

  const withoutComments = lower
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(withoutComments)) {
      return { allowed: false, keyword };
    }
  }

  return { allowed: true };
}

function normalizeRows(data: unknown[] = []) {
  return [...data].sort((a, b) =>
    JSON.stringify(a).localeCompare(JSON.stringify(b))
  );
}

export async function createChallengeDB(): Promise<DatabaseInstance> {
  let db = await createDatabase();
  db.run(schemaSQL);
  db.run(seedSQL);

  const execute = (query: string): QueryResult => {
    const validation = isQueryAllowed(query);

    if (!validation.allowed) {
      return {
        success: false,
        message: `Schema modification is not allowed in Challenge Mode. (Found: ${validation.keyword?.toUpperCase()})`,
      };
    }

    try {
      const results = db.exec(query);
      if (!results || results.length === 0) {
        return {
          success: true,
          message: `Query executed successfully. Rows affected: ${db.getRowsModified()}`,
          data: [],
        };
      }

      const raw = results[0] as PossibleExecResult;

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
  };

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
    mode: 'challenge',
    execute,
    reset,
    dispose,
  };

  return instance;
}

export async function validateChallenge(
  userQuery: string,
  solutionQuery: string
): Promise<{
  passed: boolean;
  message: string;
  userResult?: unknown;
  expectedResult?: unknown;
}> {
  const userDb = await createChallengeDB();
  const solutionDb = await createChallengeDB();

  try {
    const userResult = userDb.execute(userQuery);
    console.log("Result:", userResult);

    if (!userResult.success) {
      return {
        passed: false,
        message: `Your query failed: ${userResult.message}`,
      };
    }

    const expectedResult = solutionDb.execute(solutionQuery);

    if (!expectedResult.success) {
      return {
        passed: false,
        message: 'Internal error: Solution query failed.',
      };
    }

    const userJSON = JSON.stringify(normalizeRows(userResult.data ?? []));
    const expectedJSON = JSON.stringify(
      normalizeRows(expectedResult.data ?? [])
    );

    if (userJSON === expectedJSON) {
      return {
        passed: true,
        message: '✅ Correct! Your query produces the expected result.',
        userResult: userResult.data,
        expectedResult: expectedResult.data,
      };
    }

    return {
      passed: false,
      message:
        '❌ Incorrect. Your query result does not match the expected output.',
      userResult: userResult.data,
      expectedResult: expectedResult.data,
    };
  } finally {
    userDb.dispose();
    solutionDb.dispose();
  }
}