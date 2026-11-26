if (!customElements.get('murelle-configurator')) {
  /* Dimensions mémorisées pour la session (écrites par l'estimateur de l'accueil et par ce configurateur). */
  const MURELLE_DIMS_KEY = 'murelle:dimensions';
  const readDims = () => {
    try {
      const d = JSON.parse(sessionStorage.getItem(MURELLE_DIMS_KEY) || 'null');
      return d && Number.isInteger(d.largeur) && Number.isInteger(d.hauteur) ? d : null;
    } catch (err) { return null; }
  };
  const writeDims = (largeur, hauteur) => {
    if (!Number.isInteger(largeur) || !Number.isInteger(hauteur)) return;
    try {
      const prev = readDims() || {};
      if (prev.largeur === largeur && prev.hauteur === hauteur) return;
      sessionStorage.setItem(MURELLE_DIMS_KEY, JSON.stringify({ largeur, hauteur, date: Date.now() }));
    } catch (err) { /* stockage indisponible */ }
  };

  class MurelleConfigurator extends HTMLElement {
    connectedCallback() {
      this.prices = JSON.parse(this.querySelector('[data-prices]').textContent);
      const gammesEl = this.querySelector('[data-gammes]');
      this.gammes = gammesEl ? JSON.parse(gammesEl.textContent) : {};
      this.variant = this.dataset.variant;
      this.strip = parseFloat(this.dataset.strip) || 50;
      this.margin = parseFloat(this.dataset.margin) || 0;
      this.minBilled = parseInt(this.dataset.minBilled, 10) || 1;
      this.money = new Intl.NumberFormat(this.dataset.locale || 'fr', { style: 'currency', currency: this.dataset.currency || 'EUR' });
      this.num = new Intl.NumberFormat(this.dataset.locale || 'fr', { maximumFractionDigits: 2 });
      this.w = this.querySelector('[data-w]');
      this.h = this.querySelector('[data-h]');
      const params = new URLSearchParams(location.search);
      if (params.get('largeur')) this.w.value = params.get('largeur');
      if (params.get('hauteur')) this.h.value = params.get('hauteur');
      if (!params.get('largeur') && !params.get('hauteur') && !this.w.value && !this.h.value) {
        const stored = readDims();
        if (stored) {
          this.w.value = String(stored.largeur);
          this.h.value = String(stored.hauteur);
        }
      }
      this.onInput = () => this.update();
      this.w.addEventListener('input', this.onInput);
      this.h.addEventListener('input', this.onInput);
      this.onVariant = (e) => {
        const id = e.detail && e.detail.resource && e.detail.resource.id;
        if (id) this.variant = String(id);
        setTimeout(() => this.update(), 0);
      };
      document.addEventListener('variant:update', this.onVariant);
      this.update();
    }
    disconnectedCallback() {
      document.removeEventListener('variant:update', this.onVariant);
    }
    update() {
      const W = parseFloat(this.w.value);
      const H = parseFloat(this.h.value);
      const valid = W >= parseFloat(this.w.min) && W <= parseFloat(this.w.max) && H >= parseFloat(this.h.min) && H <= parseFloat(this.h.max);
      const cents = this.prices[this.variant];
      const set = (sel, v) => { this.querySelector(sel).textContent = v; };
      if (cents != null) set('[data-o-rate]', this.money.format(cents / 100) + ' / m²');
      const gamme = this.gammes[this.variant];
      const pGamme = this.querySelector('[data-p-gamme]');
      if (gamme) {
        if (pGamme) pGamme.value = gamme;
        const oGamme = this.querySelector('[data-o-gamme]');
        if (oGamme) oGamme.textContent = gamme;
      }
      const pStrips = this.querySelector('[data-p-strips]');
      const pBilled = this.querySelector('[data-p-billed]');
      let qty = this.minBilled;
      if (valid) {
        const strips = Math.ceil((W + this.margin) / this.strip);
        qty = Math.max(this.minBilled, Math.ceil((W * H) / 10000 - 1e-9));
        set('[data-o-strips]', strips + ' × ' + this.strip + ' cm');
        set('[data-o-wall]', this.num.format((W * H) / 10000) + ' m²');
        set('[data-o-billed]', qty + ' m²');
        set('[data-o-total]', cents != null ? this.money.format((qty * cents) / 100) : '—');
        pStrips.value = strips + ' × ' + this.strip + ' cm';
        pBilled.value = qty + ' m²';
        pStrips.disabled = false;
        pBilled.disabled = false;
        this.drawPlan(W, H, strips);
        writeDims(W, H);
      } else {
        ['[data-o-strips]', '[data-o-wall]', '[data-o-billed]', '[data-o-total]'].forEach((s) => set(s, '—'));
        pStrips.disabled = true;
        pBilled.disabled = true;
        this.drawPlan(320, 250, Math.ceil((320 + this.margin) / this.strip), true);
      }
      const scope = this.closest('.shopify-section') || document;
      const cardLabel = this.dataset.labelCardTotal ? this.dataset.labelCardTotal + ' : ' : '';
      scope.querySelectorAll('[data-gamme-total]').forEach((el) => {
        const c = this.prices[el.dataset.variant];
        el.textContent = valid && c != null ? cardLabel + this.money.format((qty * c) / 100) : '';
      });
      const form = document.getElementById(this.dataset.formId);
      const q = form && form.querySelector('input[name="quantity"]');
      if (q) {
        q.max = '';
        q.value = String(qty);
        q.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    drawPlan(W, H, strips, ghost) {
      const g = this.querySelector('[data-plan-wall]');
      const maxW = 330, maxH = 170;
      const s = Math.min(maxW / W, maxH / H);
      const w = W * s, h = H * s;
      const x = 40 + (maxW - w) / 2, y = 20 + (maxH - h) / 2;
      const stripPx = this.strip * s;
      let lines = '';
      for (let i = 1; i < strips; i++) {
        const lx = x + i * stripPx;
        if (lx < x + w) lines += `<line x1="${lx}" y1="${y}" x2="${lx}" y2="${y + h}" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="3 3"/>`;
      }
      const op = ghost ? '.35' : '1';
      const tick = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor"/>`;
      g.innerHTML = `
        <g opacity="${op}">
          <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9CAF88" fill-opacity=".28" stroke="currentColor"/>
          ${lines}
          ${tick(x, y + h + 14, x + w, y + h + 14)}${tick(x, y + h + 9, x, y + h + 19)}${tick(x + w, y + h + 9, x + w, y + h + 19)}
          <text x="${x + w / 2}" y="${y + h + 32}" text-anchor="middle">${this.num.format(W)} cm</text>
          ${tick(x - 14, y, x - 14, y + h)}${tick(x - 19, y, x - 9, y)}${tick(x - 19, y + h, x - 9, y + h)}
          <text x="${x - 20}" y="${y + h / 2}" text-anchor="end" dominant-baseline="middle">${this.num.format(H)}</text>
        </g>`;
    }
  }
  customElements.define('murelle-configurator', MurelleConfigurator);
}
