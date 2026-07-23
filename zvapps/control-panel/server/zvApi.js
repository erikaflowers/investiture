// ZV write API (ZV-CONTRACT.md §4). Every disk touch goes through the
// territory guard; every successful write emits a file-updated event
// server-side so clients and agents never double-log.

import fs from "fs";
import path from "path";
import { createGuard, DOCTRINE_FILES, OutOfBoundsError } from "../core/zv/allowlist.js";
import { parseFrontmatter, serializeFrontmatter, FrontmatterError } from "../core/zv/frontmatter.js";
import { safeWriteFileSync, safeAppendFileSync, safeCopyFileSync } from "../core/zv/safeWrite.js";
import * as backlog from "../core/zv/backlog.js";
import * as prd from "../core/zv/prd.js";
import * as telemetry from "../core/zv/telemetry.js";

const PROJECT_KEY_ORDER = ["name", "description", "onboarded", "onboarded-date"];

export function zvApiPlugin() {
  const repoRoot = path.resolve(process.cwd(), "../..");
  const guard = createGuard(repoRoot);

  const rel = (p) => path.relative(guard.realRoot, p);
  const backlogDir = () => guard.guardPath("zvapps/backlog");
  const prdPath = () => guard.guardPath("zvapps/PRD.md");
  const projectPath = () => guard.guardPath("zvapps/PROJECT.md");
  const logPath = () => guard.guardPath("zvapps/telemetry/events.jsonl");
  const historyRoot = () => guard.guardPath("zvapps/.zv-history");

  const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const today = () => nowIso().slice(0, 10);

  function emitEvent(event, actor, payload) {
    const file = logPath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    safeAppendFileSync(file, telemetry.makeLine({ event, actor, payload }, nowIso()));
  }

  function readLog() {
    const file = logPath();
    return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
  }

  // Snapshot an existing doctrine file; returns snapshot id or null (§4.6).
  function snapshotDoctrine(name) {
    const filePath = guard.guardDoctrine(name);
    if (!fs.existsSync(filePath)) return null;
    const dir = guard.guardPath(path.join(historyRoot(), name));
    fs.mkdirSync(dir, { recursive: true });
    const base = nowIso().replace(/[-:]/g, "");
    let id = base;
    for (let n = 2; fs.existsSync(path.join(dir, `${id}.md`)); n++) {
      id = `${base}-${n}`;
    }
    safeCopyFileSync(filePath, guard.guardPath(path.join(dir, `${id}.md`)));
    return id;
  }

  function listBacklogItems() {
    const dir = backlogDir();
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => {
        const p = guard.guardPath(path.join(dir, f));
        return backlog.parseItem(fs.readFileSync(p, "utf-8"), rel(p));
      });
  }

  function findItem(id) {
    return listBacklogItems().find((it) => !it.invalid && it.id === id) ?? null;
  }

  function readProject() {
    const p = projectPath();
    if (!fs.existsSync(p)) return { data: null, body: "" };
    return parseFrontmatter(fs.readFileSync(p, "utf-8"));
  }

  // --- HTTP plumbing ---

  function sendJson(res, status, obj) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(obj));
  }
  const sendErr = (res, status, code, message) =>
    sendJson(res, status, { error: { code, message } });

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (c) => {
        body += c;
      });
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error("Body is not valid JSON"));
        }
      });
      req.on("error", reject);
    });
  }

  // --- Route handlers ---

  function handleState(res) {
    const { data } = readProject();
    const counts = Object.fromEntries(backlog.STATUSES.map((s) => [s, 0]));
    for (const it of listBacklogItems()) {
      if (!it.invalid && it.status in counts) counts[it.status]++;
    }
    sendJson(res, 200, {
      project: {
        name: data?.name ?? null,
        description: data?.description ?? null,
        onboarded: data?.onboarded === true,
        onboardedDate: data?.["onboarded-date"] ?? null,
      },
      recency: telemetry.recency(readLog()),
      backlogCounts: counts,
    });
  }

  function handleBacklogList(res) {
    const items = listBacklogItems().map((it) => {
      if (it.invalid) return { path: it.path, invalid: true };
      const { body, ...front } = it;
      return front;
    });
    sendJson(res, 200, { items });
  }

  async function handleBacklogCreate(req, res) {
    const b = await readBody(req);
    const fields = {
      title: b.title,
      "created-by": b.createdBy,
      status: "proposed",
      priority: b.priority ?? "p2",
    };
    const err = backlog.validationError(fields, { creating: true });
    if (err) return sendErr(res, 400, "INVALID_INPUT", err);

    const dir = backlogDir();
    fs.mkdirSync(dir, { recursive: true });
    const id = backlog.nextId(listBacklogItems().map((it) => it.id ?? ""));
    const filePath = guard.guardPath(
      path.join(dir, `${id}-${backlog.slugify(b.title)}.md`)
    );
    const content = backlog.serializeItem(
      {
        id,
        title: b.title,
        status: "proposed",
        priority: fields.priority,
        "created-by": b.createdBy,
        owner: b.owner,
        "created-date": today(),
        "updated-date": today(),
      },
      b.body
    );
    safeWriteFileSync(filePath, content);
    emitEvent("file-updated", b.createdBy, { file: rel(filePath), via: "api", snapshot: null });
    sendJson(res, 201, { id, path: rel(filePath) });
  }

  async function handleBacklogUpdate(req, res, id) {
    const item = findItem(id);
    if (!item) return sendErr(res, 404, "NOT_FOUND", `No backlog item ${id}`);
    const b = await readBody(req);

    for (const f of backlog.IMMUTABLE_FIELDS) {
      const camel = f.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (b[f] !== undefined || b[camel] !== undefined) {
        return sendErr(res, 400, "INVALID_INPUT", `${f} is immutable`);
      }
    }
    const err = backlog.validationError(b);
    if (err) return sendErr(res, 400, "INVALID_INPUT", err);

    const { body: itemBody, path: itemRel, invalid, ...front } = item;
    const updated = {
      ...front,
      ...(b.title !== undefined && { title: b.title }),
      ...(b.status !== undefined && { status: b.status }),
      ...(b.priority !== undefined && { priority: b.priority }),
      ...(b.owner !== undefined && { owner: b.owner }),
      "updated-date": today(),
    };
    const filePath = guard.guardPath(itemRel);
    safeWriteFileSync(
      filePath,
      backlog.serializeItem(updated, b.body !== undefined ? b.body : itemBody));
    emitEvent("file-updated", "human", { file: itemRel, via: "api", snapshot: null });
    sendJson(res, 200, { id, path: itemRel });
  }

  function handleDoctrineList(res) {
    const files = DOCTRINE_FILES.map((name) => {
      const p = guard.guardDoctrine(name);
      const exists = fs.existsSync(p);
      const snapDir = path.join(historyRoot(), name);
      const snapshots = fs.existsSync(snapDir)
        ? fs.readdirSync(snapDir).filter((f) => f.endsWith(".md")).length
        : 0;
      const stat = exists ? fs.statSync(p) : null;
      return {
        name,
        exists,
        mtime: stat ? stat.mtime.toISOString() : null,
        size: stat ? stat.size : null,
        snapshots,
      };
    });
    sendJson(res, 200, { files });
  }

  async function handleDoctrineWrite(req, res, name) {
    const filePath = guard.guardDoctrine(name);
    const b = await readBody(req);
    if (typeof b.content !== "string") {
      return sendErr(res, 400, "INVALID_INPUT", "content (string) is required");
    }
    const snapshot = snapshotDoctrine(name);
    safeWriteFileSync(filePath, b.content);
    emitEvent("file-updated", "human", { file: name, via: "api", snapshot });
    sendJson(res, 200, { name, snapshot });
  }

  async function handlePrdWrite(req, res) {
    const b = await readBody(req);
    if (typeof b.content !== "string") {
      return sendErr(res, 400, "INVALID_INPUT", "content (string) is required");
    }
    const missing = prd.missingSections(b.content);
    if (missing.length) {
      return sendErr(res, 400, "INVALID_INPUT", `PRD missing required sections: ${missing.join(", ")}`);
    }
    safeWriteFileSync(prdPath(), b.content);
    emitEvent("file-updated", "human", { file: "zvapps/PRD.md", via: "api", snapshot: null });
    sendJson(res, 200, { path: "zvapps/PRD.md" });
  }

  async function handlePrdAppend(req, res) {
    const b = await readBody(req);
    if (!["changelog", "open-questions"].includes(b.section)) {
      return sendErr(res, 400, "INVALID_INPUT", 'section must be "changelog" or "open-questions"');
    }
    if (!b.entry || !String(b.entry).trim()) {
      return sendErr(res, 400, "INVALID_INPUT", "entry is required");
    }
    if (!backlog.ACTOR_RE.test(b.actor ?? "")) {
      return sendErr(res, 400, "INVALID_INPUT", 'actor must be "human" or "agent:<name>"');
    }
    const p = prdPath();
    if (!fs.existsSync(p)) {
      const { data } = readProject();
      safeWriteFileSync(p, prd.seedPrd(data?.name, data?.description, today()));
    }
    const updated = prd.appendToSection(fs.readFileSync(p, "utf-8"), b.section, today(), b.actor, String(b.entry).trim());
    if (updated === null) {
      return sendErr(res, 400, "INVALID_INPUT", `PRD has no "${b.section}" section to append to`);
    }
    safeWriteFileSync(p, updated);
    emitEvent("file-updated", b.actor, { file: "zvapps/PRD.md", via: "api", snapshot: null });
    sendJson(res, 200, { path: "zvapps/PRD.md", section: b.section });
  }

  function listSnapshots(name) {
    const dir = path.join(historyRoot(), name);
    if (!fs.existsSync(dir)) return [];
    return (
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const p = guard.guardPath(path.join(dir, f));
          const stat = fs.statSync(p);
          return { id: f.replace(/\.md$/, ""), ts: stat.mtime.toISOString(), size: stat.size };
        })
        // Sort by mtime, not filename: same-second collision ids ("...Z-2")
        // sort lexically BEFORE their base ("...Z.md") and would lie about
        // which snapshot is newest.
        .sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : a.id < b.id ? 1 : -1))
    );
  }

  async function handleRestore(req, res) {
    const b = await readBody(req);
    const filePath = guard.guardDoctrine(b.file ?? "");
    const snapId = String(b.snapshot ?? "");
    if (!/^[0-9TZ-]+$/.test(snapId) || !snapId) {
      return sendErr(res, 400, "INVALID_INPUT", "snapshot id is malformed");
    }
    const snapPath = guard.guardPath(path.join(historyRoot(), b.file, `${snapId}.md`));
    if (!fs.existsSync(snapPath)) {
      return sendErr(res, 404, "NOT_FOUND", `No snapshot ${snapId} for ${b.file}`);
    }
    const preRestoreSnapshot = snapshotDoctrine(b.file);
    safeCopyFileSync(snapPath, filePath);
    emitEvent("file-updated", "human", { file: b.file, via: "api", snapshot: preRestoreSnapshot });
    sendJson(res, 200, { file: b.file, restoredFrom: snapId, preRestoreSnapshot });
  }

  async function handleTelemetryPost(req, res) {
    const b = await readBody(req);
    const err = telemetry.validationError(b);
    if (err) return sendErr(res, 400, "INVALID_INPUT", err);
    emitEvent(b.event, b.actor, b.payload);
    sendJson(res, 201, { ok: true });
  }

  async function handleOnboarding(req, res) {
    const b = await readBody(req);
    if (!b.name || !String(b.name).trim()) {
      return sendErr(res, 400, "INVALID_INPUT", "name is required");
    }
    // name and description land in PROJECT.md front-matter — same breakout
    // surface as backlog title/owner (R1). serializeValue also refuses these,
    // but reject here for a clean, specific 400.
    // eslint-disable-next-line no-control-regex
    const UNSAFE = /[\x00-\x1f\x7f]/;
    if (UNSAFE.test(String(b.name)) || UNSAFE.test(String(b.description ?? ""))) {
      return sendErr(res, 400, "INVALID_INPUT", "name and description must not contain newlines or control characters");
    }
    const description = String(b.description ?? "").trim();
    const written = [];

    // 1. PROJECT.md — update-or-create; onboarded-date is preserved on re-run.
    const { data: existing, body: projectBody } = readProject();
    const projectData = {
      name: String(b.name).trim(),
      description,
      onboarded: true,
      "onboarded-date": existing?.["onboarded-date"] ?? today(),
    };
    safeWriteFileSync(
      projectPath(),
      serializeFrontmatter(projectData, projectBody, PROJECT_KEY_ORDER));
    written.push("zvapps/PROJECT.md");

    // 2. Seed PRD only if absent — never overwrite (§6.4).
    if (!fs.existsSync(prdPath())) {
      safeWriteFileSync(prdPath(), prd.seedPrd(projectData.name, description, today()));
      written.push("zvapps/PRD.md");
    }

    // 3. Backlog dir only if absent.
    if (!fs.existsSync(backlogDir())) fs.mkdirSync(backlogDir(), { recursive: true });

    // 4. Telemetry dir + one file-updated per file actually written.
    for (const f of written) {
      emitEvent("file-updated", "human", { file: f, via: "api", snapshot: null });
    }
    sendJson(res, 200, { onboarded: true, written });
  }

  // --- Router ---

  return {
    name: "zv-api",
    configureServer(server) {
      server.middlewares.use("/api/zv", async (req, res) => {
        const url = new URL(req.url, "http://localhost");
        const seg = url.pathname.split("/").filter(Boolean);
        const method = req.method;

        try {
          if (seg[0] === "state" && seg.length === 1) {
            if (method !== "GET") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET only");
            return handleState(res);
          }

          if (seg[0] === "backlog" && seg.length === 1) {
            if (method === "GET") return handleBacklogList(res);
            if (method === "POST") return await handleBacklogCreate(req, res);
            return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET or POST");
          }
          if (seg[0] === "backlog" && seg.length === 2) {
            const id = seg[1];
            if (!backlog.ID_RE.test(id)) {
              return sendErr(res, 400, "INVALID_INPUT", "id must match BL-NNNN");
            }
            if (method === "GET") {
              const item = findItem(id);
              if (!item) return sendErr(res, 404, "NOT_FOUND", `No backlog item ${id}`);
              return sendJson(res, 200, item);
            }
            if (method === "PUT") return await handleBacklogUpdate(req, res, id);
            return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET or PUT");
          }

          if (seg[0] === "doctrine" && seg.length === 1) {
            if (method !== "GET") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET only");
            return handleDoctrineList(res);
          }
          if (seg[0] === "doctrine" && seg.length === 2) {
            const name = decodeURIComponent(seg[1]);
            if (method === "GET") {
              const p = guard.guardDoctrine(name);
              const exists = fs.existsSync(p);
              return sendJson(res, 200, {
                name,
                exists,
                content: exists ? fs.readFileSync(p, "utf-8") : "",
              });
            }
            if (method === "PUT") return await handleDoctrineWrite(req, res, name);
            return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET or PUT");
          }

          if (seg[0] === "prd" && seg.length === 1) {
            if (method === "GET") {
              const exists = fs.existsSync(prdPath());
              const content = exists ? fs.readFileSync(prdPath(), "utf-8") : "";
              return sendJson(res, 200, { content, exists, sections: prd.sectionPresence(content) });
            }
            if (method === "PUT") return await handlePrdWrite(req, res);
            return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET or PUT");
          }
          if (seg[0] === "prd" && seg[1] === "append" && seg.length === 2) {
            if (method !== "POST") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "POST only");
            return await handlePrdAppend(req, res);
          }

          if (seg[0] === "telemetry" && seg.length === 1) {
            if (method === "GET") {
              const limit = parseInt(url.searchParams.get("limit") ?? "100", 10);
              const type = url.searchParams.get("type");
              return sendJson(res, 200, {
                events: telemetry.parseLog(readLog(), { limit, type }),
              });
            }
            if (method === "POST") return await handleTelemetryPost(req, res);
            return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET or POST");
          }

          if (seg[0] === "history" && seg.length === 1) {
            if (method !== "GET") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET only");
            const file = url.searchParams.get("file") ?? "";
            guard.guardDoctrine(file);
            return sendJson(res, 200, { file, snapshots: listSnapshots(file) });
          }
          if (seg[0] === "history" && seg[1] === "content" && seg.length === 2) {
            if (method !== "GET") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "GET only");
            const file = url.searchParams.get("file") ?? "";
            const snapshot = url.searchParams.get("snapshot") ?? "";
            guard.guardDoctrine(file);
            if (!/^[0-9TZ-]+$/.test(snapshot) || !snapshot) {
              return sendErr(res, 400, "INVALID_INPUT", "snapshot id is malformed");
            }
            const p = guard.guardPath(path.join(historyRoot(), file, `${snapshot}.md`));
            if (!fs.existsSync(p)) {
              return sendErr(res, 404, "NOT_FOUND", `No snapshot ${snapshot} for ${file}`);
            }
            return sendJson(res, 200, { file, snapshot, content: fs.readFileSync(p, "utf-8") });
          }

          if (seg[0] === "restore" && seg.length === 1) {
            if (method !== "POST") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "POST only");
            return await handleRestore(req, res);
          }

          if (seg[0] === "onboarding" && seg.length === 1) {
            if (method !== "POST") return sendErr(res, 405, "METHOD_NOT_ALLOWED", "POST only");
            return await handleOnboarding(req, res);
          }

          return sendErr(res, 404, "NOT_FOUND", `Unknown endpoint: /api/zv${url.pathname}`);
        } catch (err) {
          if (err instanceof OutOfBoundsError) {
            console.error(`[zv-api] OUT_OF_BOUNDS rejected: ${method} ${req.url}`);
            return sendErr(res, 403, "OUT_OF_BOUNDS", err.message);
          }
          if (err instanceof FrontmatterError) {
            return sendErr(res, 400, "INVALID_INPUT", err.message);
          }
          if (err.message === "Body is not valid JSON") {
            return sendErr(res, 400, "INVALID_INPUT", err.message);
          }
          console.error("[zv-api]", err);
          return sendErr(res, 500, "IO_ERROR", err.message);
        }
      });
    },
  };
}
