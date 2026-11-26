#!/usr/bin/env node
'use strict';
// Outil en ligne de commande utilisé par Claude Code pour lire et mettre à jour le pilotage MURELLE.
// Toutes les écritures passent par lib/store.js (validation + historique + écriture atomique).
// Aide : node pilotage/cli.js help

const S = require('./lib/store');
const { writeReport } = require('./lib/report');

const fs = require('fs');
const path = require('path');

const BY = process.env.PILOTAGE_AUTHOR || 'Claude Code';
const DEFAULT_SYNC = path.join(__dirname, '.sync');

function readDocs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), id: f.replace(/\.json$/, '') }));
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}

function parse(argv) {
  const pos = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) opts[key] = true;
      else { opts[key] = next; i++; }
    } else pos.push(a);
  }
  return { pos, opts };
}

const list = (v) => (v === undefined || v === true ? [] : String(v).split(',').map((s) => s.trim()).filter(Boolean));
const L = (arr, id) => S.labelOf(arr, id);

function fmt(t) {
  const flags = [t.needsUser ? '👤' : '', t.status === 'bloque' ? '⛔' : ''].join('');
  return `${t.id}  [${L(S.STATUSES, t.status)}] [${L(S.PRIORITIES, t.priority)}] ${t.title} ${flags}  · ${L(S.CATEGORIES, t.category)}`;
}

function persist(db) {
  S.saveTasks(db);
  writeReport();
}

const HELP = `Pilotage MURELLE — commandes

  status                          Résumé, progression, prochaine action, alertes
  list [--status s] [--category c] [--phase p] [--priority p] [--search texte] [--open]
  show <ID>                       Détail d'une tâche + historique
  add --title "…" --category c --phase pNN [--priority p] [--status s] [--description "…"]
      [--needs-user] [--waiting toi|fournisseur|externe] [--depends M-001,M-002]
      [--reason "…"] [--evidence "…"] [--notes "…"]
  set <ID> [--status s] [--priority p] [--evidence "…"] [--reason "…"] [--note "…"]
      [--needs-user true|false] [--waiting …] [--depends …] [--title …] [--description …]
  journal --summary "…" [--done IDs] [--started IDs] [--added IDs] [--blocked IDs]
      [--validation IDs] [--files a,b] [--result "…"]
  check                           Valide les données et régénère ETAT.md
  import [dir]                    Remplace les données locales par l'export du dashboard publié (défaut pilotage/.sync)
  push-plan [dir]                 Liste les documents à renvoyer au dashboard publié (écritures ArtifactData)
  meta                            Liste les identifiants de statuts, priorités, catégories, phases

Règle : passer une tâche à "termine" exige --evidence (preuve de vérification).`;

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, opts } = parse(rest);
  const db = S.loadTasks();

  switch (cmd) {
    case 'status': {
      const st = S.computeStats(db);
      console.log(`MURELLE — ${st.percent} % (${st.done}/${st.total} terminées)`);
      console.log(Object.entries(st.byStatus).map(([k, v]) => `${L(S.STATUSES, k)}: ${v}`).join(' · ') + ` · Ta validation: ${st.needsUser}`);
      if (st.nextAction) console.log(`\nProchaine action → ${fmt(db.tasks.find((t) => t.id === st.nextAction))}`);
      console.log('\nDomaines :');
      for (const c of st.categories) console.log(`  ${String(c.percent).padStart(3)} %  ${c.done}/${c.total}  ${c.label}`);
      console.log('\nAlertes :');
      for (const [k, v] of Object.entries(st.alerts)) console.log(`  ${k.padEnd(12)} ${v.join(', ') || '—'}`);
      break;
    }
    case 'list': {
      let ts = db.tasks;
      if (opts.status) ts = ts.filter((t) => t.status === opts.status);
      if (opts.category) ts = ts.filter((t) => t.category === opts.category);
      if (opts.phase) ts = ts.filter((t) => t.phase === opts.phase);
      if (opts.priority) ts = ts.filter((t) => t.priority === opts.priority);
      if (opts.open) ts = ts.filter((t) => t.status !== 'termine');
      if (opts.search) {
        const q = String(opts.search).toLowerCase();
        ts = ts.filter((t) => `${t.id} ${t.title} ${t.description} ${t.notes}`.toLowerCase().includes(q));
      }
      ts.forEach((t) => console.log(fmt(t)));
      console.log(`\n${ts.length} tâche(s)`);
      break;
    }
    case 'show': {
      const t = db.tasks.find((x) => x.id === pos[0]);
      if (!t) throw new Error(`tâche introuvable : ${pos[0]}`);
      console.log(JSON.stringify(t, null, 2));
      break;
    }
    case 'add': {
      const input = {
        title: opts.title, description: opts.description === true ? '' : opts.description,
        category: opts.category, phase: opts.phase, priority: opts.priority, status: opts.status,
        needsUser: Boolean(opts['needs-user']), waitingOn: opts.waiting || 'aucun',
        dependsOn: list(opts.depends), blockedReason: opts.reason, evidence: opts.evidence, notes: opts.notes,
        source: 'claude', historyNote: opts.note ? `Tâche créée — ${opts.note}` : undefined,
      };
      if (input.status === 'termine' && !input.evidence) throw new Error('--evidence obligatoire pour créer une tâche terminée');
      const t = S.createTask(db, input, BY);
      persist(db);
      console.log(`Ajoutée : ${fmt(t)}`);
      break;
    }
    case 'set': {
      const id = pos[0];
      const patch = {};
      const map = { status: 'status', priority: 'priority', evidence: 'evidence', reason: 'blockedReason',
        waiting: 'waitingOn', title: 'title', description: 'description', category: 'category', phase: 'phase', notes: 'notes' };
      for (const [o, f] of Object.entries(map)) if (opts[o] !== undefined && opts[o] !== true) patch[f] = opts[o];
      if (opts['needs-user'] !== undefined) patch.needsUser = opts['needs-user'] === true || opts['needs-user'] === 'true';
      if (opts.depends !== undefined) patch.dependsOn = list(opts.depends);
      const current = db.tasks.find((x) => x.id === id);
      if (!current) throw new Error(`tâche introuvable : ${id}`);
      if (patch.status === 'termine' && !(patch.evidence || current.evidence)) {
        throw new Error('--evidence obligatoire : décris comment le travail a été réellement vérifié');
      }
      const { task, changed } = S.updateTask(db, id, patch, BY, opts.note === true ? undefined : opts.note);
      persist(db);
      console.log(`${changed ? 'Mise à jour' : 'Inchangée'} : ${fmt(task)}`);
      break;
    }
    case 'journal': {
      const j = S.loadJournal();
      const e = S.addJournalEntry(j, {
        author: BY, summary: opts.summary === true ? '' : opts.summary, result: opts.result === true ? '' : opts.result,
        tasksDone: list(opts.done), tasksStarted: list(opts.started), tasksAdded: list(opts.added),
        tasksBlocked: list(opts.blocked), needsValidation: list(opts.validation), files: list(opts.files),
      });
      const known = new Set(db.tasks.map((t) => t.id));
      const unknown = [...e.tasksDone, ...e.tasksStarted, ...e.tasksAdded, ...e.tasksBlocked, ...e.needsValidation].filter((x) => !known.has(x));
      if (unknown.length) throw new Error(`identifiants inconnus dans le journal : ${unknown.join(', ')}`);
      S.saveJournal(j);
      writeReport();
      console.log(`Journal : ${e.id} enregistré`);
      break;
    }
    case 'check': {
      const errors = S.validateAll(db);
      writeReport();
      if (errors.length) { console.error('Erreurs :\n- ' + errors.join('\n- ')); process.exit(1); }
      const st = S.computeStats(db);
      console.log(`OK — ${db.tasks.length} tâches valides, ${S.loadJournal().entries.length} entrées de journal, progression ${st.percent} %. ETAT.md régénéré.`);
      break;
    }
    case 'import': {
      // Remplace les fichiers locaux par un export de la base du dashboard publié
      // (dossier rempli par ArtifactData list … out_dir : <dir>/tasks/*.json et <dir>/journal/*.json).
      const dir = path.resolve(pos[0] || DEFAULT_SYNC);
      const tasks = readDocs(path.join(dir, 'tasks')).sort((a, b) => a.id.localeCompare(b.id));
      const entries = readDocs(path.join(dir, 'journal')).sort((a, b) => (a.at || '').localeCompare(b.at || '') || a.id.localeCompare(b.id));
      if (!tasks.length) throw new Error(`aucune tâche trouvée dans ${dir}/tasks`);
      const next = { ...db, tasks };
      const errors = S.validateAll(next);
      if (errors.length) throw new Error('export invalide, rien n\'a été importé :\n- ' + errors.join('\n- '));
      S.saveTasks(next);
      S.saveJournal({ version: 1, entries });
      writeReport();
      console.log(`Importé depuis le dashboard publié : ${tasks.length} tâches, ${entries.length} entrées de journal.`);
      break;
    }
    case 'push-plan': {
      // Compare les fichiers locaux à l'export <dir> et prépare les écritures à envoyer au dashboard publié.
      const dir = path.resolve(pos[0] || DEFAULT_SYNC);
      const out = path.join(dir, 'out');
      fs.rmSync(out, { recursive: true, force: true });
      const writes = [];
      const plan = (coll, local) => {
        const remote = Object.fromEntries(readDocs(path.join(dir, coll)).map((d) => [d.id, d]));
        for (const d of local) {
          if (remote[d.id] && JSON.stringify(sortKeys(remote[d.id])) === JSON.stringify(sortKeys(d))) continue;
          fs.mkdirSync(path.join(out, coll), { recursive: true });
          const file = path.join(out, coll, `${d.id}.json`);
          fs.writeFileSync(file, JSON.stringify(d));
          writes.push({ op: 'set', collection: coll, doc_id: d.id, file_path: file });
        }
        for (const id of Object.keys(remote)) if (!local.some((d) => d.id === id)) writes.push({ op: 'delete', collection: coll, doc_id: id });
      };
      plan('tasks', db.tasks);
      plan('journal', S.loadJournal().entries);
      console.log(writes.length ? JSON.stringify(writes, null, 1) : 'Rien à envoyer : le dashboard publié est à jour.');
      break;
    }
    case 'meta': {
      for (const [name, arr] of [['Statuts', S.STATUSES], ['Priorités', S.PRIORITIES], ['Catégories', S.CATEGORIES], ['Phases', S.PHASES], ['En attente de', S.WAITING_ON]]) {
        console.log(`${name} : ${arr.map((x) => `${x.id} (${x.label})`).join(', ')}`);
      }
      break;
    }
    default:
      console.log(HELP);
  }
}

try {
  main();
} catch (e) {
  console.error(`Erreur : ${e.message}`);
  process.exit(1);
}
