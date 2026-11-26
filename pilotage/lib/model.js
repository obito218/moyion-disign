/* Modèle de données du pilotage MURELLE — logique pure, partagée par Node (server.js, cli.js)
   et par le navigateur (version publiée). Aucune entrée/sortie fichier ici. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PilotageModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

const STATUSES = [
  { id: 'a_faire', label: 'À faire' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'a_verifier', label: 'À vérifier' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'bloque', label: 'Bloqué' },
  { id: 'termine', label: 'Terminé' },
];

const PRIORITIES = [
  { id: 'urgente', label: 'Urgente', rank: 0 },
  { id: 'elevee', label: 'Élevée', rank: 1 },
  { id: 'moyenne', label: 'Moyenne', rank: 2 },
  { id: 'basse', label: 'Basse', rank: 3 },
];

const CATEGORIES = [
  { id: 'branding', label: 'Branding et identité' },
  { id: 'produit', label: 'Produit et fournisseurs' },
  { id: 'shopify', label: 'Site Shopify' },
  { id: 'configurateur', label: 'Configurateur sur mesure' },
  { id: 'catalogue', label: 'Catalogue et fiches produits' },
  { id: 'visuels', label: 'Images et direction artistique' },
  { id: 'marketing', label: 'Marketing et acquisition' },
  { id: 'seo', label: 'SEO' },
  { id: 'logistique', label: 'Logistique et livraison' },
  { id: 'service_client', label: 'Service client' },
  { id: 'paiements', label: 'Paiements et sécurité' },
  { id: 'juridique', label: 'Juridique et conformité' },
  { id: 'finance', label: 'Finance et rentabilité' },
  { id: 'lancement', label: 'Lancement' },
];

const PHASES = [
  { id: 'p01', num: 1, label: 'Fondations' },
  { id: 'p02', num: 2, label: 'Produit et fournisseurs' },
  { id: 'p03', num: 3, label: 'Site e-commerce' },
  { id: 'p04', num: 4, label: 'Visuels' },
  { id: 'p05', num: 5, label: 'Confiance et conversion' },
  { id: 'p06', num: 6, label: 'SEO' },
  { id: 'p07', num: 7, label: 'Juridique et administratif' },
  { id: 'p08', num: 8, label: 'Marketing' },
  { id: 'p09', num: 9, label: 'Logistique et service client' },
  { id: 'p10', num: 10, label: 'Pré-lancement' },
  { id: 'p11', num: 11, label: 'Lancement' },
];

// Qui / quoi la tâche attend.
const WAITING_ON = [
  { id: 'aucun', label: 'Personne' },
  { id: 'toi', label: 'Ta décision / validation' },
  { id: 'fournisseur', label: 'Un fournisseur' },
  { id: 'externe', label: 'Une intervention extérieure' },
];

const ids = (list) => list.map((x) => x.id);

function today() {
  // Date locale France, format AAAA-MM-JJ.
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

function nowIso() {
  return new Date().toISOString();
}





function validateTask(t, all) {
  const errors = [];
  if (!t.id || typeof t.id !== 'string') errors.push('id manquant');
  if (!t.title || !String(t.title).trim()) errors.push(`${t.id} : titre manquant`);
  if (!ids(STATUSES).includes(t.status)) errors.push(`${t.id} : statut invalide "${t.status}"`);
  if (!ids(PRIORITIES).includes(t.priority)) errors.push(`${t.id} : priorité invalide "${t.priority}"`);
  if (!ids(CATEGORIES).includes(t.category)) errors.push(`${t.id} : catégorie invalide "${t.category}"`);
  if (!ids(PHASES).includes(t.phase)) errors.push(`${t.id} : phase invalide "${t.phase}"`);
  if (!ids(WAITING_ON).includes(t.waitingOn)) errors.push(`${t.id} : waitingOn invalide "${t.waitingOn}"`);
  if (!Array.isArray(t.dependsOn)) errors.push(`${t.id} : dependsOn doit être une liste`);
  else if (all) {
    for (const d of t.dependsOn) {
      if (d === t.id) errors.push(`${t.id} : dépend de lui-même`);
      else if (!all.some((x) => x.id === d)) errors.push(`${t.id} : dépendance inconnue ${d}`);
    }
  }
  if (!Array.isArray(t.history)) errors.push(`${t.id} : history doit être une liste`);
  if (t.status === 'termine' && !t.completedAt) errors.push(`${t.id} : terminée sans date de réalisation`);
  if (t.status === 'bloque' && !t.blockedReason) errors.push(`${t.id} : bloquée sans raison`);
  return errors;
}

function validateAll(db) {
  const errors = [];
  const seen = new Set();
  for (const t of db.tasks) {
    if (seen.has(t.id)) errors.push(`id en double : ${t.id}`);
    seen.add(t.id);
    errors.push(...validateTask(t, db.tasks));
  }
  return errors;
}

function nextId(db) {
  const max = db.tasks.reduce((m, t) => {
    const n = parseInt(String(t.id).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `M-${String(max + 1).padStart(3, '0')}`;
}

const EDITABLE = ['title', 'description', 'category', 'phase', 'priority', 'status', 'needsUser',
  'waitingOn', 'blockedReason', 'dependsOn', 'notes', 'evidence', 'createdAt', 'completedAt'];

const FIELD_LABELS = {
  title: 'titre', description: 'description', category: 'catégorie', phase: 'phase',
  priority: 'priorité', status: 'statut', needsUser: 'intervention requise', waitingOn: 'en attente de',
  blockedReason: 'raison du blocage', dependsOn: 'dépendances', notes: 'notes', evidence: 'preuve',
  createdAt: 'date de création', completedAt: 'date de réalisation',
};

function labelOf(list, id) {
  const x = list.find((i) => i.id === id);
  return x ? x.label : id;
}

function describeValue(field, v) {
  if (field === 'status') return labelOf(STATUSES, v);
  if (field === 'priority') return labelOf(PRIORITIES, v);
  if (field === 'category') return labelOf(CATEGORIES, v);
  if (field === 'phase') return labelOf(PHASES, v);
  if (field === 'waitingOn') return labelOf(WAITING_ON, v);
  if (field === 'needsUser') return v ? 'oui' : 'non';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  if (v === null || v === undefined || v === '') return '—';
  const s = String(v);
  return s.length > 60 ? s.slice(0, 57) + '…' : s;
}

function createTask(db, input, by) {
  const t = {
    id: input.id || nextId(db),
    title: String(input.title || '').trim(),
    description: input.description || '',
    category: input.category || 'shopify',
    phase: input.phase || 'p03',
    priority: input.priority || 'moyenne',
    status: input.status || 'a_faire',
    needsUser: Boolean(input.needsUser),
    waitingOn: input.waitingOn || 'aucun',
    blockedReason: input.blockedReason || '',
    dependsOn: Array.isArray(input.dependsOn) ? input.dependsOn : [],
    notes: input.notes || '',
    evidence: input.evidence || '',
    source: input.source || (by === 'Claude Code' ? 'claude' : 'manuel'),
    createdAt: input.createdAt || today(),
    completedAt: input.completedAt || null,
    history: [{ at: nowIso(), by, change: input.historyNote || 'Tâche créée' }],
  };
  if (t.status === 'termine' && !t.completedAt) t.completedAt = today();
  const errors = validateTask(t, [...db.tasks, t]);
  if (errors.length) throw new Error(errors.join(' ; '));
  if (db.tasks.some((x) => x.id === t.id)) throw new Error(`id déjà utilisé : ${t.id}`);
  db.tasks.push(t);
  return t;
}

function updateTask(db, id, patch, by, note) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) throw new Error(`tâche introuvable : ${id}`);
  const before = JSON.parse(JSON.stringify(t));
  const changes = [];
  for (const k of EDITABLE) {
    if (!(k in patch)) continue;
    let v = patch[k];
    if (k === 'needsUser') v = Boolean(v);
    if (k === 'dependsOn' && !Array.isArray(v)) v = String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (JSON.stringify(t[k]) === JSON.stringify(v)) continue;
    changes.push(`${FIELD_LABELS[k]} : ${describeValue(k, t[k])} → ${describeValue(k, v)}`);
    t[k] = v;
  }
  // Règles automatiques sur les dates.
  if (t.status === 'termine' && !t.completedAt) t.completedAt = today();
  if (t.status !== 'termine' && before.status === 'termine' && !('completedAt' in patch)) t.completedAt = null;
  if (t.status !== 'bloque' && before.status === 'bloque' && !('blockedReason' in patch)) t.blockedReason = '';
  const errors = validateTask(t, db.tasks);
  if (errors.length) {
    Object.assign(t, before);
    throw new Error(errors.join(' ; '));
  }
  if (changes.length || note) {
    t.history.push({ at: nowIso(), by, change: [changes.join(' · '), note].filter(Boolean).join(' — ') });
  }
  return { task: t, changed: changes.length > 0 };
}

function deleteTask(db, id) {
  const i = db.tasks.findIndex((x) => x.id === id);
  if (i < 0) throw new Error(`tâche introuvable : ${id}`);
  const [t] = db.tasks.splice(i, 1);
  for (const o of db.tasks) o.dependsOn = o.dependsOn.filter((d) => d !== id);
  return t;
}

function pct(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

// Progression = tâches « Terminé » / toutes les tâches. Une tâche « À vérifier » ne compte pas comme faite.
function computeStats(db) {
  const tasks = db.tasks;
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s.id, 0]));
  for (const t of tasks) byStatus[t.status]++;
  const done = byStatus.termine;
  const total = tasks.length;

  const group = (list, key) => list.map((g) => {
    const ts = tasks.filter((t) => t[key] === g.id);
    const d = ts.filter((t) => t.status === 'termine').length;
    return {
      id: g.id, label: g.label, num: g.num, total: ts.length, done: d, percent: pct(d, ts.length),
      blocked: ts.filter((t) => t.status === 'bloque').length,
      toVerify: ts.filter((t) => t.status === 'a_verifier').length,
      inProgress: ts.filter((t) => t.status === 'en_cours').length,
    };
  });

  const open = tasks.filter((t) => t.status !== 'termine');
  return {
    total, done, remaining: total - done, percent: pct(done, total), byStatus,
    needsUser: open.filter((t) => t.needsUser).length,
    categories: group(CATEGORIES, 'category'),
    phases: group(PHASES, 'phase'),
    nextAction: nextAction(db),
    alerts: {
      bloque: open.filter((t) => t.status === 'bloque').map((t) => t.id),
      urgent: open.filter((t) => t.priority === 'urgente').map((t) => t.id),
      decisions: open.filter((t) => t.needsUser && t.waitingOn === 'toi').map((t) => t.id),
      externe: open.filter((t) => t.waitingOn === 'externe').map((t) => t.id),
      fournisseur: open.filter((t) => t.waitingOn === 'fournisseur').map((t) => t.id),
      validation: open.filter((t) => t.status === 'a_verifier').map((t) => t.id),
    },
  };
}

function rankOf(p) {
  const x = PRIORITIES.find((i) => i.id === p);
  return x ? x.rank : 9;
}

// Prochaine action : tâche non terminée, actionnable (pas bloquée, pas en attente d'un tiers),
// dont toutes les dépendances sont terminées. Tri : priorité, en cours d'abord, phase, ancienneté.
function nextAction(db) {
  const doneIds = new Set(db.tasks.filter((t) => t.status === 'termine').map((t) => t.id));
  const candidates = db.tasks.filter((t) =>
    ['a_faire', 'en_cours', 'a_verifier'].includes(t.status) &&
    t.dependsOn.every((d) => doneIds.has(d)));
  candidates.sort((a, b) =>
    rankOf(a.priority) - rankOf(b.priority) ||
    (b.status === 'en_cours') - (a.status === 'en_cours') ||
    a.phase.localeCompare(b.phase) ||
    a.id.localeCompare(b.id));
  return candidates[0] ? candidates[0].id : null;
}

function addJournalEntry(journal, entry) {
  const e = {
    id: `J-${String(journal.entries.length + 1).padStart(3, '0')}`,
    date: entry.date || today(),
    at: nowIso(),
    author: entry.author || 'Claude Code',
    summary: entry.summary || '',
    result: entry.result || '',
    tasksDone: entry.tasksDone || [],
    tasksStarted: entry.tasksStarted || [],
    tasksAdded: entry.tasksAdded || [],
    tasksBlocked: entry.tasksBlocked || [],
    needsValidation: entry.needsValidation || [],
    files: entry.files || [],
  };
  if (!e.summary) throw new Error('le résumé du journal est obligatoire');
  journal.entries.push(e);
  return e;
}


  return {
    STATUSES, PRIORITIES, CATEGORIES, PHASES, WAITING_ON, today, nowIso,
    validateTask, validateAll, nextId, createTask, updateTask, deleteTask,
    computeStats, nextAction, addJournalEntry, labelOf,
  };
});
