// Mermaid bridge: MS.mermaid + .mermaid blocks. Never imports Mermaid (uses window.mermaid).
export function init(MS) {
  let q = Promise.resolve(), warned;
  // hidden diagrams (closed tab, details...) can't be measured and render as "Syntax error": draw once shown
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (io.unobserve(e.target), draw(e.target))));

  // Mermaid config is global: initialize with this diagram's tokens, render, next (queue keeps order).
  const draw = (el) => {
    const m = window.mermaid;
    if (!m) { warned || console.warn('[multistyle-ui] Mermaid not found: load it before calling MS.mermaid'); warned = 1; return q; }
    el.dataset.msSrc ??= el.textContent; // mermaid replaces content with SVG
    if (!el.getClientRects().length) { io.observe(el); return q; }
    el.setAttribute('data-ms-wait', '');
    return q = q.then(async () => {
      const r = (n) => MS.resolveColor(n.startsWith('color') ? n : '--ms-c-' + n, el);
      const tint = (a) => r(`color-mix(in srgb,var(--ms-c-${a}) 16%,var(--ms-c-surface))`);
      const text = r('text'), primary = r('primary'), surface = r('surface'), border = r('border'), node = tint('primary');
      m.initialize({
        startOnLoad: false, theme: 'base', fontFamily: getComputedStyle(el).fontFamily,
        themeVariables: {
          darkMode: MS.lightness(surface, el) < 0.5, background: surface, fontFamily: getComputedStyle(el).fontFamily,
          primaryColor: node, primaryTextColor: text, primaryBorderColor: primary, mainBkg: node, nodeBorder: primary, nodeTextColor: text,
          secondaryColor: tint('secondary'), tertiaryColor: r('surface-2'), lineColor: r('muted'), textColor: text, titleColor: text,
          clusterBkg: r('surface-2'), clusterBorder: border, edgeLabelBackground: r('surface-2'),
          noteBkgColor: tint('warning'), noteTextColor: text, noteBorderColor: r('warning'),
        },
      });
      el.removeAttribute('data-processed');
      el.textContent = el.dataset.msSrc;
      try { await m.run({ nodes: [el], suppressErrors: true }); } catch (e) { console.warn('[multistyle-ui] mermaid', e); }
      el.removeAttribute('data-ms-wait');
    });
  };

  MS.mermaid = (t) => {
    const l = typeof t === 'string' ? document.querySelectorAll(t) : t ? [t] : document.querySelectorAll('.mermaid');
    return Promise.all([...l].map(draw)).then(() => q);
  };

  // mermaid's own window-load run would also draw hidden diagrams (broken): we render instead
  const scan = () => (window.mermaid && (mermaid.startOnLoad = false), document.querySelectorAll('.mermaid:not([data-ms-src])').forEach(draw));
  document.addEventListener('ms:change', () => MS.mermaid());
  addEventListener('load', scan);
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}
