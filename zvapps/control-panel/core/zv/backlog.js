// Backlog item logic (ZV-CONTRACT.md §1).

import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.js";

export const STATUSES = ["proposed", "queued", "in-progress", "done", "parked"];
export const PRIORITIES = ["p0", "p1", "p2", "p3"];
export const ACTOR_RE = /^(human|agent:[a-z0-9-]+)$/;
export const ID_RE = /^BL-\d{4}$/;

const KEY_ORDER = [
  "id",
  "title",
  "status",
  "priority",
  "created-by",
  "owner",
  "created-date",
  "updated-date",
];

export function slugify(title) {
  return (
    String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/g, "") || "item"
  );
}

// Highest existing number + 1, from any mix of filenames and id fields.
export function nextId(existingIds) {
  let max = 0;
  for (const id of existingIds) {
    const m = /^BL-(\d{4})$/.exec(id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `BL-${String(max + 1).padStart(4, "0")}`;
}

export function parseItem(markdown, filePath = null) {
  const { data, body } = parseFrontmatter(markdown);
  if (!data || !ID_RE.test(data.id ?? "")) {
    return { path: filePath, invalid: true };
  }
  return { ...data, path: filePath, body };
}

export function serializeItem(fields, body) {
  const data = {};
  for (const key of KEY_ORDER) {
    if (fields[key] !== undefined && fields[key] !== "") data[key] = fields[key];
  }
  return serializeFrontmatter(data, body ?? "", KEY_ORDER);
}

export function validationError(fields, { creating = false } = {}) {
  if (creating) {
    if (!fields.title || !String(fields.title).trim()) {
      return "title is required";
    }
    if (!ACTOR_RE.test(fields["created-by"] ?? "")) {
      return 'created-by must be "human" or "agent:<name>"';
    }
  }
  if (fields.status !== undefined && !STATUSES.includes(fields.status)) {
    return `status must be one of: ${STATUSES.join(", ")}`;
  }
  if (fields.priority !== undefined && !PRIORITIES.includes(fields.priority)) {
    return `priority must be one of: ${PRIORITIES.join(", ")}`;
  }
  return null;
}

export const IMMUTABLE_FIELDS = ["id", "created-by", "created-date"];
