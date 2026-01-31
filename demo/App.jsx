import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [showCard, setShowCard] = useState(false);

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <main className="container">
        {/* Hero */}
        <header className="hero">
          <h1 className="title">
            <span className="title-line">Build with</span>
            <span className="title-accent">Investiture</span>
          </h1>
          <p className="subtitle">
            A minimal React scaffold for AI-assisted development.
            <br />
            Clean code. Clear structure. Ready for Claude.
          </p>
        </header>

        {/* Interactive demos */}
        <section className="demos">
          {/* Counter */}
          <div className="demo-card">
            <h3>Counter</h3>
            <p className="demo-description">Click to increment</p>
            <button
              className="counter-button"
              onClick={() => setCount(c => c + 1)}
            >
              Count: {count}
            </button>
          </div>

          {/* Theme toggle */}
          <div className="demo-card">
            <h3>Theme</h3>
            <p className="demo-description">Toggle dark/light mode</p>
            <button
              className="toggle-button"
              onClick={() => setIsDark(d => !d)}
            >
              <span className="toggle-track">
                <span className={`toggle-thumb ${isDark ? 'dark' : 'light'}`} />
              </span>
              <span className="toggle-label">{isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Show/hide card */}
          <div className="demo-card">
            <h3>Visibility</h3>
            <p className="demo-description">Show or hide content</p>
            <button
              className="visibility-button"
              onClick={() => setShowCard(s => !s)}
            >
              {showCard ? 'Hide' : 'Show'} Card
            </button>
          </div>
        </section>

        {/* Animated card */}
        <div className={`reveal-card ${showCard ? 'visible' : ''}`}>
          <div className="reveal-card-content">
            <span className="reveal-icon">✨</span>
            <h4>You found me!</h4>
            <p>This card animates in and out with CSS transitions.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>
            Open this project in <strong>Claude Code</strong> and ask it to add features.
          </p>
          <code className="prompt">
            "Add a color picker that changes the background."
          </code>
        </footer>
      </main>
    </div>
  );
}

export default App;
