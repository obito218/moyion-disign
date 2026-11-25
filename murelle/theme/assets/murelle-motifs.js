/* « Choisissez votre motif » : chaque miniature est un lien vers la vraie fiche.
   Au survol / focus / toucher : nom affiché et page préchargée. Au clic : la gamme
   (même valeur de Matière) et les dimensions saisies sont transmises dans l'URL. */
if (!customElements.get('murelle-motifs')) {
  class MurelleMotifs extends HTMLElement {
    connectedCallback() {
      this.links = Array.from(this.querySelectorAll('a.m-motif'));
      this.current = this.querySelector('a.m-motif[aria-current]');
      this.nameEl = this.querySelector('[data-motif-name]');
      this.currentName = this.nameEl ? this.nameEl.textContent : '';
      this.prefetched = new Set();
      this.pending = false;
      this.onIntent = (e) => this.intent(e.currentTarget);
      this.onLeave = () => { if (!this.pending) this.showName(this.currentName); };
      this.onClick = (e) => this.select(e);
      this.onPageShow = (e) => { if (e.persisted) this.reset(); };
      this.links.forEach((a) => {
        a.addEventListener('pointerenter', this.onIntent);
        a.addEventListener('focus', this.onIntent);
        a.addEventListener('touchstart', this.onIntent, { passive: true });
        a.addEventListener('pointerleave', this.onLeave);
        a.addEventListener('blur', this.onLeave);
        a.addEventListener('click', this.onClick);
      });
      window.addEventListener('pageshow', this.onPageShow);
    }
    disconnectedCallback() {
      window.removeEventListener('pageshow', this.onPageShow);
    }
    intent(a) {
      this.showName(a.dataset.title);
      if (a === this.current) return;
      a.href = this.buildUrl(a);
      this.prefetch(a.href);
    }
    select(e) {
      const a = e.currentTarget;
      if (a === this.current) { e.preventDefault(); return; }
      a.href = this.buildUrl(a);
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      this.pending = true;
      this.links.forEach((l) => l.classList.toggle('is-selected', l === a));
      this.classList.add('is-loading');
      this.showName(a.dataset.title);
    }
    reset() {
      this.pending = false;
      this.classList.remove('is-loading');
      this.links.forEach((l) => l.classList.toggle('is-selected', l === this.current));
      this.showName(this.currentName);
    }
    showName(text) {
      if (this.nameEl && text) this.nameEl.textContent = text;
    }
    readJSON(el) {
      try { return JSON.parse((el && el.dataset.options) || '{}'); } catch (err) { return {}; }
    }
    buildUrl(a) {
      const url = new URL(a.dataset.url, window.location.origin);
      const form = document.getElementById(this.dataset.formId);
      const idInput = form && form.querySelector('[name="id"]');
      const variantId = idInput ? String(idInput.value) : new URLSearchParams(window.location.search).get('variant');
      const mine = this.readJSON(this.current);
      const value = Object.keys(mine).find((k) => String(mine[k]) === variantId);
      const target = this.readJSON(a);
      if (value && target[value]) url.searchParams.set('variant', target[value]);
      const scope = this.closest('.shopify-section') || document;
      const w = scope.querySelector('murelle-configurator [data-w]');
      const h = scope.querySelector('murelle-configurator [data-h]');
      if (w && w.value && w.checkValidity()) url.searchParams.set('largeur', w.value);
      if (h && h.value && h.checkValidity()) url.searchParams.set('hauteur', h.value);
      return url.pathname + url.search;
    }
    prefetch(href) {
      const c = navigator.connection;
      if ((c && c.saveData) || this.prefetched.has(href)) return;
      this.prefetched.add(href);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = href;
      document.head.appendChild(link);
    }
  }
  customElements.define('murelle-motifs', MurelleMotifs);
}
