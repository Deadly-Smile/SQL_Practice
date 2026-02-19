import { useState } from 'react';
import { ChallengeMode } from './components/ChallengeMode';
import './App.css';
import { PracticeMode } from './components/PracticeMode';

type View = 'editor' | 'challenge';

function App() {
  const [currentView, setCurrentView] = useState<View>('editor');

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>SQL Learning Platform</h1>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${currentView === 'editor' ? 'active' : ''}`}
            onClick={() => setCurrentView('editor')}
          >
            📝 SQL Editor
          </button>
          <button
            className={`nav-link ${currentView === 'challenge' ? 'active' : ''}`}
            onClick={() => setCurrentView('challenge')}
          >
            🏆 Challenges
          </button>
        </div>
      </nav>

      <main className="app-main">
        {currentView === 'editor' && (
          <PracticeMode />
        )}
        {currentView === 'challenge' && <ChallengeMode />}
      </main>

      <footer className="app-footer">
        <p>Created by <a className='link' href='https://github.com/Deadly-Smile'>Anik Saha</a></p>
      </footer>
    </div>
  );
}

export default App;