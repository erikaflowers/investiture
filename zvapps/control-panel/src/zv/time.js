// Recency → staleness. Thresholds: fresh < 7 days, aging < 30, else stale.
// null (never happened) is stale.

const DAY = 24 * 60 * 60 * 1000;

export function staleness(iso) {
  if (!iso) return "stale";
  const age = Date.now() - new Date(iso).getTime();
  if (age < 7 * DAY) return "fresh";
  if (age < 30 * DAY) return "aging";
  return "stale";
}

export function relative(iso) {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function absolute(iso) {
  if (!iso) return "—";
  return iso.replace("T", " ").replace(/(:\d\d)(\.\d+)?Z$/, "$1Z");
}
