import { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { DatabaseExplorer } from './Explorer/DatabaseExplorer';
import './PracticeMode.css';

export function PracticeMode() {
  const { db, isLoading, error, executeQuery, resetDatabase } = useDatabase('practice');
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [result, setResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    console.log("Executing query:", query);
    
    try {
      const queryResult = executeQuery(query);
      setResult(queryResult);
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset database to default schema? This will delete all your changes.')) {
      await resetDatabase();
      setResult(null);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setResult(null);
  };

  if (isLoading) {
    return (
      <div className="practice-mode">
        <div className="loading-state">
          <div className="spinner">Loading database...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-mode">
        <div className="error-state">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-mode">
      <div className="editor-layout">
        {/* Database Explorer Sidebar */}
        <DatabaseExplorer db={db} />

        {/* Main Practice Area */}
        <div className="editor-main">
          <div className="query-section">
            <div className="query-header">
              <label htmlFor="practice-query">SQL Query:</label>
              <div className="query-info">
                <button className="btn btn-clear" onClick={handleClearQuery}>
                  Clear Query
                </button>
                <button className="btn btn-reset" onClick={handleReset}>
                  🔄 Reset Database
                </button>
              </div>
            </div>

            <textarea
              id="practice-query"
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here... Try: CREATE TABLE, INSERT INTO, SELECT, UPDATE, DELETE, etc."
              rows={12}
            />

            <div className="query-actions">
              <button
                className="btn btn-execute"
                onClick={handleExecute}
                disabled={!query.trim() || isExecuting}
              >
                {isExecuting ? '⏳ Executing...' : '▶️ Execute Query'}
              </button>
            </div>
          </div>

          {/* Results Display */}
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
                <div className="result-empty">Query executed successfully. No rows returned.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
