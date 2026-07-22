import { useState } from "react";
import { AppShell, TopNav, ThemePicker, StatusBar } from "zv-ui";
import CPSidebar from "./components/CPSidebar.jsx";
import QuickCapture from "./components/QuickCapture.jsx";
import HomePage from "./pages/HomePage.jsx";
import DoctrinePage from "./pages/DoctrinePage.jsx";
import DesignPage from "./pages/DesignPage.jsx";
import VectorPage from "./pages/VectorPage.jsx";
import HealthPage from "./pages/HealthPage.jsx";
import OverviewPage from "./pages/zv/OverviewPage.jsx";
import ActivityPage from "./pages/zv/ActivityPage.jsx";
import SkillsPage from "./pages/zv/SkillsPage.jsx";
import FilesPage from "./pages/zv/FilesPage.jsx";
import BoardPage from "./pages/zv/BoardPage.jsx";
import EditorPage from "./pages/zv/EditorPage.jsx";

// zv-ui shell + Labrador themes are the base skin; the sidecar pages
// (marked zv: true) add a scoped taste of the ZV brand via .cp-page.
// The Box is superseded (brief, Decision 7) — not routed.

const PAGES = {
  home: { component: HomePage },
  overview: { component: OverviewPage, zv: true },
  activity: { component: ActivityPage, zv: true },
  board: { component: BoardPage, zv: true },
  editor: { component: EditorPage, zv: true },
  files: { component: FilesPage, zv: true },
  doctrine: { component: DoctrinePage },
  vector: { component: VectorPage },
  design: { component: DesignPage },
  skills: { component: SkillsPage, zv: true },
  health: { component: HealthPage },
};

export default function App() {
  const [page, setPage] = useState("home");
  const [captureOpen, setCaptureOpen] = useState(false);
  const entry = PAGES[page] ?? PAGES.home;
  const ActivePage = entry.component;

  return (
    <AppShell>
      <TopNav
        logo="◧"
        brand="Investiture"
        right={
          <>
            <button className="cp-btn" onClick={() => setCaptureOpen(true)}>
              + Backlog
            </button>
            <ThemePicker />
          </>
        }
      />
      <div className="zv-cp-layout">
        <CPSidebar page={page} onNavigate={setPage} />
        <main className="zv-cp-content">
          {entry.zv ? (
            <div className="cp-page">
              <ActivePage />
            </div>
          ) : (
            <ActivePage />
          )}
        </main>
      </div>
      <StatusBar
        left={<span>Investiture Control Panel</span>}
        right={<span>Zero Vector Design</span>}
      />
      <QuickCapture
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onCreated={() => setPage("board")}
      />
    </AppShell>
  );
}
