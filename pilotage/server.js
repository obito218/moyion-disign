#!/usr/bin/env node
'use strict';
// Serveur local du tableau de pilotage MURELLE. Aucune dépendance : Node.js suffit.
// Lancement : node pilotage/server.js   puis ouvrir http://localhost:4300

const http = require('http');
const fs = require('fs');
const path = require('path');
const S = require('./lib/store');
const { writeReport } = require('./lib/report');

const PORT = parseInt(process.env.PORT, 10) || 4300;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC = path.join(__dirname, 'public');
const USER = 'Toi (dashboard)';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
};

function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) { reject(new Error('requête trop volumineuse')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('JSON invalide')); }
    });
  });
}

function state() {
  const db = S.loadTasks();
  return {
    project: db.project,
    updatedAt: db.updatedAt,
    tasks: db.tasks,
    journal: S.loadJournal().entries,
    stats: S.computeStats(db),
    meta: {
      statuses: S.STATUSES, priorities: S.PRIORITIES, categories: S.CATEGORIES,
      phases: S.PHASES, waitingOn: S.WAITING_ON,
      files: { tasks: 'pilotage/data/tasks.json', journal: 'pilotage/data/journal.json', rules: 'pilotage/REGLES.md' },
    },
  };
}

async function api(req, res, url) {
  const m = url.pathname.match(/^\/api\/tasks\/([\w-]+)$/);
  if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, state());

  if (req.method === 'GET' && url.pathname === '/api/export') {
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), tasks: S.loadTasks(), journal: S.loadJournal() }, null, 2);
    return send(res, 200, body, 'application/json; charset=utf-8',
      { 'Content-Disposition': `attachment; filename="murelle-pilotage-${S.today()}.json"` });
  }

  if (req.method === 'POST' && url.pathname === '/api/tasks') {
    const body = await readBody(req);
    const db = S.loadTasks();
    const t = S.createTask(db, { ...body, source: 'manuel' }, USER);
    S.saveTasks(db);
    const j = S.loadJournal();
    S.addJournalEntry(j, { author: USER, summary: `Tâche ajoutée manuellement : ${t.id} — ${t.title}`, tasksAdded: [t.id] });
    S.saveJournal(j);
    writeReport();
    return send(res, 201, state());
  }

  if (m && req.method === 'PATCH') {
    const body = await readBody(req);
    const db = S.loadTasks();
    const { note, ...patch } = body;
    S.updateTask(db, m[1], patch, USER, note);
    S.saveTasks(db);
    writeReport();
    return send(res, 200, state());
  }

  if (m && req.method === 'DELETE') {
    const db = S.loadTasks();
    const t = S.deleteTask(db, m[1]);
    S.saveTasks(db);
    const j = S.loadJournal();
    S.addJournalEntry(j, { author: USER, summary: `Tâche supprimée : ${t.id} — ${t.title}`, result: `Statut au moment de la suppression : ${S.labelOf(S.STATUSES, t.status)}` });
    S.saveJournal(j);
    writeReport();
    return send(res, 200, state());
  }

  return send(res, 404, { error: 'route inconnue' });
}

function staticFile(res, pathname) {
  if (pathname === '/model.js') return fs.readFile(path.join(__dirname, 'lib', 'model.js'), (err, buf) => (err ? send(res, 404, 'introuvable', 'text/plain') : send(res, 200, buf, MIME['.js'])));
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'interdit', 'text/plain');
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'introuvable', 'text/plain');
    send(res, 200, buf, MIME[path.extname(file)] || 'application/octet-stream');
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return staticFile(res, url.pathname);
  } catch (e) {
    return send(res, 400, { error: e.message });
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`\n  Tableau de pilotage MURELLE → http://localhost:${PORT}\n  (Ctrl+C pour arrêter)\n`);
  });
}

module.exports = { server };
