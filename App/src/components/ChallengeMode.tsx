import { useState } from 'react';
import { validateChallenge } from '../db';
import './ChallengeMode.css';

interface Challenge {
  id: number;
  title: string;
  description: string;
  expectedQuery: string;
  hint?: string;
}

const sampleChallenges: Challenge[] = [
  {
    id: 1,
    title: 'Select All Users',
    description: 'Write a query to select all columns from the users table.',
    expectedQuery: 'SELECT * FROM users;',
    hint: 'Use SELECT * to get all columns',
  },
  {
    id: 2,
    title: 'Find Electronics',
    description: 'Write a query to find all products in the Electronics category.',
    expectedQuery: "SELECT * FROM products WHERE category = 'Electronics';",
    hint: 'Use WHERE clause to filter by category',
  },
  {
    id: 3,
    title: 'Count Orders',
    description: 'Write a query to count the total number of orders.',
    expectedQuery: 'SELECT COUNT(*) as total FROM orders;',
    hint: 'Use COUNT(*) aggregate function',
  },
  {
    id: 4,
    title: 'User Orders',
    description: 'Write a query to find all orders for the user with id = 1.',
    expectedQuery: 'SELECT * FROM orders WHERE user_id = 1;',
    hint: 'Filter orders by user_id',
  },
];

export function ChallengeMode() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(sampleChallenges[0]);
  const [userQuery, setUserQuery] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateChallenge(userQuery, selectedChallenge.expectedQuery);
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({
        passed: false,
        message: `Validation error: ${error.message}`,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUserQuery('');
    setValidationResult(null);
  };

  return (
    <div className="challenge-mode">
      <div className="challenge-header">
        <h1>🏆 SQL Challenge Arena</h1>
        <p>Test your SQL skills with these challenges!</p>
      </div>

      <div className="challenge-layout">
        {/* Challenge List */}
        <div className="challenge-list">
          <h3>Challenges</h3>
          {sampleChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`challenge-item ${selectedChallenge.id === challenge.id ? 'active' : ''}`}
              onClick={() => handleChallengeSelect(challenge)}
            >
              <div className="challenge-number">#{challenge.id}</div>
              <div className="challenge-title">{challenge.title}</div>
            </div>
          ))}
        </div>

        {/* Challenge Content */}
        <div className="challenge-content">
          <div className="challenge-details">
            <h2>{selectedChallenge.title}</h2>
            <p className="challenge-description">{selectedChallenge.description}</p>
            
            {selectedChallenge.hint && (
              <div className="challenge-hint">
                💡 <strong>Hint:</strong> {selectedChallenge.hint}
              </div>
            )}
          </div>

          <div className="query-editor">
            <label htmlFor="user-query">Your SQL Query:</label>
            <textarea
              id="user-query"
              className="query-input"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Write your SQL query here..."
              rows={10}
            />
          </div>

          <div className="challenge-actions">
            <button
              className="btn btn-validate"
              onClick={handleValidate}
              disabled={!userQuery.trim() || isValidating}
            >
              {isValidating ? '⏳ Validating...' : '✓ Submit & Validate'}
            </button>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`validation-result ${validationResult.passed ? 'passed' : 'failed'}`}>
              <div className="validation-header">
                {validationResult.passed ? '🎉 Challenge Passed!' : '❌ Try Again'}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}