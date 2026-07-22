import './App.css';

// ── The Investiture start page ──────────────────────────────────────────
// This is a placeholder. It exists to be deleted.
//
// Your app goes here — this file, this CSS, this whole src/ directory
// belong to you. The sidecar (the control panel on :3067) is the part
// that stays; it tracks your project while you replace everything else.
//
// Before you build: read VECTOR.md, then CLAUDE.md, then ARCHITECTURE.md.

export default function App() {
  return (
    <div className="hello">
      <main className="hello-card">
        <div className="hello-label">investiture // start page</div>
        <h1 className="hello-title">
          Hello. This page is a placeholder.
        </h1>
        <p className="hello-lede">
          Everything in <code>src/</code> is yours to replace — this page is
          just proof the scaffold runs. Your project's brain lives in the
          sidecar.
        </p>

        <ol className="hello-steps">
          <li>
            <span className="hello-step-label">read</span>
            <code>VECTOR.md</code> → <code>CLAUDE.md</code> →{' '}
            <code>ARCHITECTURE.md</code>
          </li>
          <li>
            <span className="hello-step-label">run</span>
            <code>npm run zvapps</code> and open{' '}
            <a href="http://localhost:3067">localhost:3067</a> — the control
            panel will walk you through naming your project
          </li>
          <li>
            <span className="hello-step-label">build</span>
            delete this page and make something
          </li>
        </ol>

        <div className="hello-foot">
          <span className="hello-square" aria-hidden="true" />
          Zero Vector · Investiture
        </div>
      </main>
    </div>
  );
}
