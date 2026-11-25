/* Estimateur « Le sur-mesure » (accueil).
   Règles lues dans les attributs de la section (mêmes valeurs que le configurateur des fiches) :
   lés = ⌈(largeur + marge) / largeur du lé⌉ ; surface imprimée = lés × lé × (hauteur + marge) ;
   surface facturée = max(minimum, surface imprimée arrondie au m² supérieur) ; prix = surface facturée × prix au m² de la variante.
   Le bouton vérifie les dimensions, les mémorise (sessionStorage « murelle:dimensions ») et ouvre la page
   de destination avec ?largeur=&hauteur= ; le configurateur des fiches relit ces valeurs. */
if (!customElements.get('murelle-estimate')) {
  const STORAGE_KEY = 'murelle:dimensions';

  const readStored = () => {
    try {
      const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (data && Number.isInteger(data.largeur) && Number.isInteger(data.hauteur)) return data;
    } catch (err) { /* stockage indisponible : on continue sans */ }
    return null;
  };
  const writeStored = (data) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch (err) { return false; }
  };
  const number = (value, fallback) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  };

  class MurelleEstimate extends HTMLElement {
    connectedCallback() {
      this.abort = new AbortController();
      const on = (el, type, fn) => el && el.addEventListener(type, fn, { signal: this.abort.signal });
      const d = this.dataset;
      this.rules = {
        strip: number(d.strip, 50),
        margin: Math.max(0, number(d.margin, 0)),
        minBilled: Math.max(0, number(d.minBilled, 1)),
      };
      const locale = d.locale || 'fr-FR';
      this.money = new Intl.NumberFormat(locale, { style: 'currency', currency: d.currency || 'EUR' });
      this.area = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
      this.fields = [...this.querySelectorAll('[data-dim]')].map((input) => ({
        input,
        key: input.dataset.dim,
        label: input.dataset.label || '',
        min: number(input.dataset.min, 1),
        max: number(input.dataset.max, Infinity),
        box: input.closest('[data-field]'),
        error: this.querySelector(`[data-error="${input.dataset.dim}"]`),
        touched: false,
      }));
      this.cta = this.querySelector('[data-cta]');
      this.alert = this.querySelector('[data-alert]');

      const stored = readStored();
      if (stored) {
        const byKey = { w: stored.largeur, h: stored.hauteur };
        this.fields.forEach((f) => { if (byKey[f.key] != null) f.input.value = String(byKey[f.key]); });
      }
      this.fields.forEach((f) => {
        const hint = f.box && f.box.querySelector('[data-hint]');
        if (hint) hint.textContent = `Entre ${this.area.format(f.min)} et ${this.area.format(f.max)} cm`;
      });
      this.querySelectorAll('[data-rate-label]').forEach((el) => {
        el.textContent = this.money.format(number(el.dataset.rateLabel, 0) / 100) + ' / m²';
      });

      this.fields.forEach((f) => {
        // Pendant la frappe : seules les erreurs de format s'affichent ; les erreurs de valeur attendent la sortie du champ.
        on(f.input, 'input', () => { f.touched = false; this.hideAlert(); this.update(); });
        on(f.input, 'blur', () => { f.touched = true; this.update(); });
        on(f.input, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.go(e); } });
      });
      on(this.cta, 'click', (e) => this.go(e));
      this.update();
    }

    disconnectedCallback() {
      if (this.abort) this.abort.abort();
    }

    /* Lit une dimension sans l'arrondir : entier strictement positif, dans les limites. */
    parse(f) {
      const raw = f.input.value.replace(/\s+/g, '');
      const max = this.area.format(f.max);
      if (raw === '') return { empty: true, error: `Indiquez la ${f.label} de votre mur, en centimètres.` };
      if (/^[-−]/.test(raw)) return { format: true, error: `La ${f.label} doit être un nombre positif.` };
      if (/[^0-9.,]/.test(raw)) return { format: true, error: 'Saisissez uniquement des chiffres, en centimètres.' };
      if (/[.,]/.test(raw)) return { format: true, error: 'Indiquez un nombre entier de centimètres, par exemple 320.' };
      const value = parseInt(raw, 10);
      if (value === 0) return { error: `La ${f.label} ne peut pas être égale à zéro.` };
      if (value < f.min || value > f.max) {
        return { error: `La ${f.label} doit être comprise entre ${this.area.format(f.min)} et ${max} cm.` };
      }
      return { value };
    }

    compute(W, H) {
      const { strip, margin, minBilled } = this.rules;
      const strips = Math.ceil((W + margin) / strip);
      const printed = strips * (strip / 100) * ((H + margin) / 100);
      const billed = Math.max(minBilled, Math.ceil(printed - 1e-9));
      return { wall: (W * H) / 10000, strips, printed, billed };
    }

    update() {
      const parsed = this.fields.map((f) => ({ f, r: this.parse(f) }));
      parsed.forEach(({ f, r }) => {
        const show = Boolean(r.error) && (r.format || f.touched);
        f.box && f.box.classList.toggle('is-invalid', show);
        f.input.setAttribute('aria-invalid', show ? 'true' : 'false');
        if (f.error) {
          f.error.textContent = show ? r.error : '';
          f.error.hidden = !show;
        }
      });
      const valid = parsed.every(({ r }) => r.value != null);
      this.classList.toggle('is-ready', valid);
      const set = (sel, text) => this.querySelectorAll(sel).forEach((el) => { el.textContent = text; });
      const summary = this.querySelector('[data-summary]');
      if (!valid) {
        ['[data-o-wall]', '[data-o-strips]', '[data-o-printed]', '[data-o-billed]'].forEach((s) => set(s, '—'));
        this.querySelectorAll('[data-rate]').forEach((el) => { el.textContent = '—'; });
        if (summary) summary.textContent = '';
        this.state = { valid: false, parsed };
        return this.state;
      }
      const W = parsed.find(({ f }) => f.key === 'w').r.value;
      const H = parsed.find(({ f }) => f.key === 'h').r.value;
      const c = this.compute(W, H);
      set('[data-o-wall]', this.area.format(c.wall) + ' m²');
      set('[data-o-strips]', String(c.strips));
      set('[data-o-printed]', this.area.format(c.printed) + ' m²');
      set('[data-o-billed]', c.billed + ' m²');
      this.querySelectorAll('[data-rate]').forEach((el) => {
        el.textContent = this.money.format((c.billed * number(el.dataset.rate, 0)) / 100);
      });
      if (summary) {
        summary.textContent = (summary.dataset.template || '').replace('[lés]', c.strips).replace('[m2]', c.billed);
      }
      this.state = { valid: true, W, H, ...c, parsed };
      return this.state;
    }

    go(event) {
      if (event) event.preventDefault();
      this.fields.forEach((f) => { f.touched = true; });
      const s = this.update();
      if (!s.valid) {
        const first = s.parsed.find(({ r }) => r.value == null);
        this.showAlert('Vérifiez les dimensions de votre mur pour continuer.');
        if (first) first.f.input.focus();
        return;
      }
      let target;
      try {
        target = new URL(this.dataset.url || '', window.location.origin);
        if (target.origin !== window.location.origin) throw new Error('destination externe');
        target.searchParams.set('largeur', String(s.W));
        target.searchParams.set('hauteur', String(s.H));
      } catch (err) {
        this.showAlert("La sélection des motifs ne peut pas s'ouvrir. Réessayez, ou contactez-nous.");
        return;
      }
      writeStored({
        largeur: s.W,
        hauteur: s.H,
        surfaceMur: Math.round(s.wall * 100) / 100,
        les: s.strips,
        surfaceImprimee: Math.round(s.printed * 100) / 100,
        surfaceFacturee: s.billed,
        regles: this.rules,
        date: Date.now(),
      });
      window.location.assign(target.pathname + target.search + target.hash);
    }

    showAlert(text) {
      if (!this.alert) return;
      this.alert.textContent = text;
      this.alert.hidden = false;
    }

    hideAlert() {
      if (this.alert && !this.alert.hidden) {
        this.alert.hidden = true;
        this.alert.textContent = '';
      }
    }
  }
  customElements.define('murelle-estimate', MurelleEstimate);
}
