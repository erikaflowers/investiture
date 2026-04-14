const SECTION_KEYS = {
  visualTheme: ["visual theme", "theme & atmosphere", "atmosphere"],
  colors: ["color palette", "color system", "colors"],
  typography: ["typography"],
  components: ["component"],
  layout: ["layout"],
  elevation: ["depth", "elevation"],
  doDont: ["do's and don'ts", "dos and don'ts", "do and don't"],
  responsive: ["responsive"],
  agentGuide: ["agent prompt", "agent guide"],
};

function stripNumber(heading) {
  return heading.replace(/^\d+\.\s*/, "").trim();
}

function matchSectionKey(heading) {
  const normalized = stripNumber(heading).toLowerCase();
  for (const [key, aliases] of Object.entries(SECTION_KEYS)) {
    if (aliases.some((alias) => normalized.includes(alias))) return key;
  }
  return null;
}

function splitTopLevelSections(markdown) {
  const lines = markdown.split("\n");
  const sections = {};
  let currentKey = null;
  let currentName = null;
  let buffer = [];

  const flush = () => {
    if (currentKey && !sections[currentKey]) {
      sections[currentKey] = { name: currentName, body: buffer.join("\n") };
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match && !line.startsWith("###")) {
      flush();
      const heading = match[1].trim();
      currentKey = matchSectionKey(heading);
      currentName = stripNumber(heading);
    } else if (currentKey) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function splitSubsections(body) {
  const lines = body.split("\n");
  const subs = [];
  let currentName = null;
  let buffer = [];

  const flush = () => {
    if (currentName !== null) {
      subs.push({ name: currentName, body: buffer.join("\n") });
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(/^###\s+(.+)$/);
    if (match) {
      flush();
      currentName = match[1].trim();
    } else if (currentName !== null) {
      buffer.push(line);
    }
  }
  flush();
  return subs;
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled Design System";
}

function parseVisualTheme(body) {
  if (!body) return { prose: "", keyCharacteristics: [] };
  const keyIdx = body.search(/\*\*Key Characteristics:?\*\*/i);
  let prose = body;
  let bulletBlock = "";
  if (keyIdx >= 0) {
    prose = body.slice(0, keyIdx);
    bulletBlock = body.slice(keyIdx);
  }
  const proseClean = prose
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .join("\n")
    .trim();
  const keyCharacteristics = [];
  if (bulletBlock) {
    for (const line of bulletBlock.split("\n")) {
      const m = line.match(/^[-*]\s+(.+)$/);
      if (m) keyCharacteristics.push(m[1].trim());
    }
  }
  return { prose: proseClean, keyCharacteristics };
}

const COLOR_BULLET = /^[-*]\s+\*\*(.+?)\*\*\s*\(\s*`([^`]+)`(?:\s*\/\s*`[^`]+`)*\s*\)\s*:\s*(.+)$/;

function parseColorBullet(line) {
  const m = line.match(COLOR_BULLET);
  if (!m) return null;
  return { name: m[1].trim(), value: m[2].trim(), role: m[3].trim() };
}

function parseColors(body) {
  if (!body) return { groups: [], all: [] };
  const subs = splitSubsections(body);
  const groups = [];
  const all = [];
  for (const sub of subs) {
    const items = [];
    for (const line of sub.body.split("\n")) {
      const parsed = parseColorBullet(line.trim());
      if (parsed) {
        items.push(parsed);
        all.push({ ...parsed, group: sub.name });
      }
    }
    if (items.length) groups.push({ name: sub.name, items });
  }
  if (all.length === 0) {
    for (const line of body.split("\n")) {
      const parsed = parseColorBullet(line.trim());
      if (parsed) {
        all.push({ ...parsed, group: "Colors" });
      }
    }
    if (all.length) groups.push({ name: "Colors", items: all });
  }
  return { groups, all };
}

function parseMarkdownTable(body) {
  const lines = body.split("\n").map((l) => l.trim());
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("|") && lines[i + 1] && /^\|[\s\-:|]+\|$/.test(lines[i + 1])) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  const headers = lines[start]
    .split("|")
    .slice(1, -1)
    .map((h) => h.trim());
  const rows = [];
  for (let i = start + 2; i < lines.length; i++) {
    if (!lines[i].startsWith("|")) break;
    const cells = lines[i]
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cells[idx];
      });
      rows.push(row);
    }
  }
  return { headers, rows };
}

function parseTypography(body) {
  if (!body) return { fonts: { primary: null, mono: null }, hierarchy: [], principles: [] };
  const subs = splitSubsections(body);
  let fonts = { primary: null, mono: null };
  let hierarchy = [];
  const principles = [];

  for (const sub of subs) {
    const name = sub.name.toLowerCase();
    if (name.includes("font family") || name.includes("fonts")) {
      for (const line of sub.body.split("\n")) {
        const primaryMatch = line.match(/[-*]\s+\*\*Primary\*\*:?\s*`?([^`,\n]+)`?/i);
        const monoMatch = line.match(/[-*]\s+\*\*Mono(?:space)?\*\*:?\s*`?([^`,\n]+)`?/i);
        if (primaryMatch) fonts.primary = primaryMatch[1].trim().replace(/[`,].*$/, "").trim();
        if (monoMatch) fonts.mono = monoMatch[1].trim().replace(/[`,].*$/, "").trim();
      }
    } else if (name.includes("hierarchy") || name.includes("scale")) {
      const table = parseMarkdownTable(sub.body);
      if (table) hierarchy = table.rows;
    } else if (name.includes("principle")) {
      for (const line of sub.body.split("\n")) {
        const m = line.match(/^[-*]\s+(.+)$/);
        if (m) principles.push(m[1].trim());
      }
    }
  }

  if (hierarchy.length === 0) {
    const table = parseMarkdownTable(body);
    if (table) hierarchy = table.rows;
  }

  return { fonts, hierarchy, principles };
}

const SPEC_BULLET = /^[-*]\s+\**([^*:]+?)\**:\s*(.+)$/;

function parseComponents(body) {
  if (!body) return { groups: [] };
  const subs = splitSubsections(body);
  const groups = [];

  for (const sub of subs) {
    const variants = [];
    let currentVariant = null;
    const lines = sub.body.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const variantHeader = line.match(/^\*\*([^*]+?)\*\*$/);
      if (variantHeader) {
        if (currentVariant && Object.keys(currentVariant.specs).length) variants.push(currentVariant);
        currentVariant = { name: variantHeader[1].trim(), specs: {} };
        continue;
      }
      if (currentVariant) {
        const specMatch = line.match(SPEC_BULLET);
        if (specMatch) {
          const key = specMatch[1].trim().replace(/\*+/g, "");
          let value = specMatch[2].trim();
          value = value.replace(/`/g, "");
          currentVariant.specs[key] = value;
        }
      }
    }
    if (currentVariant && Object.keys(currentVariant.specs).length) variants.push(currentVariant);

    if (variants.length === 0) {
      const flatSpecs = {};
      for (const rawLine of lines) {
        const line = rawLine.trim();
        const specMatch = line.match(SPEC_BULLET);
        if (specMatch) {
          flatSpecs[specMatch[1].trim().replace(/\*+/g, "")] = specMatch[2].trim().replace(/`/g, "");
        }
      }
      if (Object.keys(flatSpecs).length) variants.push({ name: sub.name, specs: flatSpecs });
    }

    if (variants.length) groups.push({ name: sub.name, variants });
  }
  return { groups };
}

function parseDoDont(body) {
  if (!body) return { do: [], dont: [] };
  const subs = splitSubsections(body);
  const result = { do: [], dont: [] };
  for (const sub of subs) {
    const isDont = /don'?t/i.test(sub.name);
    const target = isDont ? result.dont : result.do;
    for (const line of sub.body.split("\n")) {
      const m = line.match(/^[-*]\s+(.+)$/);
      if (m) target.push(m[1].trim());
    }
  }
  return result;
}

export function parseDesignMd(markdown) {
  if (typeof markdown !== "string" || !markdown.trim()) {
    return null;
  }
  const sections = splitTopLevelSections(markdown);
  return {
    title: extractTitle(markdown),
    visualTheme: parseVisualTheme(sections.visualTheme?.body || ""),
    colors: parseColors(sections.colors?.body || ""),
    typography: parseTypography(sections.typography?.body || ""),
    components: parseComponents(sections.components?.body || ""),
    doDont: parseDoDont(sections.doDont?.body || ""),
    raw: {
      layout: sections.layout?.body || "",
      elevation: sections.elevation?.body || "",
      responsive: sections.responsive?.body || "",
      agentGuide: sections.agentGuide?.body || "",
    },
  };
}
