import { useState, useEffect, useCallback } from 'react';
import { createDatabase, switchDatabaseMode } from '../db';
import { type DatabaseMode, type DatabaseInstance, type QueryResult } from '../db';

export function useDatabase(initialMode: DatabaseMode = 'practice') {
  const [db, setDb] = useState<DatabaseInstance | null>(null);
  const [mode, setMode] = useState<DatabaseMode>(initialMode);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database
  useEffect(() => {
    let mounted = true;

    async function initDb() {
      setIsLoading(true);
      setError(null);

      try {
        const newDb = await createDatabase(mode);
        if (mounted) {
          setDb(newDb);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to initialize database');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initDb();

    return () => {
      mounted = false;
    };
  }, [mode]);

  // Execute query
  const executeQuery = useCallback(
    (query: string): QueryResult => {
      if (!db) {
        return {
          success: false,
          message: 'Database not initialized',
        };
      }

      return db.execute(query);
    },
    [db]
  );

  // Switch mode
  const changeModeHandler = useCallback(async (newMode: DatabaseMode) => {
    setIsLoading(true);
    setError(null);

    try {
      const newDb = await switchDatabaseMode(db, newMode);
      setDb(newDb);
      setMode(newMode);
    } catch (err: any) {
      setError(err.message || 'Failed to switch database mode');
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  // Reset database
  const resetDatabase = useCallback(async () => {
    if (db) {
      await db.reset();
    }
  }, [db]);

  return {
    db,
    mode,
    isLoading,
    error,
    executeQuery,
    changeMode: changeModeHandler,
    resetDatabase,
  };
}