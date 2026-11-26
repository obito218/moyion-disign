'use strict';
// Génère pilotage/ETAT.md : un résumé lisible sans lancer le serveur (GitHub, application Claude).
const fs = require('fs');
const path = require('path');
const S = require('./store');

const REPORT_FILE = path.join(__dirname, '..', 'ETAT.md');

function bar(p) {
  const n = Math.round(p / 5);
  return '█'.repeat(n) + '░'.repeat(20 - n);
}

function writeReport() {
  const db = S.loadTasks();
  const journal = S.loadJournal();
  const st = S.computeStats(db);
  const byId = Object.fromEntries(db.tasks.map((t) => [t.id, t]));
  const line = (id) => {
    const t = byId[id];
    return `- **${t.id}** ${t.title} — _${S.labelOf(S.STATUSES, t.status)}, ${S.labelOf(S.PRIORITIES, t.priority)}_`;
  };
  const out = [];
  out.push('# MURELLE — état du projet');
  out.push('');
  out.push('> Fichier généré automatiquement depuis `pilotage/data/`. Ne pas modifier à la main.');
  out.push(`> Dernière mise à jour : ${db.updatedAt || '—'}`);
  out.push('');
  out.push(`## Avancement global : ${st.percent} %`);
  out.push('');
  out.push(`\`${bar(st.percent)}\` ${st.done} terminées sur ${st.total}`);
  out.push('');
  out.push('| En cours | À faire | À vérifier | En attente | Bloquées | Ta validation requise |');
  out.push('|---|---|---|---|---|---|');
  out.push(`| ${st.byStatus.en_cours} | ${st.byStatus.a_faire} | ${st.byStatus.a_verifier} | ${st.byStatus.en_attente} | ${st.byStatus.bloque} | ${st.needsUser} |`);
  out.push('');
  if (st.nextAction) {
    const t = byId[st.nextAction];
    out.push('## Prochaine action');
    out.push('');
    out.push(`**${t.id} — ${t.title}**${t.needsUser ? ' _(ton intervention est requise)_' : ''}`);
    out.push('');
    if (t.description) out.push(t.description);
    out.push('');
  }
  out.push('## Progression par domaine');
  out.push('');
  out.push('| Domaine | Terminées | % |');
  out.push('|---|---|---|');
  for (const c of st.categories) out.push(`| ${c.label} | ${c.done}/${c.total} | ${c.total ? c.percent + ' %' : '—'} |`);
  out.push('');
  out.push('## Roadmap');
  out.push('');
  for (const p of st.phases) out.push(`- Phase ${p.num} — ${p.label} : ${p.done}/${p.total} (${p.total ? p.percent + ' %' : '—'})`);
  out.push('');
  const sections = [
    ['Bloquées', st.alerts.bloque],
    ['Urgentes', st.alerts.urgent],
    ['À vérifier (ta validation)', st.alerts.validation],
    ['En attente d\'un fournisseur', st.alerts.fournisseur],
    ['Intervention extérieure', st.alerts.externe],
  ];
  out.push('## Alertes');
  for (const [title, list] of sections) {
    out.push('');
    out.push(`### ${title} (${list.length})`);
    out.push('');
    out.push(list.length ? list.map(line).join('\n') : '_Aucune._');
  }
  out.push('');
  out.push('## Dernières interventions');
  out.push('');
  for (const e of journal.entries.slice(-5).reverse()) out.push(`- ${e.date} · ${e.author} — ${e.summary}`);
  out.push('');
  fs.writeFileSync(REPORT_FILE, out.join('\n'), 'utf8');
}

module.exports = { writeReport, REPORT_FILE };
