// Fresh ZV-grammar primitives (Addendum A, Step 3). Consume semantic
// tokens only — never raw color, never radius, never glow.

export function SystemLabel({ children }) {
  return <div className="cp-syslabel">{children}</div>;
}

export function StalenessSquare({ level }) {
  return <span className={`cp-square is-${level}`} aria-label={level} />;
}

export function ActorChip({ actor }) {
  const isAgent = typeof actor === "string" && actor.startsWith("agent:");
  return (
    <span className={`cp-actor${isAgent ? " is-agent" : ""}`}>
      {isAgent ? actor.slice(6) : actor}
    </span>
  );
}

export function EmptyState({ label, children }) {
  return (
    <div className="cp-empty">
      <SystemLabel>{label}</SystemLabel>
      <p>{children}</p>
    </div>
  );
}
