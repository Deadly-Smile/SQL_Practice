import { createDatabase } from './sql';
import { schemaSQL } from './schema';
import { seedSQL } from './seed';
import type { QueryResult } from './types';

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

/**
 * Check if query contains forbidden operations
 */
function isQueryAllowed(query: string): { allowed: boolean; keyword?: string } {
  const lower = query.toLowerCase().trim();

  // Remove SQL comments
  const withoutComments = lower
    .replace(/--.*$/gm, '') // Single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ''); // Multi-line comments

  for (const keyword of FORBIDDEN_KEYWORDS) {
    // Check for keyword as a whole word (not part of another word)
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(withoutComments)) {
      return { allowed: false, keyword };
    }
  }

  return { allowed: true };
}

/**
 * Create fresh Challenge Mode database instance
 */
export async function createChallengeDB() {
  const db = await createDatabase();
  db.run(schemaSQL);
  db.run(seedSQL);

  return {
    db,
    mode: 'challenge' as const,

    execute(query: string): QueryResult {
      // Check for forbidden operations
      const validation = isQueryAllowed(query);
      if (!validation.allowed) {
        return {
          success: false,
          message: `Schema modification is not allowed in Challenge Mode. (Found: ${validation.keyword?.toUpperCase()})`,
        };
      }

      try {
        const results = db.exec(query);

        if (results.length === 0) {
          return {
            success: true,
            message: 'Query executed successfully',
            data: [],
          };
        }

        return {
          success: true,
          data: results[0].values.map((row) =>
            Object.fromEntries(
              results[0].columns.map((col, i) => [col, row[i]])
            )
          ),
          columns: results[0].columns,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Query execution failed',
        };
      }
    },

    reset(): void {
      // In challenge mode, recreate the database
      db.close();
      createChallengeDB().then((newDb) => {
        Object.assign(this, { db: newDb.db });
      });
      db.run(schemaSQL);
      db.run(seedSQL);
    },

    dispose(): void {
      db.close();
    },
  };
}

/**
 * Validate user query against expected solution
 */
export async function validateChallenge(
  userQuery: string,
  solutionQuery: string
): Promise<{ passed: boolean; message: string; userResult?: any; expectedResult?: any }> {
  // Create fresh DB for validation
  const db = await createChallengeDB();

  try {
    // Execute user query
    const userResult = db.execute(userQuery);
    if (!userResult.success) {
      return {
        passed: false,
        message: `Your query failed: ${userResult.message}`,
      };
    }

    // Execute solution query
    const expectedResult = db.execute(solutionQuery);
    if (!expectedResult.success) {
      return {
        passed: false,
        message: 'Internal error: Solution query failed',
      };
    }

    // Compare results
    const userJSON = JSON.stringify(userResult.data);
    const expectedJSON = JSON.stringify(expectedResult.data);

    if (userJSON === expectedJSON) {
      return {
        passed: true,
        message: '✅ Correct! Your query produces the expected result.',
        userResult: userResult.data,
        expectedResult: expectedResult.data,
      };
    } else {
      return {
        passed: false,
        message: '❌ Incorrect. Your query result does not match the expected output.',
        userResult: userResult.data,
        expectedResult: expectedResult.data,
      };
    }
  } finally {
    db.dispose();
  }
}