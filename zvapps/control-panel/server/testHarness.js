// HTTP-layer test harness for zvApiPlugin. Builds a temp repo territory,
// registers the plugin's middleware against it, and drives mock req/res
// objects — no network, no real Vite server. Closes the gap Qin Finding 2
// named: the API handlers (routing, error shapes, guard integration) had
// zero committed tests because the suite only exercised core/ modules.

import fs from "fs";
import os from "os";
import path from "path";
import { EventEmitter } from "events";
import { zvApiPlugin } from "./zvApi.js";

const MOUNT = "/api/zv";

// Create a temp repo root with the two territories the API touches, then a
// control-panel cwd inside it (the plugin resolves repoRoot as cwd/../..).
export function makeTerritory() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "zv-http-"));
  fs.mkdirSync(path.join(root, "zvapps", "control-panel"), { recursive: true });
  fs.mkdirSync(path.join(root, "zvapps", "backlog"), { recursive: true });
  for (const f of ["VECTOR.md", "ARCHITECTURE.md", "CLAUDE.md", "DESIGN.md"]) {
    fs.writeFileSync(path.join(root, f), `# ${f}\n`);
  }
  return root;
}

// Returns { call, cleanup }. call(method, urlPath, body?) resolves to
// { status, json }. urlPath is relative to the mount, e.g. "/backlog".
export function mountApi(root) {
  const prevCwd = process.cwd();
  process.chdir(path.join(root, "zvapps", "control-panel"));

  let handler = null;
  const fakeServer = {
    middlewares: {
      use(mount, fn) {
        if (mount === MOUNT) handler = fn;
      },
    },
  };
  zvApiPlugin().configureServer(fakeServer);
  if (!handler) throw new Error("middleware not registered");

  function call(method, urlPath, body) {
    return new Promise((resolve, reject) => {
      const req = new EventEmitter();
      req.method = method;
      req.url = urlPath; // connect strips the mount prefix before the handler
      const chunks = [];
      const res = {
        statusCode: 200,
        _headers: {},
        setHeader(k, v) {
          this._headers[k] = v;
        },
        end(payload) {
          if (payload) chunks.push(payload);
          const text = chunks.join("");
          let json = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            json = text;
          }
          resolve({ status: this.statusCode, json });
        },
      };
      try {
        const maybe = handler(req, res);
        if (maybe && typeof maybe.catch === "function") maybe.catch(reject);
      } catch (e) {
        reject(e);
      }
      // Deliver the body on the next tick so handlers that attach
      // req.on("data"/"end") synchronously receive it.
      if (body !== undefined) {
        const raw = typeof body === "string" ? body : JSON.stringify(body);
        process.nextTick(() => {
          req.emit("data", raw);
          req.emit("end");
        });
      } else {
        process.nextTick(() => req.emit("end"));
      }
    });
  }

  function cleanup() {
    process.chdir(prevCwd);
    fs.rmSync(root, { recursive: true, force: true });
  }

  return { call, cleanup, root };
}
