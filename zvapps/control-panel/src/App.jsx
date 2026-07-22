import { useEffect, useState } from "react";
import { AppShell, TopNav, ThemePicker, StatusBar } from "zv-ui";
import CPSidebar from "./components/CPSidebar.jsx";
import QuickCapture from "./components/QuickCapture.jsx";
import OnboardingWizard from "./components/OnboardingWizard.jsx";
import { ProjectProvider, useProject } from "./zv/useProject.jsx";
import ZeroGate from "./zv/ZeroGate.jsx";
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
  overview: { component: OverviewPage, zv: true, gate: "overview" },
  activity: { component: ActivityPage, zv: true, gate: "activity" },
  board: { component: BoardPage, zv: true, gate: "board" },
  editor: { component: EditorPage, zv: true, gate: "editor" },
  files: { component: FilesPage, zv: true, gate: "files" },
  doctrine: { component: DoctrinePage },
  vector: { component: VectorPage },
  design: { component: DesignPage },
  skills: { component: SkillsPage, zv: true },
  health: { component: HealthPage },
};

function Panel() {
  const [page, setPage] = useState("home");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const { project, onboarded } = useProject();
  const entry = PAGES[page] ?? PAGES.home;
  const ActivePage = entry.component;

  useEffect(() => {
    const open = () => setWizardOpen(true);
    window.addEventListener("zv:open-wizard", open);
    return () => window.removeEventListener("zv:open-wizard", open);
  }, []);

  const body = entry.gate ? (
    <ZeroGate page={entry.gate} onSetup={() => setWizardOpen(true)}>
      <ActivePage />
    </ZeroGate>
  ) : (
    <ActivePage />
  );

  return (
    <AppShell>
      <TopNav
        logo="◧"
        brand={onboarded && project?.name ? project.name : "Investiture"}
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
          {entry.zv ? <div className="cp-page">{body}</div> : body}
        </main>
      </div>
      <StatusBar
        left={<span>{onboarded && project?.name ? `${project.name} — sidecar` : "Investiture Control Panel"}</span>}
        right={<span>Zero Vector Design</span>}
      />
      <QuickCapture
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onCreated={() => setPage("board")}
      />
      <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </AppShell>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <Panel />
    </ProjectProvider>
  );
}
