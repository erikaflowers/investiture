import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function homeApiPlugin() {
  const repoRoot = path.resolve(process.cwd(), '../..');
  const trackingFile = path.resolve(process.cwd(), 'data/skill-tracking.json');

  function walkDir(dir, stats, depth = 0) {
    if (depth > 4) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stats.dirs++;
        walkDir(full, stats, depth + 1);
      } else {
        stats.files++;
        const ext = path.extname(entry.name).toLowerCase() || '(no ext)';
        stats.byExt[ext] = (stats.byExt[ext] || 0) + 1;
        try { stats.totalBytes += fs.statSync(full).size; } catch {}
      }
    }
  }

  return {
    name: 'home-api',
    configureServer(server) {
      // ── Repo scan ─────────────────────────────────────────────────────
      server.middlewares.use('/api/home/repo-scan', async (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end('Method not allowed'); return; }
        try {
          const stats = { files: 0, dirs: 0, byExt: {}, totalBytes: 0 };
          walkDir(repoRoot, stats);

          const keyFiles = ['VECTOR.md', 'ARCHITECTURE.md', 'CLAUDE.md', 'DESIGN.md', 'README.md', 'package.json'];
          const presence = {};
          for (const f of keyFiles) {
            presence[f] = fs.existsSync(path.join(repoRoot, f));
          }

          let claudeSummary = '';
          const claudePath = path.join(repoRoot, 'CLAUDE.md');
          if (fs.existsSync(claudePath)) {
            const raw = fs.readFileSync(claudePath, 'utf-8');
            const lines = raw.split('\n').filter(l => l.trim());
            claudeSummary = lines.slice(0, 8).join('\n');
          }

          const topExts = Object.entries(stats.byExt)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            repoName: path.basename(repoRoot),
            files: stats.files,
            dirs: stats.dirs,
            totalBytes: stats.totalBytes,
            topExtensions: topExts,
            keyFiles: presence,
            claudeSummary,
          }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // ── Git status ────────────────────────────────────────────────────
      server.middlewares.use('/api/home/git-status', async (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end('Method not allowed'); return; }
        try {
          const run = (cmd) => {
            try { return execSync(cmd, { cwd: repoRoot, encoding: 'utf-8', timeout: 5000 }).trim(); }
            catch { return ''; }
          };
          const branch = run('git rev-parse --abbrev-ref HEAD');
          const status = run('git status --short');
          const log = run('git log --oneline -5');
          const dirty = status.length > 0;
          const ahead = run('git rev-list --count @{u}..HEAD 2>/dev/null');
          const behind = run('git rev-list --count HEAD..@{u} 2>/dev/null');

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            branch,
            dirty,
            changedFiles: status ? status.split('\n').length : 0,
            statusLines: status ? status.split('\n').slice(0, 10) : [],
            recentCommits: log ? log.split('\n') : [],
            ahead: parseInt(ahead) || 0,
            behind: parseInt(behind) || 0,
          }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // ── Skill tracking read/write ─────────────────────────────────────
      server.middlewares.use('/api/home/skill-tracking', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const data = fs.existsSync(trackingFile)
              ? JSON.parse(fs.readFileSync(trackingFile, 'utf-8'))
              : { lastUpdated: null, skills: {} };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { skillId } = JSON.parse(body);
              let data = { lastUpdated: null, skills: {} };
              if (fs.existsSync(trackingFile)) {
                data = JSON.parse(fs.readFileSync(trackingFile, 'utf-8'));
              }
              data.skills[skillId] = { lastRun: new Date().toISOString() };
              data.lastUpdated = new Date().toISOString();
              fs.writeFileSync(trackingFile, JSON.stringify(data, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method not allowed');
        }
      });
    }
  };
}
