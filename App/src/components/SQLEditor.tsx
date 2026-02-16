import { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import type { DatabaseMode } from '../db';
import './SQLEditor.css';

export function SQLEditor() {
  const { mode, isLoading, error, executeQuery, changeMode, resetDatabase } = useDatabase('practice');
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [result, setResult] = useState<any>(null);

  const handleExecute = () => {
    console.log("Trying to execute query:", query);
    const queryResult = executeQuery(query);
    setResult(queryResult);
  };

  const handleModeChange = (newMode: DatabaseMode) => {
    if (window.confirm(`Switch to ${newMode} mode? This will create a new database instance.`)) {
      changeMode(newMode);
      setResult(null);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset database to default schema? This will delete all your changes.')) {
      await resetDatabase();
      setResult(null);
    }
  };

  if (isLoading) {
    return (
      <div className="sql-editor loading">
        <div className="spinner">Loading database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sql-editor error">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="sql-editor">
      {/* Warning banner for challenge mode */}
      {mode === 'challenge' && (
        <div className="warning-banner">
          ⚠️ Schema modifications are disabled in Challenge Mode. Only SELECT queries allowed.
        </div>
      )}

      {/* Query input */}
      <div className="query-section">
        <label htmlFor="query-input">SQL Query:</label>
        <textarea
          id="query-input"
          className="query-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here..."
          rows={8}
        />
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleExecute}>
          ▶️ Execute Query
        </button>

        {mode === 'practice' && (
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 Reset Database
          </button>
        )}
      </div>

      {/* Results display */}
      {result && (
        <div className={`result-section ${result.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <strong>{result.success ? '✅ Success' : '❌ Error'}</strong>
          </div>

          {result.message && (
            <div className="result-message">{result.message}</div>
          )}

          {result.success && result.data && result.data.length > 0 && (
            <div className="result-table-wrapper">
              <table className="result-table">
                <thead>
                  <tr>
                    {result.columns?.map((col: string) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row: any, idx: number) => (
                    <tr key={idx}>
                      {result.columns?.map((col: string) => (
                        <td key={col}>{String(row[col] ?? 'NULL')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="result-count">
                {result.data.length} row{result.data.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {result.success && result.data && result.data.length === 0 && (
            <div className="result-empty">No rows returned</div>
          )}
        </div>
      )}
    </div>
  );
}