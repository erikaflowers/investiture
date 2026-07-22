import { describe, it, expect } from "vitest";
import { validationError, makeLine, parseLog, recency } from "./telemetry.js";

const line = (ts, event, payload = {}, actor = "agent:heavy") =>
  makeLine({ event, actor, payload }, ts);

describe("validationError", () => {
  it("accepts the six contract event types with valid actors", () => {
    expect(
      validationError({ event: "session-start", actor: "agent:heavy", payload: {} })
    ).toBeNull();
    expect(validationError({ event: "file-updated", actor: "human", payload: { file: "CLAUDE.md" } })).toBeNull();
  });

  it("rejects unknown types, bad actors, missing payloads", () => {
    expect(validationError({ event: "deploy", actor: "human", payload: {} })).toMatch(/event/);
    expect(validationError({ event: "session-end", actor: "heavy", payload: {} })).toMatch(/actor/);
    expect(validationError({ event: "session-end", actor: "human" })).toMatch(/payload/);
  });
});

describe("parseLog", () => {
  it("returns newest first, skips malformed lines, filters by type", () => {
    const log =
      line("2026-07-20T10:00:00Z", "session-start") +
      "not json at all\n" +
      line("2026-07-21T10:00:00Z", "skill-invoked", { skill: "invest-repo-audit" }) +
      line("2026-07-22T10:00:00Z", "session-end", { agent: "heavy", summary: "done" });
    const events = parseLog(log);
    expect(events).toHaveLength(3);
    expect(events[0].event).toBe("session-end");
    expect(parseLog(log, { type: "skill-invoked" })).toHaveLength(1);
    expect(parseLog(log, { limit: 1 })[0].ts).toBe("2026-07-22T10:00:00Z");
  });
});

describe("recency", () => {
  it("derives the four recency fields per §5.4", () => {
    const log =
      line("2026-07-19T10:00:00Z", "audit-run", { skill: "invest-repo-audit", result: "pass" }) +
      line("2026-07-20T10:00:00Z", "audit-run", { skill: "invest-repo-audit", result: "issues" }) +
      line("2026-07-21T10:00:00Z", "context-catchup-written", { agent: "heavy" }) +
      line("2026-07-22T10:00:00Z", "session-end", { agent: "heavy", summary: "x" });
    expect(recency(log)).toEqual({
      lastAudit: "2026-07-20T10:00:00Z",
      lastStabilityPass: "2026-07-19T10:00:00Z",
      lastContextCatchup: "2026-07-21T10:00:00Z",
      lastSessionEnd: "2026-07-22T10:00:00Z",
    });
  });

  it("returns nulls on an empty log", () => {
    expect(recency("")).toEqual({
      lastAudit: null,
      lastStabilityPass: null,
      lastContextCatchup: null,
      lastSessionEnd: null,
    });
  });
});
