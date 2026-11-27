/* « Choisissez votre motif » : tous les motifs de la catégorie du produit.
   Survol / focus / toucher : nom et prix (gamme en cours) du motif visé, fiche préchargée.
   Clic : la fiche du motif choisi remplace la fiche actuelle sans recharger la page,
   comme les listes combinées d'Horizon (morph de <main>), en gardant la gamme et les
   dimensions. En cas d'échec, navigation classique vers la même adresse. */
import { morph } from '@theme/morph';

/* Éléments qui lisent leurs données une seule fois (connectedCallback) :
   recréés après le remplacement pour repartir des données du nouveau motif. */
const REINIT = 'murelle-configurator, murelle-motifs, product-recommendations';

const readJSON = (el, key) => {
  try { return JSON.parse((el && el.dataset[key]) || '{}'); } catch (err) { return {}; }
};

if (!customElements.get('murelle-motifs')) {
  class MurelleMotifs extends HTMLElement {
    connectedCallback() {
      this.links = Array.from(this.querySelectorAll('a.m-motif'));
      this.current = this.querySelector('a.m-motif[aria-current]');
      this.nameEl = this.querySelector('[data-motif-name]');
      this.priceEl = this.querySelector('[data-motif-price]');
      this.pages = new Map();
      this.pending = false;
      this.onIntent = (e) => this.intent(e.currentTarget);
      this.onLeave = () => { if (!this.pending) this.show(this.current); };
      this.onClick = (e) => this.select(e);
      this.onVariant = () => setTimeout(() => { if (!this.pending) this.show(this.current); }, 0);
      this.links.forEach((a) => {
        a.addEventListener('pointerenter', this.onIntent);
        a.addEventListener('focus', this.onIntent);
        a.addEventListener('touchstart', this.onIntent, { passive: true });
        a.addEventListener('pointerleave', this.onLeave);
        a.addEventListener('blur', this.onLeave);
        a.addEventListener('click', this.onClick);
      });
      document.addEventListener('variant:update', this.onVariant);
      document.addEventListener('change', this.onVariant);
      this.show(this.current);
    }

    disconnectedCallback() {
      document.removeEventListener('variant:update', this.onVariant);
      document.removeEventListener('change', this.onVariant);
    }

    get form() {
      return document.getElementById(this.dataset.formId);
    }

    /* Gamme en cours (« Essentielle », « Signature »…), lue dans le formulaire d'achat. */
    gamme() {
      const input = this.form && this.form.querySelector('[name="id"]');
      const id = input ? String(input.value) : new URLSearchParams(window.location.search).get('variant');
      const mine = readJSON(this.current, 'options');
      return Object.keys(mine).find((k) => String(mine[k]) === id) || Object.keys(mine)[0];
    }

    show(a) {
      if (!a) return;
      if (this.nameEl) this.nameEl.textContent = a.dataset.title;
      if (this.priceEl) {
        const g = this.gamme();
        const price = readJSON(a, 'prices')[g];
        if (price) this.priceEl.textContent = `${price} / m² · ${g}`;
      }
    }

    intent(a) {
      this.show(a);
      if (a === this.current) return;
      a.href = this.buildUrl(a);
      this.prefetch(a.href);
    }

    buildUrl(a) {
      const url = new URL(a.dataset.url, window.location.origin);
      const target = readJSON(a, 'options');
      const g = this.gamme();
      if (g && target[g]) url.searchParams.set('variant', target[g]);
      const scope = this.closest('.shopify-section') || document;
      const w = scope.querySelector('murelle-configurator [data-w]');
      const h = scope.querySelector('murelle-configurator [data-h]');
      if (w && w.value && w.checkValidity()) url.searchParams.set('largeur', w.value);
      if (h && h.value && h.checkValidity()) url.searchParams.set('hauteur', h.value);
      return url.pathname + url.search;
    }

    page(href) {
      if (!this.pages.has(href)) {
        const p = fetch(href, { credentials: 'same-origin' }).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        });
        p.catch(() => this.pages.delete(href));
        this.pages.set(href, p);
      }
      return this.pages.get(href);
    }

    prefetch(href) {
      const c = navigator.connection;
      if (c && c.saveData) return;
      this.page(href).catch(() => {});
    }

    async select(e) {
      const a = e.currentTarget;
      if (a === this.current) { e.preventDefault(); return; }
      a.href = this.buildUrl(a);
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
      e.preventDefault();
      const href = a.getAttribute('href');
      this.pending = true;
      this.links.forEach((l) => l.classList.toggle('is-selected', l === a));
      this.classList.add('is-loading');
      this.show(a);
      try {
        const html = await this.page(href);
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const main = document.querySelector('main');
        const newMain = doc.querySelector('main');
        if (!main || !newMain || !newMain.querySelector('murelle-motifs')) throw new Error('Fiche inattendue');
        doc.querySelector('overflow-list[defer]')?.removeAttribute('defer');
        history.replaceState(history.state, '', href);
        morph(main, newMain);
        if (doc.title) document.title = doc.title;
        main.querySelectorAll(REINIT).forEach((el) => el.replaceWith(el.cloneNode(true)));
        const selected = document.querySelector('murelle-motifs a.m-motif[aria-current]');
        if (selected) selected.focus({ preventScroll: true });
      } catch (err) {
        window.location.assign(href);
      }
    }
  }
  customElements.define('murelle-motifs', MurelleMotifs);
}
