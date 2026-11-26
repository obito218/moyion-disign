// Tests de l'estimateur « Le sur-mesure » (vrai script, réplique du balisage) et du relais vers la fiche produit.
const { chromium } = require('playwright');
const base = process.argv[2];
const out = process.argv[3];
const res = [];
const ok = (name, cond, detail = '') => res.push(`${cond ? 'OK   ' : 'ÉCHEC'} ${name}${detail ? ' → ' + detail : ''}`);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: 'fr-FR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/collections/all' || u.pathname.startsWith('/products/')) {
      return route.continue({ url: base + u.pathname });
    }
    return route.continue();
  });
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => customElements.get('murelle-estimate'));

  const read = () => page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    return {
      wall: q('[data-o-wall]').textContent, billed: q('[data-o-billed]').textContent,
      prices: [...document.querySelectorAll('[data-rate]')].map((e) => e.textContent.replace(/ | /g, ' ')),
      errW: q('[data-error="w"]').hidden ? '' : q('[data-error="w"]').textContent,
      errH: q('[data-error="h"]').hidden ? '' : q('[data-error="h"]').textContent,
      ready: q('murelle-estimate').classList.contains('is-ready'),
    };
  });
  const setDims = async (w, h) => {
    await page.fill('#EstW', w); await page.fill('#EstH', h);
    await page.click('.m-est__lead'); // blur
  };

  // 1. Valeurs par défaut
  let r = await read();
  ok('Défaut 320 × 250 : mur 8 m², facturé 8 m²', r.wall === '8 m²' && r.billed === '8 m²', JSON.stringify(r));
  ok('Défaut : 296 / 360 / 424 €', r.prices.join('|') === '296,00 €|360,00 €|424,00 €', r.prices.join(' | '));
  ok('Prix au m² affichés au format français', (await page.textContent('[data-rate-label="4500"]')).replace(/ | /g, ' ') === '45,00 € / m²');

  // 2. Cas demandés
  const cases = [
    ['100', '100', { wall: '1 m²', billed: '1 m²', prices: '37,00 €|45,00 €|53,00 €' }],
    ['400', '300', { wall: '12 m²', billed: '12 m²', prices: '444,00 €|540,00 €|636,00 €' }],
    ['260', '250', { wall: '6,5 m²', billed: '7 m²', prices: '259,00 €|315,00 €|371,00 €' }],
    ['301', '200', { wall: '6,02 m²', billed: '7 m²', prices: '259,00 €|315,00 €|371,00 €' }],
  ];
  for (const [w, h, exp] of cases) {
    await setDims(w, h); r = await read();
    ok(`${w} × ${h}`, r.wall === exp.wall && r.billed === exp.billed && r.prices.join('|') === exp.prices,
      `mur ${r.wall}, facturé ${r.billed}, ${r.prices.join(' | ')}`);
  }
  // Mise à jour instantanée (sans quitter le champ)
  await page.fill('#EstW', '320'); await page.fill('#EstH', '250');
  r = await read(); ok('Mise à jour instantanée à la frappe', r.billed === '8 m²' && r.prices[1] === '360,00 €');

  const invalid = [
    ['', '250', 'w', 'Largeur vide'], ['320', '', 'h', 'Hauteur vide'], ['-320', '250', 'w', 'Largeur négative'],
    ['0', '250', 'w', 'Largeur à zéro'], ['abc', '250', 'w', 'Lettres'], ['320,5', '250', 'w', 'Décimale'],
    ['2500', '250', 'w', 'Largeur trop grande'], ['320', '20', 'h', 'Hauteur trop petite'],
  ];
  for (const [w, h, field, name] of invalid) {
    await setDims(w, h); r = await read();
    const msg = field === 'w' ? r.errW : r.errH;
    ok(`${name} : message + aucune donnée`, Boolean(msg) && !r.ready && r.wall === '—' && r.prices.every((p) => p === '—'), msg);
  }
  // Message de format immédiat (pendant la frappe), message de plage seulement après sortie du champ
  await page.fill('#EstW', ''); await page.fill('#EstH', '250');
  await page.focus('#EstW'); await page.keyboard.type('3');
  r = await read(); ok('Pas de message pendant la frappe d\'un nombre partiel (« 3 »)', r.errW === '', r.errW);
  await page.keyboard.type('x');
  r = await read(); ok('Message immédiat si une lettre est tapée', r.errW !== '', r.errW);

  // 3. Bouton : invalide → reste sur la page, alerte, focus
  await setDims('-5', '250');
  await page.click('[data-cta]'); await page.waitForTimeout(150);
  const stay = await page.evaluate(() => ({ path: location.pathname, alert: document.querySelector('[data-alert]').hidden ? '' : document.querySelector('[data-alert]').textContent, focus: document.activeElement.id }));
  ok('Bouton avec dimensions invalides : pas de redirection, alerte, focus sur le champ', stay.path === '/index.html' && stay.alert !== '' && stay.focus === 'EstW', JSON.stringify(stay));

  // 4. Bouton : valide → redirection + mémorisation
  await setDims('400', '300');
  await Promise.all([page.waitForURL('**/collections/all**'), page.click('[data-cta]')]);
  const u = new URL(page.url());
  ok('Redirection vers Tous les motifs avec les dimensions', u.pathname === '/collections/all' && u.searchParams.get('largeur') === '400' && u.searchParams.get('hauteur') === '300', u.pathname + u.search);
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('murelle:dimensions')));
  ok('Dimensions et calcul mémorisés', stored.largeur === 400 && stored.hauteur === 300 && stored.surfaceFacturee === 12 && stored.surfaceMur === 12, JSON.stringify(stored));

  // 5. Fiche produit ouverte depuis la collection (sans paramètres) : dimensions reprises
  await Promise.all([page.waitForURL('**/products/ondes-noires'), page.click('#p')]);
  await page.waitForFunction(() => customElements.get('murelle-configurator'));
  const prod = await page.evaluate(() => ({ w: document.querySelector('#w').value, h: document.querySelector('#h').value, total: document.querySelector('#total').textContent.replace(/ | /g, ' '), qty: document.querySelector('[name=quantity]').value }));
  ok('Fiche : dimensions reprises sans ressaisie, total cohérent (12 m² × 45 €)', prod.w === '400' && prod.h === '300' && prod.total === '540,00 €' && prod.qty === '12', JSON.stringify(prod));
  // Modification sur la fiche → mémorisée → retour à l'accueil pré-rempli
  await page.fill('#w', '280'); await page.fill('#h', '260');
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => customElements.get('murelle-estimate'));
  const back = await page.evaluate(() => [document.querySelector('#EstW').value, document.querySelector('#EstH').value]);
  ok('Accueil pré-rempli avec les dernières dimensions saisies', back.join('×') === '280×260', back.join('×'));
  // URL prioritaire sur la mémoire
  await page.goto(base + '/products/ondes-noires?largeur=500&hauteur=240');
  await page.waitForFunction(() => customElements.get('murelle-configurator'));
  const prio = await page.evaluate(() => [document.querySelector('#w').value, document.querySelector('#h').value]);
  ok('Paramètres d\'adresse prioritaires sur la mémoire', prio.join('×') === '500×240', prio.join('×'));

  // 6. Rechargement dans l'éditeur de thème : section retirée puis réinsérée
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => customElements.get('murelle-estimate'));
  const reload = await page.evaluate(() => {
    const el = document.querySelector('murelle-estimate');
    const html = el.outerHTML; const parent = el.parentNode;
    el.remove();
    parent.insertAdjacentHTML('afterbegin', html);
    const fresh = document.querySelector('murelle-estimate');
    const w = fresh.querySelector('#EstW'); w.value = '320'; w.dispatchEvent(new Event('input', { bubbles: true }));
    const h = fresh.querySelector('#EstH'); h.value = '250'; h.dispatchEvent(new Event('input', { bubbles: true }));
    return fresh.querySelector('[data-o-billed]').textContent;
  });
  ok('Section réinsérée (éditeur de thème) : calcul actif', reload === '8 m²', reload);

  // 7. Responsive : pas de débordement, champs lisibles
  for (const [name, width, height] of [['mobile', 390, 844], ['tablette', 768, 1024], ['ordinateur', 1280, 900]]) {
    await page.setViewportSize({ width, height });
    await page.fill('#EstW', '320'); await page.fill('#EstH', '250');
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const tool = r('murelle-estimate');
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        inputW: Math.round(r('#EstW').width), inputH: Math.round(r('#EstH').width),
        cta: Math.round(r('[data-cta]').width), tool: Math.round(tool.width),
        amountsInside: [...document.querySelectorAll('.m-est__amount')].every((a) => a.getBoundingClientRect().right <= tool.right + 0.5),
        fontSize: getComputedStyle(document.querySelector('#EstW')).fontSize,
      };
    });
    ok(`${name} ${width}px : aucun débordement, champs ≥ 90 px, prix dans le panneau, police ≥ 16 px`, m.overflow <= 0 && m.inputW >= 90 && m.inputH >= 90 && m.amountsInside && parseFloat(m.fontSize) >= 16, JSON.stringify(m));
    const box = await page.locator('.m-est__aside').boundingBox();
    await page.screenshot({ path: `${out}/estimateur-${name}.png`, clip: { x: 0, y: Math.max(0, box.y - 20), width, height: Math.min(box.height + 40, 1500) } });
  }
  // État d'erreur en capture (mobile)
  await page.setViewportSize({ width: 390, height: 844 });
  await setDims('-5', '250'); await page.click('[data-cta]');
  const box = await page.locator('.m-est__fields').boundingBox();
  await page.screenshot({ path: `${out}/estimateur-erreur-mobile.png`, clip: { x: 0, y: box.y - 120, width: 390, height: 360 } });

  ok('Aucune erreur JavaScript', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n'));
  await browser.close();
})();
