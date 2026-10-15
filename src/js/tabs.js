// WAI-ARIA tabs: delegated, MutationObserver for late-added tablists
export function init() {
  const done = new WeakSet();
  const tabsOf = (l) => [...l.querySelectorAll('[role=tab]')].filter((t) => t.closest('[role=tablist]') === l);
  const select = (tab) => {
    const l = tab.closest('[role=tablist]');
    tabsOf(l).forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
  };
  const norm = (l) => {
    if (done.has(l)) return;
    done.add(l);
    const t = tabsOf(l);
    const s = t.find((x) => x.getAttribute('aria-selected') === 'true') || t[0];
    s && select(s);
  };
  const scan = (n) => {
    if (n.nodeType !== 1) return;
    n.matches('[role=tablist]') && norm(n);
    n.querySelectorAll('[role=tablist]').forEach(norm);
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('[role=tab]');
    if (t && !t.disabled) select(t);
  });
  document.addEventListener('keydown', (e) => {
    const t = e.target.closest?.('[role=tab]');
    const k = { ArrowRight: 1, ArrowLeft: -1, Home: 0, End: 0 }[e.key];
    if (!t || k === undefined) return;
    const a = tabsOf(t.closest('[role=tablist]')).filter((x) => !x.disabled);
    const i = a.indexOf(t);
    const n = e.key === 'Home' ? a[0] : e.key === 'End' ? a[a.length - 1] : a[(i + k + a.length) % a.length];
    e.preventDefault();
    n.focus();
    select(n);
  });
  scan(document.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
}
