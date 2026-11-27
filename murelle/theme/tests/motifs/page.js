// Génère une page produit factice : <main> avec le sélecteur (même balisage que
// blocks/murelle-motifs.liquid), un configurateur témoin et un formulaire d'achat.
const MOTIFS = [
  { handle: 'terre-graphique', title: 'Terre Graphique', ids: [11, 12, 13] },
  { handle: 'ondes-sauge', title: 'Ondes Sauge', ids: [21, 22, 23] },
  { handle: 'ondes-noires', title: 'Ondes Noires', ids: [31, 32, 33] },
];
const GAMMES = ['Essentielle', 'Signature', 'Adhésive'];
const PRICES = ['37,00 €', '45,00 €', '53,00 €'];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

module.exports = function page(handle, variantId) {
  const cur = MOTIFS.find((m) => m.handle === handle);
  const vid = variantId && cur.ids.includes(Number(variantId)) ? Number(variantId) : cur.ids[0];
  const g = GAMMES[cur.ids.indexOf(vid)];
  const items = MOTIFS.map((m) => {
    const opts = JSON.stringify(Object.fromEntries(GAMMES.map((x, i) => [x, m.ids[i]])));
    const prices = JSON.stringify(Object.fromEntries(GAMMES.map((x, i) => [x, PRICES[i]])));
    const isCur = m.handle === handle;
    return `<li><a id="m-${m.handle}" class="m-motif${isCur ? ' is-selected' : ''}" href="/products/${m.handle}" data-url="/products/${m.handle}" data-title="${m.title}" data-options="${esc(opts)}" data-prices="${esc(prices)}"${isCur ? ' aria-current="page"' : ''} style="display:inline-block;width:72px;height:72px;background:#ccc">${m.title}</a></li>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${cur.title} – MURELLE</title>
<script type="importmap">{"imports":{"@theme/morph":"/morph.js"}}</script>

</head><body><main>
<div class="shopify-section" id="shopify-section-main">
  <h1 id="product-title">${cur.title}</h1>
  <murelle-motifs class="m-motifs" data-form-id="BuyButtons-ProductForm-main" data-category="design-et-inspiration">
    <div class="m-motifs__head"><p class="m-motifs__legend">Choisissez votre motif</p>
      <div class="m-motifs__current"><p class="m-motifs__name" data-motif-name>${cur.title}</p><p class="m-motifs__price" data-motif-price>${PRICES[cur.ids.indexOf(vid)]} / m² · ${g}</p></div></div>
    <ul class="m-motifs__list" role="list">${items}</ul>
  </murelle-motifs>
  <murelle-configurator data-variant="${vid}">
    <input type="number" min="50" max="2000" required data-w id="w">
    <input type="number" min="50" max="500" required data-h id="h">
  </murelle-configurator>
  <form id="BuyButtons-ProductForm-main"><input type="hidden" name="id" value="${vid}"></form>
</div></main>
<script>if(!customElements.get('murelle-configurator')){customElements.define('murelle-configurator',class extends HTMLElement{connectedCallback(){window.__configInits=(window.__configInits||0)+1;this.dataset.seen=this.dataset.variant;const p=new URLSearchParams(location.search);const w=this.querySelector('[data-w]');const h=this.querySelector('[data-h]');if(p.get('largeur'))w.value=p.get('largeur');if(p.get('hauteur'))h.value=p.get('hauteur');}});}</script>
<script type="module" src="/murelle-motifs.js"></script>
</body></html>`;
};
