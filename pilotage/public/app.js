/* Tableau de pilotage MURELLE — interface. Lit et écrit via l'API locale (server.js). */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');
  const modal = $('#modal');
  const BOARD_COLS = ['a_faire', 'en_cours', 'a_verifier', 'en_attente', 'termine'];
  const SEG_ORDER = ['termine', 'en_cours', 'a_verifier', 'en_attente', 'bloque'];
  const SEG_COLOR = { termine: 'var(--green-2)', en_cours: 'var(--green-3)', a_verifier: '#D3AE5E', en_attente: '#93A3B0', bloque: 'var(--terra)', a_faire: 'var(--surface-2)' };

  let D = null; // état complet renvoyé par le serveur
  let byId = {};

  // ---------- Préférences locales (confort uniquement) ----------
  const prefs = (() => {
    let p = { view: 'board', reduceMotion: false, autoRefresh: true };
    try { p = { ...p, ...JSON.parse(localStorage.getItem('murelle-pilotage') || '{}') }; } catch { /* stockage indisponible */ }
    return p;
  })();
  function savePrefs() {
    try { localStorage.setItem('murelle-pilotage', JSON.stringify(prefs)); } catch { /* ignoré */ }
    document.documentElement.classList.toggle('reduce-motion', prefs.reduceMotion);
  }
  savePrefs();

  // ---------- Utilitaires ----------
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (kind, id) => (D.meta[kind].find((x) => x.id === id) || { label: id }).label;
  const prank = (p) => (D.meta.priorities.find((x) => x.id === p) || { rank: 9 }).rank;
  const sortTasks = (a, b) => prank(a.priority) - prank(b.priority) || a.phase.localeCompare(b.phase) || a.id.localeCompare(b.id);
  const open = (t) => t.status !== 'termine';
  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d.length === 10 ? d + 'T12:00:00' : d);
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const fmtDateTime = (d) => new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const todayStr = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
  const unmetDeps = (t) => t.dependsOn.filter((d) => byId[d] && byId[d].status !== 'termine');

  function toast(msg, bad = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { el.className = 'toast'; }, 2600);
  }

  async function api(method, url, body) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
    return json;
  }

  function setData(d) {
    D = d;
    byId = Object.fromEntries(D.tasks.map((t) => [t.id, t]));
    $('#nc-bloque').textContent = D.stats.byStatus.bloque || '';
    $('#nc-verif').textContent = D.stats.byStatus.a_verifier || '';
    $('#side-foot').innerHTML = `Données : <span class="mono">pilotage/data</span><br>Mis à jour ${D.updatedAt ? fmtDateTime(D.updatedAt) : '—'}`;
  }

  async function load() {
    try {
      setData(await api('GET', '/api/state'));
      render();
    } catch (e) {
      main.innerHTML = `<div class="card"><h2>Serveur injoignable</h2><p class="lead">Lance <span class="mono">node pilotage/server.js</span> depuis le dossier du projet, puis recharge cette page.</p><p class="empty">${esc(e.message)}</p></div>`;
    }
  }

  async function mutate(method, url, body, okMsg) {
    try {
      setData(await api(method, url, body));
      render(true);
      if (okMsg) toast(okMsg);
      return true;
    } catch (e) {
      toast(e.message, true);
      return false;
    }
  }

  // ---------- Routage ----------
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    return { route: path || '', q: Object.fromEntries(new URLSearchParams(qs || '')) };
  }
  const go = (route, q) => {
    const qs = q && Object.keys(q).length ? '?' + new URLSearchParams(q).toString() : '';
    location.hash = `#/${route}${qs}`;
  };

  const PAGES = { '': overview, taches: tasksPage, roadmap, categories, bloquees: blockedPage, verifier: verifyPage, historique: historyPage, parametres: settingsPage };

  function render(keepScroll = false) {
    if (!D) return;
    const { route, q } = parseHash();
    const page = PAGES[route] || overview;
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === route));
    const y = window.scrollY;
    main.innerHTML = page(q);
    if (keepScroll) window.scrollTo(0, y);
    afterRender(route);
  }

  // ---------- Composants ----------
  const chipStatus = (s) => `<span class="chip s-${s}"><span class="dot"></span>${esc(L('statuses', s))}</span>`;
  const chipPrio = (p) => `<span class="chip p-${p}">${esc(L('priorities', p))}</span>`;
  const chipYou = (t) => (t.needsUser && open(t) ? '<span class="chip you" title="Nécessite ton intervention">Toi</span>' : '');
  const bar = (p) => `<div class="track"><span style="width:${p}%"></span></div>`;

  function taskItem(t, opts = {}) {
    const why = opts.why ? `<div class="why">${esc(opts.why)}</div>` : '';
    return `<li class="titem" data-open="${t.id}" tabindex="0">
      <div class="tt"><span class="tid">${t.id}</span>${esc(t.title)}</div>
      <div class="side-chip">${opts.side ?? chipStatus(t.status)}</div>
      <div class="meta">${chipPrio(t.priority)}<span class="chip">${esc(L('categories', t.category))}</span>${chipYou(t)}</div>${why}
    </li>`;
  }
  const taskList = (ts, empty = 'Rien à signaler.', opts) => (ts.length ? `<ul class="tlist">${ts.map((t) => taskItem(t, opts && opts(t))).join('')}</ul>` : `<p class="empty">${empty}</p>`);

  function pageHead(eyebrow, title, lead, actions = '') {
    return `<header class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${actions}</header>`;
  }

  // ---------- Vue d'ensemble ----------
  function overview() {
    const st = D.stats;
    const segs = SEG_ORDER.map((s) => `<span style="width:${st.total ? (st.byStatus[s] / st.total) * 100 : 0}%;background:${SEG_COLOR[s]}" title="${esc(L('statuses', s))} : ${st.byStatus[s]}"></span>`).join('');
    const legend = [...SEG_ORDER, 'a_faire'].map((s) => `<span><i style="background:${SEG_COLOR[s]};${s === 'a_faire' ? 'border:1px solid var(--line-2)' : ''}"></i>${esc(L('statuses', s))} · ${st.byStatus[s]}</span>`).join('');
    const stat = (n, l, cls, q) => `<a class="card stat ${cls}" href="#/taches?${new URLSearchParams(q)}"><div class="n">${n}</div><div class="l">${l}</div></a>`;

    const next = st.nextAction ? byId[st.nextAction] : null;
    const nextHtml = next ? `
      <div class="card next">
        <div class="eyebrow">Prochaine action prioritaire</div>
        <h2>${esc(next.title)}</h2>
        <p>${esc(next.description)}</p>
        <div class="chips" style="margin-bottom:18px">
          <span class="chip">${next.id}</span><span class="chip">${esc(L('priorities', next.priority))}</span>
          <span class="chip">${esc(L('statuses', next.status))}</span><span class="chip">${esc(L('categories', next.category))}</span>
          <span class="chip">${next.needsUser ? 'À faire par toi' : 'Réalisable par Claude Code'}</span>
        </div>
        <button class="btn" data-open="${next.id}">Ouvrir la tâche</button>
      </div>` : `<div class="card"><h3>Aucune action disponible</h3><p class="empty">Toutes les tâches ouvertes attendent une dépendance ou un tiers.</p></div>`;

    const pre = D.tasks.filter((t) => t.phase !== 'p11');
    const preOpen = pre.filter(open);
    const preDone = pre.length - preOpen.length;
    const prePct = pre.length ? Math.round((preDone / pre.length) * 100) : 0;
    const preTop = preOpen.filter((t) => ['urgente', 'elevee'].includes(t.priority)).sort(sortTasks);
    const launchHtml = `
      <div class="card">
        <div class="card-head"><h3>Avant le lancement</h3><a href="#/roadmap">Roadmap</a></div>
        <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:10px">
          <span style="font:600 44px/1 var(--serif)">${preOpen.length}</span>
          <span class="hero-sub" style="margin:0">tâches restantes avant la mise en ligne (phases 1 à 10), dont ${preTop.length} prioritaires</span>
        </div>
        ${bar(prePct)}
        <p class="empty" style="margin-top:6px">${preDone} / ${pre.length} terminées · ${prePct} %</p>
      </div>`;

    const catBars = `<div class="bars">${st.categories.map((c) => `
      <a class="bar-row" href="#/taches?category=${c.id}">
        <span class="name">${esc(c.label)} <small>${c.done}/${c.total}</small></span>
        <span class="pct">${c.total ? c.percent + ' %' : '—'}</span>
        ${bar(c.percent)}
      </a>`).join('')}</div>`;

    const groups = alertGroups();
    const firstNonEmpty = groups.find((g) => g.ids.length) || groups[0];
    const alertsHtml = `
      <div class="card" id="alerts">
        <div class="card-head"><h3>Alertes</h3><a href="#/bloquees">Blocages</a></div>
        <div class="alert-tabs">${groups.map((g) => `<button data-alert="${g.key}" class="${g.key === firstNonEmpty.key ? 'on' : ''}">${g.label} <b>${g.ids.length}</b></button>`).join('')}</div>
        ${groups.map((g) => `<div data-alert-panel="${g.key}" ${g.key === firstNonEmpty.key ? '' : 'hidden'}>${taskList(g.ids.map((i) => byId[i]).sort(sortTasks).slice(0, 8), 'Aucune tâche dans cette rubrique.', (t) => ({ why: t.status === 'bloque' ? t.blockedReason : '' }))}${g.ids.length > 8 ? `<p class="empty"><a class="link" href="#/taches?${g.q}">Voir les ${g.ids.length}</a></p>` : ''}</div>`).join('')}
      </div>`;

    const urgent = D.tasks.filter((t) => open(t) && t.priority === 'urgente').sort(sortTasks);
    const waiting = D.tasks.filter((t) => t.status === 'en_attente' || (open(t) && ['fournisseur', 'externe'].includes(t.waitingOn))).sort(sortTasks);
    const lastDone = D.tasks.filter((t) => t.status === 'termine').sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')).slice(0, 6);

    const mini = `<div class="mini-road">${st.phases.map((p) => `
      <a href="#/roadmap" title="Phase ${p.num} — ${esc(p.label)} : ${p.done}/${p.total}">
        <div class="seg"><span style="width:${p.percent}%"></span><b>${p.num}</b></div>
        <div class="lbl">${esc(p.label)} · ${p.percent} %</div>
      </a>`).join('')}</div>`;

    const lastJ = D.journal[D.journal.length - 1];
    return `
      ${pageHead('MURELLE · papier peint panoramique sur mesure', 'Vue d\'ensemble', lastJ ? `Dernière intervention le ${fmtDate(lastJ.date)} — ${esc(lastJ.summary)}` : '')}
      <div class="stack">
        <section class="card hero">
          <div><div class="hero-pct">${st.percent}<small>%</small></div><div class="hero-sub">${st.done} tâches terminées sur ${st.total}</div></div>
          <div><div class="eyebrow">Avancement global</div><div class="bigbar">${segs}</div><div class="legend">${legend}</div>
          <p class="empty" style="margin-top:10px">Calcul : tâches « Terminé » ÷ toutes les tâches. Une tâche « À vérifier » n'est pas comptée comme faite.</p></div>
        </section>
        <section class="stats">
          ${stat(st.done, 'Terminées', 't-termine', { status: 'termine' })}
          ${stat(st.remaining, 'Restantes', '', { open: '1' })}
          ${stat(st.byStatus.en_cours, 'En cours', '', { status: 'en_cours' })}
          ${stat(st.byStatus.bloque, 'Bloquées', 't-bloque', { status: 'bloque' })}
          ${stat(st.byStatus.a_verifier, 'À vérifier', 't-verif', { status: 'a_verifier' })}
          ${stat(st.needsUser, 'Attendent ton intervention', '', { you: '1' })}
        </section>
        <section class="grid g-main">${nextHtml}${launchHtml}</section>
        <section class="grid g-main">
          <div class="card"><div class="card-head"><h3>Progression par domaine</h3><a href="#/categories">Détail</a></div>${catBars}</div>
          ${alertsHtml}
        </section>
        <section class="grid g-3">
          <div class="card"><div class="card-head"><h3>Urgentes</h3><a href="#/taches?priority=urgente&open=1">Toutes</a></div>${taskList(urgent.slice(0, 6), 'Aucune tâche urgente.')}</div>
          <div class="card"><div class="card-head"><h3>En attente</h3></div>${taskList(waiting.slice(0, 6), 'Aucune tâche en attente d\'un tiers.', (t) => ({ side: `<span class="chip s-en_attente">${esc(L('waitingOn', t.waitingOn))}</span>` }))}</div>
          <div class="card"><div class="card-head"><h3>Dernières réalisations</h3><a href="#/historique">Historique</a></div>${taskList(lastDone, 'Aucune tâche terminée.', (t) => ({ side: `<span class="chip">${fmtDate(t.completedAt)}</span>` }))}</div>
        </section>
        <section class="card"><div class="card-head"><h3>Roadmap</h3><a href="#/roadmap">Voir les 11 phases</a></div>${mini}</section>
      </div>`;
  }

  function alertGroups() {
    const a = D.stats.alerts;
    return [
      { key: 'bloque', label: 'Bloquées', ids: a.bloque, q: 'status=bloque' },
      { key: 'urgent', label: 'Urgentes', ids: a.urgent, q: 'priority=urgente&open=1' },
      { key: 'decisions', label: 'Décisions à prendre', ids: a.decisions, q: 'waiting=toi&open=1' },
      { key: 'validation', label: 'À valider', ids: a.validation, q: 'status=a_verifier' },
      { key: 'fournisseur', label: 'Attente fournisseur', ids: a.fournisseur, q: 'waiting=fournisseur&open=1' },
      { key: 'externe', label: 'Intervention extérieure', ids: a.externe, q: 'waiting=externe&open=1' },
    ];
  }

  // ---------- Toutes les tâches ----------
  function filterTasks(q) {
    let ts = D.tasks.slice();
    if (q.category) ts = ts.filter((t) => t.category === q.category);
    if (q.priority) ts = ts.filter((t) => t.priority === q.priority);
    if (q.status) ts = ts.filter((t) => t.status === q.status);
    if (q.phase) ts = ts.filter((t) => t.phase === q.phase);
    if (q.waiting) ts = ts.filter((t) => t.waitingOn === q.waiting);
    if (q.you) ts = ts.filter((t) => t.needsUser && open(t));
    if (q.open) ts = ts.filter(open);
    if (q.q) {
      const s = q.q.toLowerCase();
      ts = ts.filter((t) => `${t.id} ${t.title} ${t.description} ${t.notes} ${t.evidence}`.toLowerCase().includes(s));
    }
    return ts.sort(sortTasks);
  }

  function tcard(t) {
    const un = unmetDeps(t);
    return `<article class="tcard ${t.status === 'bloque' ? 'is-bloque' : ''} ${t.status === 'termine' ? 'is-done' : ''}" draggable="true" data-drag="${t.id}" data-open="${t.id}" tabindex="0">
      <div class="tid">${t.id} · ${esc(L('phases', t.phase))}</div>
      <div class="tt">${esc(t.title)}</div>
      ${t.status === 'bloque' ? `<div class="why">⛔ ${esc(t.blockedReason)}</div>` : ''}
      ${un.length && open(t) ? `<div class="deps">Attend ${un.length} tâche${un.length > 1 ? 's' : ''} : ${un.join(', ')}</div>` : ''}
      <div class="chips">${chipPrio(t.priority)}${chipYou(t)}${t.waitingOn !== 'aucun' && open(t) && t.waitingOn !== 'toi' ? `<span class="chip s-en_attente">${esc(L('waitingOn', t.waitingOn))}</span>` : ''}</div>
      <div class="cat">${esc(L('categories', t.category))}</div>
    </article>`;
  }

  function tasksPage(q) {
    const ts = filterTasks(q);
    const opt = (kind, sel, all) => `<option value="">${all}</option>` + D.meta[kind].map((x) => `<option value="${x.id}" ${sel === x.id ? 'selected' : ''}>${esc(x.label)}</option>`).join('');
    const active = Object.keys(q).filter((k) => q[k]).length;
    const toolbar = `
      <div class="toolbar">
        <input class="search" type="search" id="f-q" placeholder="Rechercher une tâche, un identifiant…" value="${esc(q.q || '')}">
        <select id="f-category" aria-label="Catégorie">${opt('categories', q.category, 'Toutes catégories')}</select>
        <select id="f-priority" aria-label="Priorité">${opt('priorities', q.priority, 'Toutes priorités')}</select>
        <select id="f-status" aria-label="Statut">${opt('statuses', q.status, 'Tous statuts')}</select>
        <select id="f-phase" aria-label="Phase">${opt('phases', q.phase, 'Toutes phases')}</select>
        ${active ? '<button class="btn ghost small" id="f-reset">Effacer les filtres</button>' : ''}
        <div class="seg-ctl" role="group" aria-label="Affichage">
          <button data-view="board" class="${prefs.view === 'board' ? 'on' : ''}">Tableau</button>
          <button data-view="list" class="${prefs.view === 'list' ? 'on' : ''}">Liste</button>
        </div>
      </div>
      <p class="result-count">${ts.length} tâche${ts.length > 1 ? 's' : ''}${q.you ? ' · attendent ton intervention' : ''}${q.waiting ? ' · en attente de : ' + esc(L('waitingOn', q.waiting)) : ''}${q.open ? ' · non terminées' : ''}</p>`;

    let body;
    if (prefs.view === 'list') {
      body = `<div class="card table-wrap"><table class="table"><thead><tr><th>ID</th><th>Tâche</th><th>Statut</th><th>Priorité</th><th>Catégorie</th><th>Phase</th><th>Créée</th><th>Réalisée</th></tr></thead><tbody>
        ${ts.map((t) => `<tr data-open="${t.id}"><td class="tid">${t.id}</td><td>${esc(t.title)} ${chipYou(t)}</td><td>${chipStatus(t.status)}</td><td>${chipPrio(t.priority)}</td><td>${esc(L('categories', t.category))}</td><td>${esc(L('phases', t.phase))}</td><td>${fmtDate(t.createdAt)}</td><td>${t.completedAt ? fmtDate(t.completedAt) : '—'}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Aucune tâche.</td></tr>'}
      </tbody></table></div>`;
    } else {
      const blocked = ts.filter((t) => t.status === 'bloque');
      const cols = BOARD_COLS.map((s) => {
        let list = ts.filter((t) => t.status === s);
        let more = '';
        if (s === 'termine') {
          list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
          if (list.length > 25) { more = `<div class="more"><a class="link" href="#/taches?status=termine">+ ${list.length - 25} autres terminées</a></div>`; list = list.slice(0, 25); }
        }
        return `<section class="col" data-drop="${s}"><div class="col-head">${esc(L('statuses', s))}<span>${ts.filter((t) => t.status === s).length}</span></div>${list.map(tcard).join('')}${more}</section>`;
      }).join('');
      body = `
        <section class="blocked-strip" data-drop="bloque">
          <h3>⛔ Bloqué <span class="chip s-bloque">${blocked.length}</span></h3>
          <div class="cards">${blocked.map(tcard).join('') || '<p class="empty" style="margin:0">Aucune tâche bloquée. Glisse une carte ici pour la bloquer (une raison sera demandée).</p>'}</div>
        </section>
        <div class="board">${cols}</div>`;
    }
    return pageHead('Gestion', 'Toutes les tâches', 'Glisse une carte d\'une colonne à l\'autre pour changer son statut, ou clique dessus pour la modifier.',
      '<button class="btn primary" data-new>+ Nouvelle tâche</button>') + toolbar + body;
  }

  // ---------- Roadmap ----------
  function roadmap() {
    const phases = D.stats.phases.map((p) => {
      const ts = D.tasks.filter((t) => t.phase === p.id).sort(sortTasks);
      const cls = p.total && p.done === p.total ? 'done' : p.done || p.inProgress ? 'started' : '';
      return `<div class="phase ${cls}">
        <div class="phase-num">${p.num}</div>
        <div class="phase-body">
          <div class="phase-top"><h3>Phase ${p.num} — ${esc(p.label)}</h3>
            <span class="counts">${p.done}/${p.total} terminées · ${p.percent} %${p.blocked ? ` · <span style="color:var(--terra)">${p.blocked} bloquée(s)</span>` : ''}${p.toVerify ? ` · ${p.toVerify} à vérifier` : ''}</span></div>
          ${bar(p.percent)}
          <details><summary>Voir les ${ts.length} tâches</summary>${taskList(ts)}</details>
        </div>
      </div>`;
    }).join('');
    return pageHead('Plan', 'Roadmap', 'Les 11 phases de MURELLE. Une phase n\'est terminée que lorsque toutes ses tâches le sont réellement.') +
      `<div class="card"><div class="road">${phases}</div></div>`;
  }

  // ---------- Catégories ----------
  function categories() {
    const cards = D.stats.categories.map((c) => {
      const ts = D.tasks.filter((t) => t.category === c.id && open(t)).sort(sortTasks);
      return `<div class="card">
        <div class="cat-top"><div class="ring" style="--p:${c.percent}"><b>${c.percent}</b></div>
          <div><h3>${esc(c.label)}</h3><div class="cat-counts">${c.done}/${c.total} terminées${c.blocked ? ` · ${c.blocked} bloquée(s)` : ''}${c.toVerify ? ` · ${c.toVerify} à vérifier` : ''}</div></div></div>
        ${taskList(ts.slice(0, 4), c.total ? 'Tout est terminé.' : 'Aucune tâche dans ce domaine.')}
        ${c.total ? `<p style="margin:10px 0 0"><a class="link" href="#/taches?category=${c.id}">Voir les ${c.total} tâches</a></p>` : ''}
      </div>`;
    }).join('');
    return pageHead('Domaines', 'Catégories', 'Progression calculée pour chaque grand domaine du projet.') + `<div class="cats">${cards}</div>`;
  }

  // ---------- Blocages ----------
  function dependents(id) {
    // tâches ouvertes qui dépendent (directement ou non) de id
    const out = new Set();
    const walk = (x) => D.tasks.forEach((t) => { if (open(t) && t.dependsOn.includes(x) && !out.has(t.id)) { out.add(t.id); walk(t.id); } });
    walk(id);
    return out;
  }

  function blockedPage() {
    const blocked = D.tasks.filter((t) => t.status === 'bloque').sort(sortTasks);
    const waiting = D.tasks.filter((t) => open(t) && (t.status === 'en_attente' || ['fournisseur', 'externe'].includes(t.waitingOn))).sort(sortTasks);
    const bottlenecks = D.tasks.filter(open).map((t) => ({ t, n: dependents(t.id).size })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n || sortTasks(a.t, b.t)).slice(0, 10);
    const waitingFor = D.tasks.filter((t) => open(t) && unmetDeps(t).length).length;
    return pageHead('Blocages', 'Tâches bloquées', 'Ce qui empêche le projet d\'avancer : blocages déclarés, attentes de tiers et tâches dont dépendent beaucoup d\'autres.') + `
      <div class="stack">
        <div class="card"><div class="card-head"><h3>Bloquées (${blocked.length})</h3></div>
          ${taskList(blocked, 'Aucune tâche bloquée.', (t) => ({ why: `Raison : ${t.blockedReason}${dependents(t.id).size ? ` · freine ${dependents(t.id).size} autre(s) tâche(s)` : ''}` }))}</div>
        <div class="grid g-2">
          <div class="card"><div class="card-head"><h3>En attente d'un tiers (${waiting.length})</h3></div>
            ${taskList(waiting, 'Aucune tâche en attente.', (t) => ({ side: `<span class="chip s-en_attente">${esc(L('waitingOn', t.waitingOn))}</span>` }))}</div>
          <div class="card"><div class="card-head"><h3>Goulots d'étranglement</h3></div>
            <p class="empty" style="margin-top:-8px">Tâches ouvertes dont dépendent le plus d'autres tâches. ${waitingFor} tâches attendent actuellement une dépendance.</p>
            ${taskList(bottlenecks.map((x) => x.t), 'Aucune dépendance ouverte.', (t) => ({ side: `<span class="chip">débloque ${bottlenecks.find((x) => x.t === t).n}</span>` }))}</div>
        </div>
      </div>`;
  }

  // ---------- À vérifier ----------
  function verifyPage() {
    const toVerify = D.tasks.filter((t) => t.status === 'a_verifier').sort(sortTasks);
    const yours = D.tasks.filter((t) => open(t) && t.needsUser && t.status !== 'a_verifier').sort(sortTasks);
    const vItem = (t) => `<li class="titem" style="cursor:default">
        <div class="tt" data-open="${t.id}" style="cursor:pointer"><span class="tid">${t.id}</span>${esc(t.title)}</div>
        <div class="side-chip">${chipPrio(t.priority)}</div>
        <div class="meta" style="flex-direction:column;gap:8px">
          <span class="empty" style="padding:0">${esc(t.description)}</span>
          ${t.evidence ? `<span class="empty" style="padding:0">Constat : ${esc(t.evidence)}</span>` : ''}
          <span class="chips"><button class="btn small primary" data-confirm="${t.id}">Confirmé, c'est fait</button><button class="btn small" data-todo="${t.id}">Pas encore — à faire</button><button class="btn small ghost" data-open="${t.id}">Modifier</button></span>
        </div></li>`;
    return pageHead('Validation', 'À vérifier', 'Tâches dont l\'état n\'a pas pu être prouvé, ou qui attendent ta décision. « Confirmé » les passe à Terminé avec ta confirmation enregistrée dans l\'historique.') + `
      <div class="stack">
        <div class="card"><div class="card-head"><h3>À vérifier (${toVerify.length})</h3></div>
          ${toVerify.length ? `<ul class="tlist">${toVerify.map(vItem).join('')}</ul>` : '<p class="empty">Rien à vérifier.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Autres actions qui t'attendent (${yours.length})</h3></div>${taskList(yours, 'Aucune.')}</div>
      </div>`;
  }

  // ---------- Historique ----------
  function historyPage(q) {
    const tab = q.tab === 'modifs' ? 'modifs' : 'journal';
    const ids = (arr) => (arr && arr.length ? arr.map((i) => `<button class="idlink" data-open="${esc(i)}" title="${esc(byId[i] ? byId[i].title : 'Tâche supprimée')}">${esc(i)}</button>`).join('') : '—');
    const journal = D.journal.slice().reverse().map((e) => `
      <div class="entry">
        <div class="entry-date">${fmtDate(e.date)}<small>${esc(e.author)} · ${e.id}</small></div>
        <div class="card">
          <h3>${esc(e.summary)}</h3>
          ${e.result ? `<p class="lead" style="margin:0">${esc(e.result)}</p>` : ''}
          <dl>
            ${e.tasksDone.length ? `<dt>Tâches réalisées</dt><dd>${ids(e.tasksDone)}</dd>` : ''}
            ${e.tasksStarted.length ? `<dt>Tâches commencées</dt><dd>${ids(e.tasksStarted)}</dd>` : ''}
            ${e.tasksAdded.length ? `<dt>Tâches ajoutées</dt><dd>${e.tasksAdded.length > 12 ? `${e.tasksAdded.length} tâches (${e.tasksAdded[0]} → ${e.tasksAdded[e.tasksAdded.length - 1]})` : ids(e.tasksAdded)}</dd>` : ''}
            ${e.tasksBlocked.length ? `<dt>Tâches bloquées</dt><dd>${ids(e.tasksBlocked)}</dd>` : ''}
            ${e.needsValidation.length ? `<dt>Ta validation requise</dt><dd>${ids(e.needsValidation)}</dd>` : ''}
            ${e.files.length ? `<dt>Fichiers modifiés</dt><dd class="files">${e.files.map((f) => `<code>${esc(f)}</code>`).join('')}</dd>` : ''}
          </dl>
        </div>
      </div>`).join('');
    const changes = D.tasks.flatMap((t) => t.history.map((h) => ({ ...h, id: t.id, title: t.title }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 300);
    const modifs = `<div class="card"><ul class="tlist changes">${changes.map((c) => `<li><span class="when">${fmtDateTime(c.at)}<br>${esc(c.by)}</span><span><button class="idlink" data-open="${c.id}">${c.id}</button>${esc(c.title)}<br><span class="empty" style="padding:0">${esc(c.change)}</span></span></li>`).join('')}</ul></div>`;
    return pageHead('Journal', 'Historique', 'Chaque intervention de Claude Code et chaque modification de tâche, de la plus récente à la plus ancienne.',
      `<div class="seg-ctl"><button data-htab="journal" class="${tab === 'journal' ? 'on' : ''}">Interventions (${D.journal.length})</button><button data-htab="modifs" class="${tab === 'modifs' ? 'on' : ''}">Modifications des tâches</button></div>`) +
      (tab === 'journal' ? `<div class="timeline">${journal || '<p class="empty">Aucune intervention enregistrée.</p>'}</div>` : modifs);
  }

  // ---------- Paramètres ----------
  function settingsPage() {
    const f = D.meta.files;
    return pageHead('Réglages', 'Paramètres', '') + `
      <div class="stack">
        <div class="card"><h3 style="margin-bottom:14px">Stockage des données</h3>
          <dl class="kv">
            <dt>Tâches</dt><dd><code>${f.tasks}</code></dd>
            <dt>Journal des réalisations</dt><dd><code>${f.journal}</code></dd>
            <dt>Règles de mise à jour</dt><dd><code>${f.rules}</code> et <code>CLAUDE.md</code></dd>
            <dt>Résumé lisible sans serveur</dt><dd><code>pilotage/ETAT.md</code> (régénéré à chaque modification)</dd>
            <dt>Dernière écriture</dt><dd>${D.updatedAt ? fmtDateTime(D.updatedAt) : '—'}</dd>
            <dt>Contenu</dt><dd>${D.tasks.length} tâches · ${D.journal.length} interventions au journal</dd>
          </dl>
          <div class="chips" style="margin-top:18px"><a class="btn" href="/api/export">Exporter une sauvegarde (JSON)</a><button class="btn" id="reload">Recharger les données</button></div>
        </div>
        <div class="card"><h3 style="margin-bottom:14px">Affichage</h3>
          <div class="stack" style="gap:12px">
            <label class="check"><input type="checkbox" id="p-auto" ${prefs.autoRefresh ? 'checked' : ''}> Actualiser automatiquement toutes les 15 s (voir les mises à jour de Claude Code en direct)</label>
            <label class="check"><input type="checkbox" id="p-motion" ${prefs.reduceMotion ? 'checked' : ''}> Réduire les animations</label>
            <label class="check"><input type="checkbox" id="p-list" ${prefs.view === 'list' ? 'checked' : ''}> Afficher les tâches en liste par défaut</label>
          </div>
          <p class="empty">Ces réglages sont propres à ce navigateur.</p>
        </div>
        <div class="card"><h3 style="margin-bottom:14px">Règles de calcul</h3>
          <dl class="kv">
            <dt>Progression globale</dt><dd>Nombre de tâches « Terminé » ÷ nombre total de tâches. Aucune pondération, aucun chiffre saisi à la main.</dd>
            <dt>Progression d'un domaine / d'une phase</dt><dd>Même calcul, restreint aux tâches du domaine ou de la phase.</dd>
            <dt>À vérifier</dt><dd>Compte comme non fait tant que la preuve ou ta confirmation n'existe pas.</dd>
            <dt>Prochaine action</dt><dd>Tâche non terminée, ni bloquée ni en attente, dont toutes les dépendances sont terminées ; la plus prioritaire, puis la plus en amont dans la roadmap.</dd>
          </dl>
        </div>
        <div class="card"><h3 style="margin-bottom:14px">Statuts</h3>
          <div class="chips">${D.meta.statuses.map((s) => chipStatus(s.id)).join('')}</div>
          <p class="empty">Bloqué = impossible d'avancer (raison obligatoire). En attente = un tiers doit agir. À vérifier = résultat à confirmer ou décision à prendre.</p>
        </div>
      </div>`;
  }

  // ---------- Modale de tâche ----------
  function openTask(id, preset = {}) {
    const isNew = !id;
    const t = isNew ? { title: '', description: '', category: 'shopify', phase: 'p03', priority: 'moyenne', status: 'a_faire', needsUser: false, waitingOn: 'aucun', blockedReason: '', dependsOn: [], notes: '', evidence: '', history: [] } : byId[id];
    if (!t) { toast(`Tâche ${id} introuvable (supprimée ?)`, true); return; }
    const v = { ...t, ...preset };
    const opts = (kind, sel) => D.meta[kind].map((x) => `<option value="${x.id}" ${sel === x.id ? 'selected' : ''}>${esc(x.label)}</option>`).join('');
    const depChips = (v.dependsOn || []).map((d) => `<span class="chip ${byId[d] && byId[d].status === 'termine' ? 's-termine' : ''}" title="${esc(byId[d] ? byId[d].title : '')}">${esc(d)} · ${esc(byId[d] ? byId[d].title.slice(0, 38) : 'inconnue')}</span>`).join('');
    const blocks = isNew ? [] : D.tasks.filter((x) => x.dependsOn.includes(id));
    modal.innerHTML = `
      <form method="dialog" id="tform" novalidate>
        <div class="modal-head">
          <div><div class="eyebrow">${isNew ? 'Nouvelle tâche' : `${t.id} · créée le ${fmtDate(t.createdAt)}${t.source === 'claude' ? ' par Claude Code' : ''}`}</div>
            <h2>${isNew ? 'Ajouter une tâche' : esc(t.title)}</h2></div>
          <button type="button" class="icon-btn" data-close aria-label="Fermer">×</button>
        </div>
        <div class="modal-body">
          <div class="f full"><label for="t-title">Titre</label><input class="field" id="t-title" name="title" required value="${esc(v.title)}"></div>
          <div class="f full"><label for="t-desc">Description</label><textarea class="field" id="t-desc" name="description">${esc(v.description)}</textarea></div>
          <div class="f"><label for="t-status">Statut</label><select class="field" id="t-status" name="status">${opts('statuses', v.status)}</select></div>
          <div class="f"><label for="t-prio">Priorité</label><select class="field" id="t-prio" name="priority">${opts('priorities', v.priority)}</select></div>
          <div class="f"><label for="t-cat">Catégorie</label><select class="field" id="t-cat" name="category">${opts('categories', v.category)}</select></div>
          <div class="f"><label for="t-phase">Phase</label><select class="field" id="t-phase" name="phase">${opts('phases', v.phase)}</select></div>
          <div class="f full" id="t-reason-wrap" ${v.status === 'bloque' ? '' : 'hidden'}><label for="t-reason">Raison du blocage (obligatoire)</label><input class="field" id="t-reason" name="blockedReason" value="${esc(v.blockedReason)}"></div>
          <div class="f"><label for="t-wait">En attente de</label><select class="field" id="t-wait" name="waitingOn">${opts('waitingOn', v.waitingOn)}</select></div>
          <div class="f" style="justify-content:flex-end"><label class="check"><input type="checkbox" name="needsUser" ${v.needsUser ? 'checked' : ''}> Nécessite mon intervention</label></div>
          <div class="f full"><label for="t-deps">Dépend de (identifiants séparés par des virgules)</label>
            <input class="field" id="t-deps" name="dependsOn" list="task-ids" value="${esc((v.dependsOn || []).join(', '))}" placeholder="ex. M-009, M-012">
            <datalist id="task-ids">${D.tasks.filter((x) => x.id !== id).map((x) => `<option value="${x.id}">${esc(x.title)}</option>`).join('')}</datalist>
            ${depChips ? `<div class="dep-list">${depChips}</div>` : ''}
            ${blocks.length ? `<span class="hint">Cette tâche conditionne : ${blocks.map((b) => b.id).join(', ')}</span>` : ''}</div>
          <div class="f full"><label for="t-ev">Preuve / constat</label><textarea class="field" id="t-ev" name="evidence" style="min-height:60px" placeholder="Comment le travail a été vérifié">${esc(v.evidence)}</textarea></div>
          <div class="f full"><label for="t-notes">Notes</label><textarea class="field" id="t-notes" name="notes" style="min-height:60px">${esc(v.notes)}</textarea></div>
          ${!isNew ? `<div class="f"><span class="lab">Date de création</span><span>${fmtDate(t.createdAt)}</span></div><div class="f"><span class="lab">Date de réalisation</span><span>${t.completedAt ? fmtDate(t.completedAt) : '—'}</span></div>` : ''}
          <p class="err" id="t-err"></p>
          ${!isNew ? `<div class="hist"><span class="lab" style="font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase">Historique (${t.history.length})</span>
            <ol>${t.history.slice().reverse().map((h) => `<li><span class="when">${fmtDateTime(h.at)}<br>${esc(h.by)}</span><span>${esc(h.change)}</span></li>`).join('')}</ol></div>` : ''}
        </div>
        <div class="modal-foot">
          ${!isNew ? '<button type="button" class="btn danger" data-delete>Supprimer</button>' : ''}
          <div class="right"><button type="button" class="btn" data-close>Annuler</button><button type="submit" class="btn primary">${isNew ? 'Ajouter' : 'Enregistrer'}</button></div>
        </div>
      </form>`;
    const form = $('#tform', modal);
    form.status.addEventListener('change', () => { $('#t-reason-wrap', modal).hidden = form.status.value !== 'bloque'; });
    modal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => modal.close()));
    const del = $('[data-delete]', modal);
    if (del) del.addEventListener('click', async () => {
      if (!confirm(`Supprimer définitivement ${id} — « ${t.title} » ?\n\nPour une tâche terminée, préfère la laisser dans « Terminé » : elle reste dans l'historique et la progression.`)) return;
      if (await mutate('DELETE', `/api/tasks/${id}`, null, `${id} supprimée`)) modal.close();
    });
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const err = $('#t-err', modal);
      const data = {
        title: form.title.value.trim(), description: form.description.value.trim(), status: form.status.value,
        priority: form.priority.value, category: form.category.value, phase: form.phase.value,
        waitingOn: form.waitingOn.value, needsUser: form.needsUser.checked,
        blockedReason: form.status.value === 'bloque' ? form.blockedReason.value.trim() : '',
        dependsOn: form.dependsOn.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        evidence: form.evidence.value.trim(), notes: form.notes.value.trim(),
      };
      if (!data.title) { err.textContent = 'Le titre est obligatoire.'; form.title.focus(); return; }
      if (data.status === 'bloque' && !data.blockedReason) { err.textContent = 'Indique la raison du blocage.'; form.blockedReason.focus(); return; }
      const ok = isNew ? await mutate('POST', '/api/tasks', data, 'Tâche ajoutée') : await mutate('PATCH', `/api/tasks/${id}`, data, 'Modifications enregistrées');
      if (ok) modal.close();
    });
    modal.showModal();
    if (preset.status === 'bloque') setTimeout(() => form.blockedReason.focus(), 50);
    else if (isNew) setTimeout(() => form.title.focus(), 50);
  }

  // ---------- Événements ----------
  function afterRender(route) {
    if (route === 'taches') {
      const { q } = parseHash();
      const upd = (k, v) => { const n = { ...q }; if (v) n[k] = v; else delete n[k]; go('taches', n); };
      ['category', 'priority', 'status', 'phase'].forEach((k) => $(`#f-${k}`).addEventListener('change', (e) => upd(k, e.target.value)));
      const s = $('#f-q');
      s.addEventListener('input', () => { clearTimeout(s.t); s.t = setTimeout(() => upd('q', s.value.trim()), 250); });
      if (q.q) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
      const r = $('#f-reset');
      if (r) r.addEventListener('click', () => go('taches'));
    }
  }

  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-open],[data-new],[data-view],[data-alert],[data-htab],[data-confirm],[data-todo],#reload');
    if (!t) return;
    if (t.matches('[data-confirm]')) {
      const task = byId[t.dataset.confirm];
      const ev = [task.evidence, `Confirmé par toi dans le dashboard le ${fmtDate(todayStr())}`].filter(Boolean).join(' · ');
      return mutate('PATCH', `/api/tasks/${task.id}`, { status: 'termine', evidence: ev, note: 'Validé depuis « À vérifier »' }, `${task.id} terminée`);
    }
    if (t.matches('[data-todo]')) return mutate('PATCH', `/api/tasks/${t.dataset.todo}`, { status: 'a_faire', note: 'Non confirmé : reste à faire' }, 'Passée en « À faire »');
    if (t.matches('[data-open]')) { e.preventDefault(); return openTask(t.dataset.open); }
    if (t.matches('[data-new]')) return openTask(null);
    if (t.matches('[data-view]')) { prefs.view = t.dataset.view; savePrefs(); return render(true); }
    if (t.matches('[data-htab]')) return go('historique', t.dataset.htab === 'modifs' ? { tab: 'modifs' } : {});
    if (t.id === 'reload') { await load(); return toast('Données rechargées'); }
    if (t.matches('[data-alert]')) {
      const box = t.closest('#alerts');
      box.querySelectorAll('[data-alert]').forEach((b) => b.classList.toggle('on', b === t));
      box.querySelectorAll('[data-alert-panel]').forEach((p) => { p.hidden = p.dataset.alertPanel !== t.dataset.alert; });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('[data-open][tabindex]')) openTask(e.target.dataset.open);
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'p-auto') { prefs.autoRefresh = e.target.checked; savePrefs(); }
    if (e.target.id === 'p-motion') { prefs.reduceMotion = e.target.checked; savePrefs(); }
    if (e.target.id === 'p-list') { prefs.view = e.target.checked ? 'list' : 'board'; savePrefs(); }
  });

  // Glisser-déposer entre colonnes.
  let dragId = null;
  document.addEventListener('dragstart', (e) => {
    const c = e.target.closest('[data-drag]');
    if (!c) return;
    dragId = c.dataset.drag;
    c.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
  });
  document.addEventListener('dragend', (e) => { const c = e.target.closest('[data-drag]'); if (c) c.classList.remove('dragging'); document.querySelectorAll('.over').forEach((x) => x.classList.remove('over')); });
  document.addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (z && dragId) { e.preventDefault(); z.classList.add('over'); } });
  document.addEventListener('dragleave', (e) => { const z = e.target.closest('[data-drop]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
  document.addEventListener('drop', (e) => {
    const z = e.target.closest('[data-drop]');
    if (!z || !dragId) return;
    e.preventDefault();
    z.classList.remove('over');
    const id = dragId; const status = z.dataset.drop; dragId = null;
    if (!byId[id] || byId[id].status === status) return;
    if (status === 'bloque') return openTask(id, { status: 'bloque' });
    mutate('PATCH', `/api/tasks/${id}`, { status }, `${id} → ${L('statuses', status)}`);
  });

  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  // Actualisation automatique pour voir les changements faits par Claude Code via la CLI.
  setInterval(async () => {
    if (!prefs.autoRefresh || document.hidden || modal.open || !D) return;
    try {
      const d = await api('GET', '/api/state');
      if (d.updatedAt !== D.updatedAt || d.journal.length !== D.journal.length) {
        const active = document.activeElement && document.activeElement.id;
        setData(d); render(true);
        if (active && $('#' + active)) $('#' + active).focus();
        toast('Tableau actualisé');
      }
    } catch { /* serveur arrêté : on réessaie au prochain tour */ }
  }, 15000);

  load();
})();
