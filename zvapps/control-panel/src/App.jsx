import { useState } from "react";
import { AppShell, TopNav, ThemePicker, StatusBar } from "zv-ui";
import CPSidebar from "./components/CPSidebar.jsx";
import HomePage from "./pages/HomePage.jsx";
import BoxPage from "./pages/BoxPage.jsx";
import DoctrinePage from "./pages/DoctrinePage.jsx";
import DesignPage from "./pages/DesignPage.jsx";
import SkillsPage from "./pages/SkillsPage.jsx";
import VectorPage from "./pages/VectorPage.jsx";
import HealthPage from "./pages/HealthPage.jsx";

const PAGES = {
  home: HomePage,
  box: BoxPage,
  doctrine: DoctrinePage,
  vector: VectorPage,
  design: DesignPage,
  skills: SkillsPage,
  health: HealthPage,
};

export default function App() {
  const [page, setPage] = useState("home");

  const ActivePage = PAGES[page] || BoxPage;

  return (
    <AppShell>
      <TopNav logo="◧" brand="Investiture" right={<ThemePicker />} />
      <div className="zv-cp-layout">
        <CPSidebar page={page} onNavigate={setPage} />
        <main className="zv-cp-content">
          <ActivePage />
        </main>
      </div>
      <StatusBar
        left={<span>Investiture Control Panel</span>}
        right={<span>Zero Vector Design</span>}
      />
    </AppShell>
  );
}
