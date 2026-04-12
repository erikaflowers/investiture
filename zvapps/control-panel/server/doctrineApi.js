import fs from 'fs';
import path from 'path';

export function doctrineApiPlugin() {
  const repoRoot = path.resolve(process.cwd(), '../..');

  function safePath(filename) {
    const allowed = ['VECTOR.md', 'ARCHITECTURE.md', 'CLAUDE.md', 'DESIGN.md'];
    if (!allowed.includes(filename)) return null;
    return path.join(repoRoot, filename);
  }

  return {
    name: 'doctrine-api',
    configureServer(server) {
      server.middlewares.use('/api/doctrine/read', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        const url = new URL(req.url, 'http://localhost');
        const filename = url.searchParams.get('file');
        const filepath = safePath(filename);
        if (!filepath) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Invalid file: ${filename}` }));
          return;
        }
        try {
          const content = fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf-8') : '';
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ file: filename, content, exists: fs.existsSync(filepath) }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      server.middlewares.use('/api/doctrine/write', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { file, content } = JSON.parse(body);
            const filepath = safePath(file);
            if (!filepath) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Invalid file: ${file}` }));
              return;
            }
            fs.writeFileSync(filepath, content, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, file }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // ── Vector folder browser ───────────────────────────────────────────
      const vectorRoot = path.join(repoRoot, 'vector');

      function safeVectorPath(relPath) {
        if (!relPath) return vectorRoot;
        const resolved = path.resolve(vectorRoot, relPath);
        if (!resolved.startsWith(vectorRoot)) return null;
        return resolved;
      }

      server.middlewares.use('/api/vector/list', async (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end('Method not allowed'); return; }
        const url = new URL(req.url, 'http://localhost');
        const dir = url.searchParams.get('dir') || '';
        const target = safeVectorPath(dir);
        if (!target) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid path' }));
          return;
        }
        try {
          if (!fs.existsSync(target)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ dir, entries: [], exists: false }));
            return;
          }
          const entries = fs.readdirSync(target, { withFileTypes: true })
            .filter(e => !e.name.startsWith('.'))
            .map(e => ({
              name: e.name,
              type: e.isDirectory() ? 'dir' : 'file',
              path: dir ? `${dir}/${e.name}` : e.name,
              size: e.isFile() ? fs.statSync(path.join(target, e.name)).size : null,
            }))
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
              return a.name.localeCompare(b.name);
            });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ dir, entries, exists: true }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      server.middlewares.use('/api/vector/read', async (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end('Method not allowed'); return; }
        const url = new URL(req.url, 'http://localhost');
        const filePath = url.searchParams.get('file');
        const target = safeVectorPath(filePath);
        if (!target || !filePath) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid path' }));
          return;
        }
        try {
          if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ file: filePath, content: '', exists: false }));
            return;
          }
          const content = fs.readFileSync(target, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ file: filePath, content, exists: true }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}
