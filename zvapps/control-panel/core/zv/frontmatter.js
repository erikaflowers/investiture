// Flat YAML front-matter parser/serializer for ZV markdown files.
// Contract (ZV-CONTRACT.md §1.2, §6.1): values are scalars only — strings,
// booleans, and date strings. No nesting, no arrays, no yaml library.

export function parseFrontmatter(markdown) {
  const text = markdown ?? "";
  if (!text.startsWith("---")) return { data: null, body: text };

  const lines = text.split("\n");
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { data: null, body: text };

  const data = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    } else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    }
    if (key) data[key] = value;
  }

  const body = lines.slice(end + 1).join("\n").replace(/^\n/, "");
  return { data, body };
}

export class FrontmatterError extends Error {
  constructor(message) {
    super(message);
    this.name = "FrontmatterError";
    this.code = "INVALID_INPUT";
  }
}

// Flat front-matter values are single-line scalars. A newline or control
// character cannot be represented safely (the parser is a line scanner that
// stops at a bare `---`), so quoting is not enough — a value with a newline
// could smuggle a `---` terminator or a forged `key: value` line into the
// document. Refuse rather than escape. Callers validate at the HTTP layer
// too (backlog.validationError); this is the last line of defense.
function serializeValue(value) {
  if (typeof value === "boolean") return String(value);
  const str = String(value);

  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(str)) {
    throw new FrontmatterError("front-matter value contains a control character or newline");
  }
  if (str.includes("---")) {
    throw new FrontmatterError("front-matter value contains a '---' sequence");
  }

  // Quote when the value could be misparsed on the way back in.
  if (
    str === "" ||
    str === "true" ||
    str === "false" ||
    str.includes(":") ||
    str.startsWith("'") ||
    str.startsWith('"') ||
    str.startsWith("#") ||
    str !== str.trim()
  ) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

// keyOrder pins field order so files diff cleanly; unknown keys append after.
export function serializeFrontmatter(data, body, keyOrder = []) {
  const keys = [
    ...keyOrder.filter((k) => k in data),
    ...Object.keys(data).filter((k) => !keyOrder.includes(k)),
  ];
  const fm = keys.map((k) => `${k}: ${serializeValue(data[k])}`).join("\n");
  const trimmedBody = (body ?? "").replace(/^\n+/, "");
  return `---\n${fm}\n---\n\n${trimmedBody}`;
}
