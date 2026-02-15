import type { DatabaseMode, DatabaseInstance } from './types';
import { createPracticeDB } from './practiceDb';
import { createChallengeDB } from './challengeDb';

/**
 * Factory function to create database based on mode
 */
export async function createDatabase(mode: DatabaseMode): Promise<DatabaseInstance> {
  if (mode === 'practice') {
    return createPracticeDB();
  }

  if (mode === 'challenge') {
    return createChallengeDB();
  }

  throw new Error(`Unknown database mode: ${mode}`);
}

/**
 * Switch between database modes
 */
export async function switchDatabaseMode(
  currentDb: DatabaseInstance | null,
  newMode: DatabaseMode
): Promise<DatabaseInstance> {
  // Dispose old database
  if (currentDb) {
    currentDb.dispose();
  }

  // Create new database with new mode
  return createDatabase(newMode);
}