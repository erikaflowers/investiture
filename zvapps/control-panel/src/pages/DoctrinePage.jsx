import { Panel } from "zv-ui";

export default function DoctrinePage() {
  return (
    <Panel title="Doctrine">
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        View and edit your project's doctrine files: <strong>VECTOR.md</strong>, <strong>ARCHITECTURE.md</strong>, and the subordinate files in <code>/vector/</code> (schemas, research, decisions).
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "12px" }}>
        Coming soon. This page will read markdown files from the repo root and display them with section navigation.
      </p>
    </Panel>
  );
}
