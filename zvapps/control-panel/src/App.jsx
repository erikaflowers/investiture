import { useState } from "react";
import { SystemLabel } from "./zv/kit.jsx";
import OverviewPage from "./pages/zv/OverviewPage.jsx";
import ActivityPage from "./pages/zv/ActivityPage.jsx";
import SkillsPage from "./pages/zv/SkillsPage.jsx";
import FilesPage from "./pages/zv/FilesPage.jsx";
import DoctrinePage from "./pages/DoctrinePage.jsx";
import DesignPage from "./pages/DesignPage.jsx";
import HealthPage from "./pages/HealthPage.jsx";

// The Box is superseded (brief, Decision 7) — removed from navigation.
// Doctrine/Design/Health remain from v1.5 until their M4/M5 rebuilds.

const NAV = [
  {
    label: "sidecar",
    pages: [
      { key: "overview", title: "Overview", component: OverviewPage },
      { key: "activity", title: "Activity", component: ActivityPage },
      { key: "skills", title: "Skills", component: SkillsPage },
      { key: "files", title: "Files", component: FilesPage },
    ],
  },
  {
    label: "workbench",
    pages: [
      { key: "doctrine", title: "Doctrine", component: DoctrinePage },
      { key: "design", title: "Design", component: DesignPage },
      { key: "health", title: "Health", component: HealthPage },
    ],
  },
];

const ALL_PAGES = NAV.flatMap((g) => g.pages);

export default function App() {
  const [page, setPage] = useState("overview");
  const ActivePage =
    ALL_PAGES.find((p) => p.key === page)?.component ?? OverviewPage;

  return (
    <div className="cp-shell">
      <header className="cp-topbar">
        <span className="cp-brand">Investiture</span>
        <SystemLabel>control panel</SystemLabel>
        <div className="cp-topbar-right">
          <SystemLabel>zero vector design</SystemLabel>
        </div>
      </header>

      <div className="cp-body">
        <nav className="cp-sidebar">
          {NAV.map((group) => (
            <div className="cp-nav-group" key={group.label}>
              <div className="cp-nav-group-label">
                <SystemLabel>{group.label}</SystemLabel>
              </div>
              {group.pages.map((p) => (
                <button
                  key={p.key}
                  className={`cp-nav-btn${page === p.key ? " is-active" : ""}`}
                  onClick={() => setPage(p.key)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="cp-content">
          <ActivePage />
        </main>
      </div>

      <footer className="cp-statusbar zv-invert">
        <span>Investiture Control Panel</span>
        <span>:3067</span>
      </footer>
    </div>
  );
}
