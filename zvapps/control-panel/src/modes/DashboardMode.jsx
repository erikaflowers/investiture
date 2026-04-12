import Dashboard from "../components/Dashboard.jsx";

export default function DashboardMode({ vector, vectorMd, design, designMd }) {
  return <Dashboard vector={vector} vectorMd={vectorMd} design={design} designRaw={designMd} />;
}
