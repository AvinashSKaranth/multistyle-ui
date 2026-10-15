// Docs chrome only (not shipped): renders <template class="example">, swatches, copy buttons, scroll spy.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function copy(text, btn) {
    const done = () => { const o = btn.dataset.label || (btn.dataset.label = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = o), 1200); };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(done, () => fallback());
    fallback();
    function fallback() {
      const t = document.createElement('textarea');
      t.value = text; t.style.cssText = 'position:fixed;opacity:0';
      document.body.append(t); t.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      t.remove(); done();
    }
  }

  // innerHTML serialises JSON attrs as &quot; - turn them back into readable '...' attrs
  const pretty = (h) => h.replace(/(\s[\w:@.-]+)="([^"]*&quot;[^"]*)"/g, (m, a, v) => `${a}='${v.replaceAll('&quot;', '"')}'`).replaceAll('=""', '');
  function dedent(s) {
    const lines = s.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
    return lines.map((l) => l.slice(ind)).join('\n');
  }

  function render(t) {
    const { title = '', note = '', preview = 'on' } = t.dataset;
    const ex = document.createElement('div');
    ex.className = 'ex';
    const code = t.dataset.code || dedent(pretty(t.innerHTML));
    ex.innerHTML = `<div class="ex-head"><strong></strong><button type="button" class="sm outline secondary" data-copy>Copy</button></div>` +
      (preview === 'off' ? '' : '<div class="ex-preview"></div>') + '<pre><code></code></pre>' + (note ? '<p class="ex-note"><small></small></p>' : '');
    $('strong', ex).textContent = title;
    $('code', ex).textContent = code;
    if (note) $('small', ex).textContent = note;
    ex._code = code;
    if (preview !== 'off') $('.ex-preview', ex).append(t.content.cloneNode(true));
    t.replaceWith(ex);
  }
  $$('template.example').forEach(render);

  // Styles: one scoped card per style (real components inside a style-x wrapper)
  const grid = $('#style-grid');
  if (grid) MS.styles.forEach((s) => {
    const d = document.createElement('div');
    d.className = 'pick style-' + s;
    d.innerHTML = `<strong>${s}</strong><div class="pick-demo"><button class="sm">Button</button><button class="sm outline secondary">Outline</button><span class="badge">Badge</span></div><input placeholder="Input" aria-label="${s} input"><button class="sm ghost" data-pick-style="${s}">Use ${s}</button>`;
    grid.append(d);
  });

  // Themes: swatch with primary/secondary shades 50-950
  const tg = $('#theme-grid');
  const SH = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  if (tg) MS.themes.forEach((t) => {
    const d = document.createElement('div');
    d.className = 'pick theme-' + t;
    if (t === 'custom') d.style.cssText = '--ms-primary:#ff6600;--ms-secondary:#0066ff;--ms-surface:#fffaf5';
    const row = (n) => '<span class="shades">' + SH.map((s) => `<i style="background:var(--ms-c-${n}-${s})" title="${n} ${s}"></i>`).join('') + '</span>';
    d.innerHTML = `<strong>${t}</strong>${row('primary')}${row('secondary')}<button class="sm" data-pick-theme="${t}">Apply</button>`;
    tg.append(d);
  });

  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy]');
    if (c) {
      const ex = c.closest('.ex');
      const src = c.dataset.copy ? $(c.dataset.copy)?.textContent : ex?._code;
      return copy(src || '', c);
    }
    const s = e.target.closest('[data-pick-style]');
    if (s) return MS.set({ style: s.dataset.pickStyle });
    const t = e.target.closest('[data-pick-theme]');
    if (t) {
      const th = t.dataset.pickTheme;
      MS.set(th === 'custom' ? { theme: 'custom', primary: '#ff6600', secondary: '#0066ff', surface: '#fffaf5' } : { theme: th });
    }
  });

  // Scroll spy
  const links = $$('#sidenav a[href^="#"]');
  const spy = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((a) => a.removeAttribute('aria-current'));
    $(`#sidenav a[href="#${en.target.id}"]`)?.setAttribute('aria-current', 'true');
  }), { rootMargin: '-20% 0px -70% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));
})();

// Alpine component for the top bar / custom-theme pickers (docs chrome)
document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    nav: false, tick: 0, p: '#ff6600', s: '#0066ff', f: '#fffaf5',
    init() {
      const st = document.body.style;
      this.p = st.getPropertyValue('--ms-primary').trim() || this.p;
      this.s = st.getPropertyValue('--ms-secondary').trim() || this.s;
      this.f = st.getPropertyValue('--ms-surface').trim() || this.f;
    },
    apply() { MS.set({ primary: this.p, secondary: this.s, surface: this.f }); },
    bodyTag() {
      this.tick; // reactive dependency, bumped on ms:change
      const m = Alpine.store('ms'), q = '"';
      let t = `<body class=${q}style-${m.style} theme-${m.theme} mode-${m.mode}${q}`;
      if (m.theme === 'custom') t += `\n      style=${q}--ms-primary:${this.p}; --ms-secondary:${this.s}; --ms-surface:${this.f}${q}`;
      return t + '>';
    },
  }));
});
