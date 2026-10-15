// multistyle-ui core: window.MS
import { init as initToast } from './toast.js';   // later phase: MS.toast
import { init as initTabs } from './tabs.js';     // later phase: [role=tablist] wiring
import { init as initRipple } from './ripple.js'; // later phase: material ripple
import { init as initChart } from './chart.js';   // later phase: MS.chart + data-ms-chart

const STYLES = ['material', 'material3', 'fluent', 'brutalist', 'pixel', 'neon', 'metro', 'bootstrap', 'cartoon', 'illustration', 'carbon', 'liquid-glass'];
const THEMES = ['blue', 'red', 'pink', 'fuchsia', 'purple', 'violet', 'indigo', 'azure', 'cyan', 'jade', 'green', 'lime', 'yellow', 'amber', 'pumpkin', 'orange', 'sand', 'grey', 'zinc', 'slate',
  'classic', 'ocean', 'forest', 'rose', 'midnight', 'gold', 'candy', 'storm', 'royal', 'custom'];
const MODES = ['light', 'dark', 'system'];
const DEF = { style: 'material', theme: 'blue', mode: 'system' };
// Google Fonts families per style (other styles use system stacks defined in CSS)
const FONTS = { material: 'Roboto:wght@400;500;700', material3: 'Roboto:wght@400;500;700', neon: 'Exo+2:wght@400;600;700', cartoon: 'Comic+Neue:wght@400;700', illustration: 'Dancing+Script:wght@400;700', carbon: 'IBM+Plex+Sans:wght@400;500;600' };
const LS = 'multistyle-ui';
const doc = document;
const lists = { style: STYLES, theme: THEMES, mode: MODES };
const body = () => doc.body;
const safe = (fn) => { try { return fn(); } catch (e) { /* storage blocked */ } };
const dark = () => matchMedia('(prefers-color-scheme: dark)').matches;
const fire = () => doc.dispatchEvent(new CustomEvent('ms:change', { detail: MS.get() }));

const MS = {
  styles: STYLES, themes: THEMES, modes: MODES,

  get(el = body()) {
    const o = {};
    for (const k in DEF) {
      const m = [...el.classList].find((c) => c.startsWith(k + '-'));
      o[k] = m ? m.slice(k.length + 1) : DEF[k];
    }
    o.resolvedMode = o.mode === 'system' ? (dark() ? 'dark' : 'light') : o.mode;
    return o;
  },

  set(o, el = body()) {
    if ((o.primary || o.secondary || o.surface) && !o.theme) o = { ...o, theme: 'custom' };
    for (const k in DEF) {
      if (!o[k]) continue;
      [...el.classList].forEach((c) => c.startsWith(k + '-') && el.classList.remove(c));
      if (!(k === 'mode' && o[k] === 'system')) el.classList.add(k + '-' + o[k]);
    }
    if (o.theme && o.theme !== 'custom') ['primary', 'secondary', 'surface'].forEach((p) => el.style.removeProperty('--ms-' + p));
    for (const p of ['primary', 'secondary', 'surface']) if (o[p]) el.style.setProperty('--ms-' + p, o[p]);
    if (o.surface && MS.lightness(o.surface, el) < 0.85) console.warn('[multistyle-ui] custom surface should be a LIGHT color (OKLCH lightness >= 0.85); dark mode uses the default dark surface.');
    if (o.style) MS.font(o.style);
    if (el === body()) {
      if (el.hasAttribute('data-ms-persist')) {
        const s = { ...MS.get() };
        for (const p of ['primary', 'secondary', 'surface']) s[p] = el.style.getPropertyValue('--ms-' + p);
        safe(() => localStorage.setItem(LS, JSON.stringify(s)));
      }
      sync();
      fire();
    }
    return MS.get(el);
  },

  toggleMode() {
    return MS.set({ mode: MODES[(MODES.indexOf(MS.get().mode) + 1) % 3] });
  },

  font(style) {
    const f = FONTS[style];
    if (!f || body().dataset.msFonts === 'off' || doc.getElementById('ms-font-' + style)) return;
    const l = doc.createElement('link');
    l.id = 'ms-font-' + style; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f + '&display=swap';
    doc.head.append(l);
  },

  // Resolve a CSS var name ('--ms-c-primary') or any CSS color to plain rgb()/rgba() text (Chart.js-safe).
  resolveColor(varName, el = body()) {
    const p = doc.createElement('span');
    p.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;color:' + (varName.startsWith('--') ? 'var(' + varName + ')' : varName);
    el.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    const x = doc.createElement('canvas').getContext('2d', { willReadFrequently: true });
    x.fillStyle = c; x.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = x.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${+(a / 255).toFixed(3)})`;
  },

  // OKLab lightness 0..1 of a CSS color
  lightness(color, el = body()) {
    const [r, g, b] = MS.resolveColor(color, el).match(/[\d.]+/g).slice(0, 3).map((v) => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b) * .2104542553 + Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b) * .793617785 - Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b) * .0040720468;
  },

  open(sel) { const d = typeof sel === 'string' ? doc.querySelector(sel) : sel; d && !d.open && (d.showModal ? d.showModal() : d.setAttribute('open', '')); },
  close(sel) { const d = typeof sel === 'string' ? doc.querySelector(sel) : sel; d && (d.close ? d.close() : d.removeAttribute('open')); },
};

// keep declarative selects in sync with state
function sync() {
  const s = MS.get();
  doc.querySelectorAll('[data-ms]').forEach((e) => { if (s[e.dataset.ms] != null && e.value !== s[e.dataset.ms]) e.value = s[e.dataset.ms]; });
}

function init() {
  if (body().hasAttribute('data-ms-persist')) {
    const saved = safe(() => JSON.parse(localStorage.getItem(LS)));
    if (saved) {
      const o = {};
      for (const k of ['style', 'theme', 'mode', 'primary', 'secondary', 'surface']) if (saved[k]) o[k] = saved[k];
      MS.set(o);
    }
  }
  MS.font(MS.get().style);
  doc.querySelectorAll('select[data-ms]').forEach((s) => {
    if (!s.options.length) lists[s.dataset.ms]?.forEach((v) => s.add(new Option(v, v)));
  });
  sync();
  doc.addEventListener('change', (e) => { const k = e.target.dataset?.ms; if (k && lists[k]) MS.set({ [k]: e.target.value }); });
  doc.addEventListener('click', (e) => {
    const t = e.target.closest?.('[data-ms-mode-toggle],[data-ms-open],[data-ms-close]');
    if (!t) return;
    if (t.hasAttribute('data-ms-mode-toggle')) MS.toggleMode();
    else if (t.hasAttribute('data-ms-open')) MS.open(t.getAttribute('data-ms-open'));
    else MS.close(t.getAttribute('data-ms-close') || t.closest('dialog'));
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => MS.get().mode === 'system' && fire());
  [initToast, initTabs, initRipple, initChart].forEach((f) => f(MS));
}

window.MS = MS;
doc.addEventListener('alpine:init', () => {
  Alpine.store('ms', MS.get());
  Alpine.magic('ms', () => MS);
  doc.addEventListener('ms:change', (e) => Object.assign(Alpine.store('ms'), e.detail));
});
doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', init) : init();
