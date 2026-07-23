import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../../zv/api.js";
import { categorizeBacklog } from "../../../core/zv/backlog.js";
import { SystemLabel, ActorChip, EmptyState, Toast, useToast } from "../../zv/kit.jsx";

// Kanban as a view, not a database (brief, Decision 2): columns render
// from front-matter `status`; moving a card PUTs the file. Drag or the
// per-card select — both write through /api/zv/backlog/:id.
//
// Partitioning (which card goes to which column, and which are invalid)
// is categorizeBacklog in core — a pure, tested function. A card with an
// off-enum status lands in the invalid tray, never vanishes (§1.3).

const COLUMNS = ["proposed", "queued", "in-progress", "done", "parked"];

export default function BoardPage() {
  const [items, setItems] = useState(null);
  const [invalid, setInvalid] = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const [error, setError] = useState(null);
  const { toast, showToast } = useToast();

  const load = useCallback(() => {
    apiGet("/api/zv/backlog")
      .then((d) => {
        const { invalid } = categorizeBacklog(d.items);
        // Board columns still filter valid items by status; the tray holds
        // both unparseable AND off-enum-status cards so none disappear.
        const invalidPaths = new Set(invalid.map((it) => it.path));
        setItems(d.items.filter((it) => !invalidPaths.has(it.path)));
        setInvalid(invalid);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("zv:backlog-changed", load);
    return () => window.removeEventListener("zv:backlog-changed", load);
  }, [load]);

  async function moveCard(id, status) {
    const prev = items;
    setItems(items.map((it) => (it.id === id ? { ...it, status } : it)));
    try {
      const res = await fetch(`/api/zv/backlog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      showToast(`${id} → ${status}`);
    } catch (e) {
      setItems(prev);
      showToast(`Move failed: ${e.message}`, { error: true });
    }
  }

  if (error) return <EmptyState label="error">{error}</EmptyState>;
  if (!items) return null;

  return (
    <>
      <SystemLabel>backlog board</SystemLabel>
      <h1 className="cp-page-title">Board</h1>

      {items.length === 0 && invalid.length === 0 ? (
        <EmptyState label="empty board">
          Nothing on the board yet. Capture an item with the + Backlog
          button up top — cards are markdown files in zvapps/backlog/,
          and this board is just a view of their front-matter.
        </EmptyState>
      ) : (
        <div className="cp-board">
          {COLUMNS.map((col) => {
            const colItems = items.filter((it) => it.status === col);
            return (
              <div
                key={col}
                className={`cp-col${dragOver === col ? " is-drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  const id = e.dataTransfer.getData("text/zv-backlog-id");
                  const item = items.find((it) => it.id === id);
                  if (item && item.status !== col) moveCard(id, col);
                }}
              >
                <div className="cp-col-header">
                  <SystemLabel>{col}</SystemLabel>
                  <span className="cp-col-count">{colItems.length}</span>
                </div>
                {colItems.map((it) => {
                  const isAgent = (it["created-by"] ?? "").startsWith("agent:");
                  return (
                    <div
                      key={it.id}
                      className={`cp-card-item${isAgent ? " is-agent-card" : ""}`}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/zv-backlog-id", it.id)
                      }
                    >
                      <div className="cp-card-title">{it.title}</div>
                      <div className="cp-card-meta">
                        <span>{it.id}</span>
                        <span className="cp-card-priority">{it.priority}</span>
                        {it.owner && <span>@{it.owner}</span>}
                        <ActorChip actor={it["created-by"]} />
                      </div>
                      <div className="cp-card-move">
                        <select
                          className="cp-select"
                          value={it.status}
                          aria-label={`Move ${it.id}`}
                          onChange={(e) => moveCard(it.id, e.target.value)}
                        >
                          {COLUMNS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {invalid.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <SystemLabel>invalid items — never hidden, never coerced (§1.3)</SystemLabel>
          {invalid.map((it) => {
            // An off-enum card has a valid id, so it can be repaired in place
            // by writing a valid status. An unparseable card (no id) can only
            // be fixed by hand-editing the file.
            const repairable = !it.invalid && it.id;
            return (
              <div
                key={it.path}
                className="cp-feed-row"
                style={{ border: "1px solid var(--border)", marginTop: "8px", gridTemplateColumns: "1fr auto auto" }}
              >
                <span className="cp-feed-detail">
                  {it.title ? `${it.id} — ${it.title}` : it.path}
                </span>
                <span className="cp-feed-ts">{it.reason}</span>
                {repairable ? (
                  <select
                    className="cp-select"
                    defaultValue=""
                    aria-label={`Repair ${it.id}`}
                    onChange={(e) => e.target.value && moveCard(it.id, e.target.value)}
                  >
                    <option value="" disabled>
                      set status…
                    </option>
                    {COLUMNS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="cp-feed-ts">fix the file by hand</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Toast toast={toast} />
    </>
  );
}
