'use strict';
// Accès fichiers du pilotage MURELLE (version locale).
// Source de vérité locale : data/tasks.json et data/journal.json.
// La logique (validation, calculs, historique) est dans lib/model.js, partagée avec la version publiée.

const fs = require('fs');
const path = require('path');
const M = require('./model');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const JOURNAL_FILE = path.join(DATA_DIR, 'journal.json');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return fallback;
    throw new Error(`Fichier illisible ${path.basename(file)} : ${e.message}`);
  }
}

// Écriture atomique : fichier temporaire puis renommage, pour ne jamais laisser un JSON à moitié écrit.
function writeJson(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, file);
}

function loadTasks() {
  return readJson(TASKS_FILE, { version: 1, project: 'MURELLE', updatedAt: null, tasks: [] });
}

function loadJournal() {
  return readJson(JOURNAL_FILE, { version: 1, entries: [] });
}

function saveTasks(db) {
  db.updatedAt = M.nowIso();
  const errors = M.validateAll(db);
  if (errors.length) throw new Error('Données invalides, rien n\'a été enregistré :\n- ' + errors.join('\n- '));
  writeJson(TASKS_FILE, db);
}

function saveJournal(journal) {
  writeJson(JOURNAL_FILE, journal);
}

module.exports = {
  ...M,
  DATA_DIR, TASKS_FILE, JOURNAL_FILE,
  loadTasks, loadJournal, saveTasks, saveJournal,
};
