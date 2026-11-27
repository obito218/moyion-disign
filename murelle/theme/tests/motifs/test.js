// Test de assets/murelle-motifs.js dans Chromium : pages factices servies par interception.
// Lancer : node murelle/theme/tests/motifs/test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const page = require('./page.js');

const BASE = 'http://murelle.test';
const SCRIPT = path.join(__dirname, '..', '..', 'assets', 'murelle-motifs.js');
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? 'OK   ' : 'ÉCHEC'} ${name}${detail !== undefined ? ' → ' + detail : ''}`);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const tab = await ctx.newPage();
  const errors = [];
  tab.on('pageerror', (e) => errors.push(e.message));
  const productFetches = [];
  let failNext = false;
  let documentLoads = 0;

  await ctx.route(BASE + '/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === '/murelle-motifs.js') return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(SCRIPT, 'utf8') });
    if (url.pathname === '/morph.js') return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(__dirname, 'morph.js'), 'utf8') });
    const m = url.pathname.match(/^\/products\/([a-z-]+)$/);
    if (m) {
      if (req.resourceType() === 'document') documentLoads++;
      else productFetches.push(url.pathname + url.search);
      if (failNext && req.resourceType() !== 'document') return route.fulfill({ status: 500, body: 'erreur' });
      return route.fulfill({ contentType: 'text/html', body: page(m[1], url.searchParams.get('variant')) });
    }
    return route.fulfill({ status: 404, body: '' });
  });

  await tab.goto(BASE + '/products/ondes-noires?variant=32');
  await tab.waitForFunction(() => customElements.get('murelle-motifs'));
  const name = () => tab.textContent('[data-motif-name]');
  const price = () => tab.textContent('[data-motif-price]');

  check('Nom initial', (await name()) === 'Ondes Noires', await name());
  check('Prix initial (gamme Signature)', (await price()) === '45,00 € / m² · Signature', await price());

  await tab.hover('#m-terre-graphique');
  check('Survol : nom du motif visé', (await name()) === 'Terre Graphique', await name());
  check('Survol : prix du motif visé dans la gamme en cours', (await price()) === '45,00 € / m² · Signature', await price());
  await tab.waitForTimeout(150);
  check('Survol : fiche préchargée avec la même gamme', productFetches.includes('/products/terre-graphique?variant=12'), JSON.stringify(productFetches));

  await tab.mouse.move(700, 700);
  check('Fin du survol : nom revenu', (await name()) === 'Ondes Noires', await name());

  // Changement de gamme : le prix suit
  await tab.evaluate(() => { const i = document.querySelector('[name=id]'); i.value = '33'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await tab.waitForTimeout(50);
  check('Gamme Adhésive choisie : prix actualisé', (await price()) === '53,00 € / m² · Adhésive', await price());

  // Dimensions saisies puis clic : remplacement sur place
  await tab.fill('#w', '400');
  await tab.fill('#h', '270');
  const initsBefore = await tab.evaluate(() => window.__configInits);
  await tab.click('#m-ondes-sauge');
  await tab.waitForFunction(() => document.getElementById('product-title').textContent === 'Ondes Sauge');
  await tab.waitForTimeout(50);
  check('Clic : aucun rechargement de page', documentLoads === 1, `chargements de page : ${documentLoads}`);
  check('Clic : adresse mise à jour (motif, gamme, dimensions)', tab.url() === BASE + '/products/ondes-sauge?variant=23&largeur=400&hauteur=270', tab.url());
  check('Clic : titre de l\'onglet', (await tab.title()) === 'Ondes Sauge – MURELLE', await tab.title());
  check('Clic : motif sélectionné et marqué courant', await tab.evaluate(() => { const a = document.querySelector('#m-ondes-sauge'); return a.classList.contains('is-selected') && a.getAttribute('aria-current') === 'page' && document.querySelectorAll('.m-motif.is-selected').length === 1; }));
  check('Clic : nom et prix du nouveau motif', (await name()) === 'Ondes Sauge' && (await price()) === '53,00 € / m² · Adhésive', `${await name()} | ${await price()}`);
  check('Clic : formulaire d\'achat sur la variante du nouveau motif', (await tab.inputValue('[name=id]')) === '23', await tab.inputValue('[name=id]'));
  const inits = await tab.evaluate(() => window.__configInits);
  check('Clic : configurateur relancé avec les données du nouveau motif', inits > initsBefore && (await tab.getAttribute('murelle-configurator', 'data-seen')) === '23', `${initsBefore} → ${inits}`);
  check('Clic : dimensions conservées', (await tab.inputValue('#w')) === '400' && (await tab.inputValue('#h')) === '270', `${await tab.inputValue('#w')} × ${await tab.inputValue('#h')}`);
  check('Clic : le focus reste sur le sélecteur', await tab.evaluate(() => document.activeElement && document.activeElement.id === 'm-ondes-sauge'));

  // Le nouveau sélecteur fonctionne à son tour (survol, clic)
  await tab.hover('#m-ondes-noires');
  check('Après remplacement : survol actif', (await name()) === 'Ondes Noires', await name());
  await tab.click('#m-terre-graphique');
  await tab.waitForFunction(() => document.getElementById('product-title').textContent === 'Terre Graphique');
  check('Deuxième changement sur place', tab.url() === BASE + '/products/terre-graphique?variant=13&largeur=400&hauteur=270' && documentLoads === 1, tab.url());

  // Clic sur le motif courant : rien ne se passe
  const fetchesBefore = productFetches.length;
  await tab.click('#m-terre-graphique');
  await tab.waitForTimeout(150);
  check('Clic sur le motif courant : rien ne change', productFetches.length === fetchesBefore && tab.url().includes('terre-graphique'), tab.url());

  // Erreur réseau : navigation classique vers la même adresse
  failNext = true;
  await Promise.all([tab.waitForURL('**/products/ondes-noires**'), tab.click('#m-ondes-noires')]);
  failNext = false;
  check('Erreur de chargement : repli sur la navigation classique', documentLoads === 2 && tab.url() === BASE + '/products/ondes-noires?variant=33&largeur=400&hauteur=270', `${documentLoads} | ${tab.url()}`);

  check('Aucune erreur JavaScript', errors.length === 0, errors.join(' | '));
  console.log(results.join('\n'));
  await browser.close();
  process.exit(results.some((r) => r.startsWith('ÉCHEC')) ? 1 : 0);
})();
