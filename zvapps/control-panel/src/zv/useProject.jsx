import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet } from "./api.js";

// Single source of project state for the panel (GET /api/zv/state).
// Zero state per ZV-CONTRACT.md §6.2: PROJECT.md absent or onboarded
// not true — pages consult `onboarded` and render explainers instead
// of empty views.

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    return apiGet("/api/zv/state")
      .then((s) => {
        setState(s);
        setError(null);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("zv:project-changed", refresh);
    window.addEventListener("zv:backlog-changed", refresh);
    return () => {
      window.removeEventListener("zv:project-changed", refresh);
      window.removeEventListener("zv:backlog-changed", refresh);
    };
  }, [refresh]);

  return (
    <ProjectContext.Provider
      value={{
        loading: state === null && !error,
        error,
        project: state?.project ?? null,
        recency: state?.recency ?? null,
        backlogCounts: state?.backlogCounts ?? null,
        onboarded: state?.project?.onboarded === true,
        refresh,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject requires <ProjectProvider>");
  return ctx;
}
