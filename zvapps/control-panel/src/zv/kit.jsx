// ZV-accent primitives for the sidecar pages (Addendum A, applied
// lightly per Samantha's ruling): theme variables for surfaces, --zv-*
// accents for punctuation. No raw color in components, no radius.

import { useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null); // {text, error}
  const timer = useRef(null);
  const showToast = (text, { error = false } = {}) => {
    clearTimeout(timer.current);
    setToast({ text, error });
    timer.current = setTimeout(() => setToast(null), 3200);
  };
  return { toast, showToast };
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`cp-toast${toast.error ? " is-error" : ""}`}>
      {toast.text}
    </div>
  );
}

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
