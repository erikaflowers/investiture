import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useSupabase } from '@investiture/hooks';
import { ToastProvider, AIOverlayProvider } from '@investiture/components';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';

// Import styles
import './styles/index.css';

/**
 * STC App - Main shell component
 * Handles auth state and routing
 */
function App() {
  return (
    <BrowserRouter basename="/stc-react">
      <ToastProvider>
        <AIOverlayProvider>
          <AppContent />
        </AIOverlayProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { user, loading, signIn, signOut, isAuthenticated } = useSupabase();

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B85C38" strokeWidth="1.5" style={styles.loadingIcon}>
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
          <div style={styles.loadingTitle}>Every story begins somewhere</div>
          <div style={styles.loadingSubtitle}>Loading your workspace...</div>
          <div style={styles.loadingDots}>
            <span style={{ ...styles.dot, animationDelay: '0s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!isAuthenticated) {
    return (
      <div style={styles.authScreen}>
        <div style={styles.authContainer}>
          <h2 style={styles.authTitle}>Welcome, Storyteller</h2>
          <p style={styles.authSubtitle}>Sign in to save your ideas and build your beat sheet.</p>
          <button onClick={() => signIn('google')} style={styles.googleBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Authenticated - show app with routing
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <Link to="/" style={styles.headerLink}>
          <h1 style={styles.headerTitle}>Story Concept Builder</h1>
        </Link>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user.email}</span>
          <button onClick={signOut} style={styles.signOutBtn}>Sign Out</button>
        </div>
      </header>

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  // Loading screen
  loadingScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(145deg, #F5EEE6 0%, #EDE4D8 50%, #E8DFD1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  loadingIcon: {
    marginBottom: '24px',
    animation: 'pulse 2s ease-in-out infinite'
  },
  loadingTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#2C2416',
    marginBottom: '8px'
  },
  loadingSubtitle: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '0.9rem',
    color: '#8B7D6B'
  },
  loadingDots: {
    display: 'flex',
    gap: '6px',
    marginTop: '24px'
  },
  dot: {
    width: '6px',
    height: '6px',
    background: '#B85C38',
    borderRadius: '50%',
    animation: 'bounce 1.4s ease-in-out infinite'
  },

  // Auth screen
  authScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #F5EEE6 0%, #EDE4D8 50%, #E8DFD1 100%)'
  },
  authContainer: {
    background: '#FFFCF8',
    padding: '48px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    margin: '0 24px'
  },
  authTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.75rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: '0 0 12px 0'
  },
  authSubtitle: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '1rem',
    color: '#8B7D6B',
    margin: '0 0 32px 0'
  },
  googleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#2C2416',
    background: 'white',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  // App shell
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#FFFCF8',
    borderBottom: '1px solid #D9CFC2'
  },
  headerLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  headerTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userEmail: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '14px',
    color: '#8B7D6B'
  },
  signOutBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },

  // Main content
  main: {
    flex: 1,
    padding: '24px'
  }
};

export default App;
