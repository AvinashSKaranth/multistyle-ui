// Chart.js bridge: MS.chart + [data-ms-chart]. Never imports Chart.js (uses window.Chart).
const NAMES = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'primary-300', 'secondary-300', 'primary-700', 'secondary-700'];
const SLICE = /^(pie|doughnut|polarArea)$/;
const RADIAL = /^(radar|polarArea)$/;
const CART = /^(bar|line|scatter|bubble)$/;
const ALIAS = { 'stacked-bar': 'bar', 'stacked-line': 'line', combo: 'bar' };

const merge = (a, b) => {
  for (const k in b) b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? merge((a[k] = a[k] && typeof a[k] === 'object' ? a[k] : {}), b[k]) : (a[k] = b[k]);
  return a;
};
const alpha = (c, a) => c.replace(/^rgba?\(([^,)]+,[^,)]+,[^,)]+).*/, `rgba($1,${a})`);

export function init(MS) {
  const charts = new Set();
  const auto = new WeakMap(); // dataset -> keys we colored (safe to recolor)
  let warned;

  // Chart.js can pass non-iterables to setLineDash in some browsers
  if (typeof CanvasRenderingContext2D !== 'undefined') {
    const o = CanvasRenderingContext2D.prototype.setLineDash;
    CanvasRenderingContext2D.prototype.setLineDash = function (s) { return o.call(this, s && typeof s[Symbol.iterator] === 'function' ? s : []); };
  }

  const themeOpts = (cv, kind) => {
    const r = (n) => MS.resolveColor(n, cv);
    const text = r('--ms-c-text'), muted = r('--ms-c-muted'), bd = r('--ms-c-border'), sf = r('--ms-c-surface');
    const o = {
      maintainAspectRatio: false, color: text, font: { family: getComputedStyle(cv).fontFamily },
      plugins: { colors: { enabled: false }, title: { color: text }, legend: { labels: { color: text } }, tooltip: { backgroundColor: text, titleColor: sf, bodyColor: sf } },
    };
    const ax = (st) => ({ grid: { color: bd }, border: { color: bd }, ticks: { color: muted }, ...(st && { stacked: true }) });
    if (kind.cart) o.scales = { x: ax(kind.stack), y: ax(kind.stack) };
    if (kind.radial) o.scales = { r: { grid: { color: bd }, angleLines: { color: bd }, pointLabels: { color: text }, ticks: { color: muted, backdropColor: 'transparent' } } };
    return o;
  };

  const paint = (cv, base, dss) => {
    const P = NAMES.map((n) => MS.resolveColor('--ms-c-' + n, cv)), sf = MS.resolveColor('--ms-c-surface', cv);
    dss.forEach((ds, i) => {
      const t = ds.type || base, c = P[i % P.length], a = auto.get(ds) || auto.set(ds, {}).get(ds);
      const set = (k, v) => { if (ds[k] === undefined || a[k]) { ds[k] = v; a[k] = 1; } };
      if (SLICE.test(t)) {
        set('backgroundColor', Array.from({ length: (ds.data || []).length }, (_, j) => P[j % P.length]));
        set('borderColor', sf); set('borderWidth', 2);
      } else {
        const fill = t === 'line' && ds.fill;
        set('borderColor', c);
        set('backgroundColor', alpha(c, t === 'line' || t === 'radar' ? (fill ? 0.3 : 0.2) : 0.6));
        if (t === 'bar') set('borderWidth', 1);
        if (t === 'line' || t === 'radar') set('pointBackgroundColor', c);
      }
    });
  };

  const theme = (ch) => {
    const m = ch._ms;
    ch.options = merge(themeOpts(ch.canvas, m.kind), m.user);
    paint(ch.canvas, ch.config.type, ch.data.datasets);
  };

  const kill = (ch) => { charts.delete(ch); ch.destroy(); };

  MS.chart = (el, cfg = {}) => {
    const C = window.Chart;
    if (!C) { warned || console.warn('[multistyle-ui] Chart.js not found: load it before calling MS.chart'); warned = 1; return null; }
    const cv = typeof el === 'string' ? document.querySelector(el) : el;
    if (!cv) return null;
    const old = C.getChart(cv);
    old && (charts.has(old) ? kill(old) : old.destroy());
    const raw = cfg.type || 'bar';
    const type = ALIAS[raw] || raw;
    const data = cfg.data || { datasets: [] };
    const ds = data.datasets || [];
    if (raw === 'combo' && !ds.some((d) => d.type)) ds.forEach((d, i) => i && (d.type = 'line'));
    if (raw === 'stacked-line') ds.forEach((d) => d.fill === undefined && (d.fill = true));
    const kind = { cart: CART.test(type), radial: RADIAL.test(type), stack: raw.startsWith('stacked') };
    const user = cfg.options || {};
    paint(cv, type, ds);
    const ch = new C(cv, { ...cfg, type, data, options: merge(themeOpts(cv, kind), user) });
    ch._ms = { kind, user };
    charts.add(ch);
    return ch;
  };

  const json = (s) => { try { return JSON.parse(s); } catch (e) { console.warn('[multistyle-ui] bad chart JSON', e); } };
  const scan = () => {
    charts.forEach((c) => c.canvas.isConnected || kill(c));
    document.querySelectorAll('canvas[data-ms-chart]').forEach((cv) => {
      if (window.Chart && window.Chart.getChart(cv)) return;
      const d = cv.getAttribute('data-ms-chart-data'), o = cv.getAttribute('data-ms-chart-options');
      MS.chart(cv, { type: cv.getAttribute('data-ms-chart') || 'bar', data: d && json(d), options: o && json(o) });
    });
  };

  document.addEventListener('ms:change', () => charts.forEach((c) => { c.stop(); theme(c); c.update('none'); c.update('resize') /* 'none' alone leaves points stale, 'resize' alone leaves line stale */; }));
  addEventListener('load', scan);
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}
