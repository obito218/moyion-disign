// Test du script murelle-motifs.js dans Chromium (serveur local, réplique du balisage).
const { chromium } = require('playwright');
const base = process.argv[2];
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? 'OK  ' : 'ÉCHEC'} ${name}${detail ? ' → ' + detail : ''}`);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const navigations = [];
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) navigations.push(f.url()); });

  await page.goto(base + '/products/ondes-noires.html');
  await page.waitForFunction(() => customElements.get('murelle-motifs'));
  const name = () => page.textContent('[data-motif-name]');
  const prefetches = () => page.$$eval('link[rel=prefetch]', (ls) => ls.map((l) => l.getAttribute('href')));

  check('Nom initial', (await name()) === 'Ondes Noires', await name());

  await page.hover('#m2');
  check('Survol : nom du motif survolé', (await name()) === 'Élégance Botanique', await name());
  let pf = await prefetches();
  check('Survol : préchargement, gamme Essentielle (UV) transmise', pf.includes(base + '/products/elegance-botanique?variant=58578750439764'), JSON.stringify(pf));

  await page.mouse.move(600, 600);
  check('Sortie du survol : nom revenu', (await name()) === 'Ondes Noires', await name());

  await page.hover('#m1');
  pf = await prefetches();
  check('Survol du motif courant : aucun préchargement en plus', pf.length === 1, JSON.stringify(pf));

  // Gamme Signature + dimensions valides
  await page.evaluate(() => { document.querySelector('[name=id]').value = '58609638211924'; });
  await page.fill('#w', '400');
  await page.fill('#h', '270');
  await page.hover('#m2');
  pf = await prefetches();
  const expected = '/products/elegance-botanique?variant=58578750472532&largeur=400&hauteur=270';
  check('Survol après saisie : préchargement de l\'URL complète', pf.includes(base + expected), JSON.stringify(pf));

  // Dimension invalide (< 50 cm) : non transmise
  await page.fill('#w', '10');
  const href10 = await page.evaluate(() => { const el = document.querySelector('murelle-motifs'); return el.buildUrl(document.getElementById('m2')); });
  check('Largeur invalide non transmise', href10 === '/products/elegance-botanique?variant=58578750472532&hauteur=270', href10);
  await page.fill('#w', '400');

  // Motif sans même matière : pas de variante forcée
  const href3 = await page.evaluate(() => document.querySelector('murelle-motifs').buildUrl(document.getElementById('m3')));
  check('Matière absente chez la cible : pas de variante imposée', href3 === '/products/foret-brumeuse-stylisee?largeur=400&hauteur=270', href3);

  // Clic sur le motif courant : pas de navigation
  const before = navigations.length;
  await page.click('#m1');
  await page.waitForTimeout(300);
  check('Clic sur le motif courant : reste sur la page', navigations.length === before && page.url().endsWith('/products/ondes-noires.html'), page.url());

  // Clic sur un autre motif : sélection immédiate puis navigation vers la vraie fiche
  await page.route('**/products/elegance-botanique*', (route) => route.fulfill({ contentType: 'text/html', body: '<title>cible</title>ok' }));
  await page.evaluate(() => document.getElementById('m2').addEventListener('click', () => {
    window.__state = { sel: document.getElementById('m2').classList.contains('is-selected'), cur: document.getElementById('m1').classList.contains('is-selected'), name: document.querySelector('[data-motif-name]').textContent, loading: document.querySelector('murelle-motifs').classList.contains('is-loading') };
    sessionStorage.setItem('state', JSON.stringify(window.__state));
  }));
  await Promise.all([page.waitForURL('**/products/elegance-botanique*'), page.click('#m2')]);
  const st = JSON.parse(await page.evaluate(() => sessionStorage.getItem('state')));
  check('Clic : miniature cliquée sélectionnée tout de suite', st.sel && !st.cur && st.loading, JSON.stringify(st));
  check('Clic : nom actualisé', st.name === 'Élégance Botanique', st.name);
  check('Clic : navigation vers la vraie fiche avec gamme + dimensions', page.url() === base + expected, page.url());

  check('Aucune erreur JavaScript', errors.length === 0, errors.join(' | '));
  console.log(results.join('\n'));
  await browser.close();
})();
