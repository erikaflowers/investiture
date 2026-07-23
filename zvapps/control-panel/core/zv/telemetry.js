// Telemetry event contract (ZV-CONTRACT.md §5). This schema is PUBLIC API —
// Telltale consumes the JSONL log. Add, never remove or rename.

import { ACTOR_RE } from "./backlog.js";

export const EVENT_TYPES = [
  "session-start",
  "session-end",
  "skill-invoked",
  "file-updated",
  "audit-run",
  "context-catchup-written",
];

// Events the HTTP POST endpoint accepts. `audit-run` is EXCLUDED (Renic R2):
// it drives recency (lastAudit / lastStabilityPass), and the open,
// unauthenticated endpoint let any caller self-certify a fresh clean audit as
// any actor — the exact failure this product exists to prevent. audit-run
// remains a valid log event, but it must be written to events.jsonl directly
// by audit tooling that actually ran, not asserted over HTTP. The durable fix
// (derive recency from artifacts, not claims) is tracked separately.
export const HTTP_POSTABLE_EVENTS = EVENT_TYPES.filter((e) => e !== "audit-run");

// Returns an error string, or null if the event is valid. `scope` is "log"
// (any contract event, e.g. a direct file append) or "http" (the restricted
// set the POST endpoint accepts).
export function validationError(event, { scope = "log" } = {}) {
  if (!event || typeof event !== "object") return "event must be an object";
  const allowed = scope === "http" ? HTTP_POSTABLE_EVENTS : EVENT_TYPES;
  if (!allowed.includes(event.event)) {
    if (scope === "http" && EVENT_TYPES.includes(event.event)) {
      return `event '${event.event}' cannot be posted over HTTP (it drives recency and would be self-certified); write it to the telemetry log directly`;
    }
    return `event must be one of: ${allowed.join(", ")}`;
  }
  if (!ACTOR_RE.test(event.actor ?? "")) {
    return 'actor must be "human" or "agent:<name>"';
  }
  if (event.payload === undefined || typeof event.payload !== "object" || event.payload === null) {
    return "payload must be an object (may be empty)";
  }
  return null;
}

export function makeLine(event, ts) {
  return (
    JSON.stringify({
      ts,
      event: event.event,
      actor: event.actor,
      payload: event.payload,
    }) + "\n"
  );
}

// Parses the log, newest first. Malformed lines are skipped, never fatal (§5.5).
export function parseLog(text, { limit = 100, type = null } = {}) {
  const events = [];
  for (const line of (text ?? "").split("\n")) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line);
      if (type && e.event !== type) continue;
      events.push(e);
    } catch {
      continue;
    }
  }
  events.reverse();
  return events.slice(0, limit);
}

// Derived recency (§5.4) from a full oldest-first log text.
export function recency(text) {
  let lastAudit = null;
  let lastStabilityPass = null;
  let lastContextCatchup = null;
  let lastSessionEnd = null;
  for (const e of parseLog(text, { limit: Infinity })) {
    // parseLog returns newest first, so keep the first match of each.
    if (e.event === "audit-run" && lastAudit === null) lastAudit = e.ts;
    if (e.event === "audit-run" && e.payload?.result === "pass" && lastStabilityPass === null) {
      lastStabilityPass = e.ts;
    }
    if (e.event === "context-catchup-written" && lastContextCatchup === null) {
      lastContextCatchup = e.ts;
    }
    if (e.event === "session-end" && lastSessionEnd === null) lastSessionEnd = e.ts;
  }
  return { lastAudit, lastStabilityPass, lastContextCatchup, lastSessionEnd };
}
