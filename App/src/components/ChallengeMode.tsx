import { useState, useEffect } from 'react';
import { validateChallenge } from '../db';
import { useDatabase } from '../hooks/useDatabase';
import { DatabaseExplorer } from './Explorer/DatabaseExplorer';
import challengesData from '../data/challenges.json';
import './ChallengeMode.css';

interface Challenge {
  id: number;
  title: string;
  description: string;
  expectedQuery: string;
  hint?: string;
  difficulty: string;
  category: string;
  solved: boolean;
}

const CHALLENGES_PER_PAGE = 9; // 3x3 grid looks good

export function ChallengeMode() {
  const { db, executeQuery } = useDatabase('challenge');
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadedChallenges = challengesData as Challenge[];
    
    // Load solved status from localStorage
    const solvedStatus = JSON.parse(localStorage.getItem('challengeSolved') || '{}');
    const updatedChallenges = loadedChallenges.map(challenge => ({
      ...challenge,
      solved: solvedStatus[challenge.id] || false
    }));
    
    setChallenges(updatedChallenges);
    setSolvedCount(Object.values(solvedStatus).filter(Boolean).length);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDifficulty, filterCategory]);

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUserQuery('');
    setRunResult(null);
    setValidationResult(null);
    setView('editor');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedChallenge(null);
    setUserQuery('');
    setRunResult(null);
    setValidationResult(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setRunResult(null);
    setValidationResult(null);

    try {
      const result = executeQuery(userQuery);
      setRunResult(result);
    } catch (error: any) {
      setRunResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedChallenge) return;

    setIsValidating(true);
    setValidationResult(null);
    setRunResult(null);

    try {
      const result = await validateChallenge(userQuery, selectedChallenge.expectedQuery);
      setValidationResult(result);

      // If passed, mark as solved
      if (result.passed) {
        const solvedStatus = JSON.parse(localStorage.getItem('challengeSolved') || '{}');
        solvedStatus[selectedChallenge.id] = true;
        localStorage.setItem('challengeSolved', JSON.stringify(solvedStatus));
        
        // Update local state
        const updatedChallenges = challenges.map(c =>
          c.id === selectedChallenge.id ? { ...c, solved: true } : c
        );
        setChallenges(updatedChallenges);
        setSelectedChallenge({ ...selectedChallenge, solved: true });
        setSolvedCount(prev => prev + 1);
      }
    } catch (error: any) {
      setValidationResult({
        passed: false,
        message: `Validation error: ${error.message}`,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const categories = ['all', ...Array.from(new Set(challenges.map(c => c.category)))];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredChallenges = challenges.filter(challenge => {
    const difficultyMatch = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty;
    const categoryMatch = filterCategory === 'all' || challenge.category === filterCategory;
    return difficultyMatch && categoryMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredChallenges.length / CHALLENGES_PER_PAGE);
  const startIndex = (currentPage - 1) * CHALLENGES_PER_PAGE;
  const endIndex = startIndex + CHALLENGES_PER_PAGE;
  const currentChallenges = filteredChallenges.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // LIST VIEW
  if (view === 'list') {
    return (
      <div className="challenge-list-page">
        <div className="challenge-list-header">
          <div className="header-content">
            <h1>🏆 SQL Challenges</h1>
            <p>Master SQL through hands-on practice</p>
          </div>
          
          <div className="solved-badge">
            <span className="fire-emoji">🔥</span>
            <div className="solved-info">
              <div className="solved-count">{solvedCount}</div>
              <div className="solved-label">Solved</div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Difficulty:</label>
            <div className="filter-buttons">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  className={`filter-btn ${filterDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setFilterDifficulty(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <div className="filter-buttons">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="results-info">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredChallenges.length)} of {filteredChallenges.length} challenges
          </div>
        </div>

        <div className="challenges-grid">
          {currentChallenges.map(challenge => (
            <div
              key={challenge.id}
              className={`challenge-card ${challenge.solved ? 'solved' : ''}`}
              onClick={() => handleChallengeSelect(challenge)}
            >
              <div className="challenge-card-header">
                <span className="challenge-id">#{challenge.id}</span>
                <span
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
                >
                  {challenge.difficulty}
                </span>
              </div>

              <h3 className="challenge-card-title">
                {challenge.solved && <span className="check-mark">✓</span>}
                {challenge.title}
              </h3>

              <p className="challenge-card-description">{challenge.description}</p>

              <div className="challenge-card-footer">
                <span className="category-tag">{challenge.category}</span>
                {challenge.solved && (
                  <span className="solved-indicator">Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="no-challenges">
            <p>No challenges found with the selected filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  }

  // EDITOR VIEW
  if (view === 'editor' && selectedChallenge) {
    return (
      <div className="challenge-editor">
        <div className="editor-layout">
          <DatabaseExplorer db={db} />

          <div className="editor-main">
            <div className="editor-header">
              <button className="back-btn" onClick={handleBackToList}>
                ← Back to Challenges
              </button>
              
              <div className="challenge-info">
                <div className="challenge-meta">
                  <span className="challenge-id">#{selectedChallenge.id}</span>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(selectedChallenge.difficulty) }}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="category-badge">{selectedChallenge.category}</span>
                  {selectedChallenge.solved && <span className="solved-badge">✓ Solved</span>}
                </div>
                
                <h1>{selectedChallenge.title}</h1>
                <p className="challenge-description">{selectedChallenge.description}</p>
                
                {selectedChallenge.hint && (
                  <div className="challenge-hint">
                    💡 <strong>Hint:</strong> {selectedChallenge.hint}
                  </div>
                )}
              </div>
            </div>

            <div className="query-section">
              <div className="query-header">
                <label htmlFor="user-query">Your SQL Query:</label>
                <div className="query-actions">
                  <button
                    className="btn btn-run"
                    onClick={handleRun}
                    disabled={!userQuery.trim() || isRunning}
                  >
                    {isRunning ? '⏳ Running...' : '▶️ Run Query'}
                  </button>
                  <button
                    className="btn btn-validate"
                    onClick={handleValidate}
                    disabled={!userQuery.trim() || isValidating}
                  >
                    {isValidating ? '⏳ Validating...' : '✓ Validate'}
                  </button>
                </div>
              </div>

              <textarea
                id="user-query"
                className="query-input"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Write your SQL query here..."
                rows={12}
              />
            </div>

            {/* Run Result */}
            {runResult && (
              <div className={`result-section ${runResult.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <strong>{runResult.success ? '▶️ Query Result' : '❌ Error'}</strong>
                </div>

                {runResult.message && (
                  <div className="result-message">{runResult.message}</div>
                )}

                {runResult.success && runResult.data && runResult.data.length > 0 && (
                  <div className="result-table-wrapper">
                    <table className="result-table">
                      <thead>
                        <tr>
                          {runResult.columns?.map((col: string) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {runResult.data.map((row: any, idx: number) => (
                          <tr key={idx}>
                            {runResult.columns?.map((col: string) => (
                              <td key={col}>{String(row[col] ?? 'NULL')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="result-count">
                      {runResult.data.length} row{runResult.data.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {runResult.success && runResult.data && runResult.data.length === 0 && (
                  <div className="result-empty">No rows returned</div>
                )}
              </div>
            )}

            {/* Validation Result */}
            {validationResult && (
              <div className={`validation-result ${validationResult.passed ? 'passed' : 'failed'}`}>
                <div className="validation-header">
                  {validationResult.passed ? '🎉 Challenge Passed!' : '❌ Not Quite Right'}
                </div>
                <div className="validation-message">{validationResult.message}</div>

                {!validationResult.passed && validationResult.userResult && (
                  <div className="result-comparison">
                    <div className="result-column">
                      <h4>Your Result:</h4>
                      <pre>{JSON.stringify(validationResult.userResult, null, 2)}</pre>
                    </div>
                    <div className="result-column">
                      <h4>Expected Result:</h4>
                      <pre>{JSON.stringify(validationResult.expectedResult, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {validationResult.passed && (
                  <div className="success-actions">
                    <button className="btn btn-next" onClick={handleBackToList}>
                      ← Back to Challenges
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}