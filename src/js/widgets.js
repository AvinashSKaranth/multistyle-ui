// Widgets: carousel, pagination, button group, menu/popover helpers, dismiss
export function init(MS) {
  const doc = document;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ev = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

  /* ---------- carousel ---------- */
  const carousel = (el) => {
    if ('msReady' in el.dataset) return;
    el.dataset.msReady = '';
    const wrap = doc.createElement('div');
    wrap.className = 'carousel-wrap';
    el.before(wrap);
    wrap.append(el);
    const slides = () => [...el.children];
    const left = (s) => s.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
    const cur = () => {
      const s = slides();
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) return s.length - 1;
      let best = 0;
      s.forEach((x, i) => { if (left(x) <= el.scrollLeft + 2) best = i; });
      return best;
    };
    const go = (i) => {
      const s = slides();
      if (!s.length) return;
      i = (i + s.length) % s.length;
      el.scrollTo({ left: left(s[i]), behavior: reduce() ? 'auto' : 'smooth' });
    };
    let dots;
    const sync = () => {
      const c = cur();
      dots?.forEach((d, i) => (i === c ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    };
    const btn = (cls, label, txt, fn) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.setAttribute('aria-label', label);
      b.textContent = txt;
      b.addEventListener('click', fn);
      return b;
    };
    if (el.hasAttribute('data-ms-arrows')) {
      wrap.append(btn('carousel-prev', 'Previous slide', '‹', () => go(cur() - 1)), btn('carousel-next', 'Next slide', '›', () => go(cur() + 1)));
    }
    if (el.hasAttribute('data-ms-dots')) {
      const nav = doc.createElement('div');
      nav.className = 'carousel-dots';
      dots = slides().map((_, i) => nav.appendChild(btn('', `Slide ${i + 1}`, '', () => go(i))));
      wrap.append(nav);
    }
    let raf;
    el.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    sync();
    const ms = +el.dataset.msAutoplay;
    if (ms > 0 && !reduce()) {
      let t, paused;
      const start = () => { clearInterval(t); t = setInterval(() => !paused && !doc.hidden && go(cur() + 1), ms); };
      wrap.addEventListener('mouseenter', () => (paused = true));
      wrap.addEventListener('mouseleave', () => (paused = false));
      wrap.addEventListener('focusin', () => (paused = true));
      wrap.addEventListener('focusout', () => (paused = false));
      start();
    }
  };

  /* ---------- pagination ---------- */
  const render = (nav) => {
    const total = Math.max(1, +nav.dataset.msPages || 1);
    const page = Math.min(total, Math.max(1, +nav.dataset.msPage || 1));
    const w = +(nav.dataset.msWindow ?? 1);
    const had = nav.contains(doc.activeElement);
    const nums = [];
    for (let p = 1; p <= total; p++) if (p === 1 || p === total || Math.abs(p - page) <= w) nums.push(p);
    const items = [['«', 1, 'First page', page === 1], ['‹', page - 1, 'Previous page', page === 1]];
    nums.forEach((p, i) => {
      if (i && p - nums[i - 1] > 1) items.push(null);
      items.push([String(p), p, `Page ${p}`, false]);
    });
    items.push(['›', page + 1, 'Next page', page === total], ['»', total, 'Last page', page === total]);
    nav.replaceChildren();
    const ul = nav.appendChild(doc.createElement('ul'));
    items.forEach((it) => {
      const li = ul.appendChild(doc.createElement('li'));
      if (!it) { li.className = 'ellipsis'; li.setAttribute('aria-hidden', 'true'); li.textContent = '…'; return; }
      const b = li.appendChild(doc.createElement('button'));
      b.type = 'button';
      b.textContent = it[0];
      b.dataset.page = it[1];
      b.setAttribute('aria-label', it[2]);
      b.disabled = it[3];
      if (/^\d+$/.test(it[0]) && +it[0] === page) b.setAttribute('aria-current', 'page');
    });
    if (had) (nav.querySelector('[aria-current=page]') || nav.querySelector('button:not(:disabled)'))?.focus();
  };
  MS.paginate = (nav, o = {}) => {
    nav = typeof nav === 'string' ? doc.querySelector(nav) : nav;
    if (o.total != null) nav.dataset.msPages = o.total;
    if (o.current != null) nav.dataset.msPage = o.current;
    if (o.window != null) nav.dataset.msWindow = o.window;
    nav.classList.add('pagination');
    render(nav);
    return nav;
  };
  doc.addEventListener('click', (e) => {
    const b = e.target.closest?.('nav[data-ms-pages] button[data-page]');
    if (!b) return;
    const nav = b.closest('nav');
    nav.dataset.msPage = b.dataset.page;
    render(nav);
    ev(nav, 'ms:page', { page: +b.dataset.page });
  });

  /* ---------- button group ---------- */
  doc.addEventListener('click', (e) => {
    const b = e.target.closest?.('[role=group][data-ms-select] > button, [role=group][data-ms-select] > [role=button]');
    if (!b) return;
    const g = b.parentElement;
    const multi = g.dataset.msSelect === 'multi';
    const on = b.getAttribute('aria-pressed') !== 'true';
    if (!multi) g.querySelectorAll(':scope > [aria-pressed]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', multi ? on : 'true');
    const values = [...g.children].filter((x) => x.getAttribute('aria-pressed') === 'true').map((x) => x.value || x.dataset.value || x.textContent.trim());
    ev(g, 'ms:select', { values });
  });

  /* ---------- menus & popovers ---------- */
  const menuItems = (m) => [...m.querySelectorAll('a[href], button:not(:disabled), [role=menuitem]')];
  doc.addEventListener('toggle', (e) => {
    const m = e.target;
    if (e.newState === 'open' && m.matches?.('menu[popover], [popover].menu')) menuItems(m)[0]?.focus();
  }, true);
  doc.addEventListener('keydown', (e) => {
    const m = e.target.closest?.('menu[popover], [popover].menu');
    if (!m) return;
    const it = menuItems(m);
    const i = it.indexOf(doc.activeElement);
    const n = { ArrowDown: it[(i + 1) % it.length], ArrowUp: it[(i - 1 + it.length) % it.length], Home: it[0], End: it.at(-1) }[e.key];
    if (n) { e.preventDefault(); n.focus(); }
  });
  doc.addEventListener('click', (e) => {
    const it = e.target.closest?.('menu[popover] :is(a, button, [role=menuitem]), [popover].menu :is(a, button, [role=menuitem])');
    if (it) it.closest('[popover]').hidePopover?.();
  });
  const hover = (e, show) => {
    const t = e.target.closest?.('[data-ms-hover-popover]');
    if (!t) return;
    const p = doc.querySelector(t.dataset.msHoverPopover);
    if (!p) return;
    clearTimeout(p._ms);
    if (show) {
      const name = `--ms-hv-${p.id || 'x'}`;
      t.style.anchorName = name;
      p.style.positionAnchor = name;
      if (!p.matches(':popover-open')) p.showPopover?.();
    } else p._ms = setTimeout(() => p.matches(':popover-open') && p.hidePopover(), 100);
  };
  doc.addEventListener('mouseover', (e) => hover(e, true));
  doc.addEventListener('mouseout', (e) => hover(e, false));
  doc.addEventListener('focusin', (e) => hover(e, true));
  doc.addEventListener('focusout', (e) => hover(e, false));
  // keep the popover open while the pointer is over it
  doc.addEventListener('mouseover', (e) => {
    const p = e.target.closest?.('[popover]');
    p && doc.querySelectorAll('[data-ms-hover-popover]').forEach((t) => doc.querySelector(t.dataset.msHoverPopover) === p && clearTimeout(p._ms));
  });
  doc.addEventListener('mouseout', (e) => {
    const p = e.target.closest?.('[popover]');
    p && !p.contains(e.relatedTarget) && doc.querySelectorAll('[data-ms-hover-popover]').forEach((t) => doc.querySelector(t.dataset.msHoverPopover) === p && (p._ms = setTimeout(() => p.matches(':popover-open') && p.hidePopover(), 100)));
  });

  /* ---------- dismiss ---------- */
  doc.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-ms-dismiss]');
    if (!b) return;
    const t = b.closest('[role=alert], .chip, .ms-toast, [data-ms-dismissable]');
    if (!t) return;
    ev(t, 'ms:dismiss', {});
    if (reduce()) return t.remove();
    t.style.transition = 'opacity .15s';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 150);
  });

  /* ---------- scan ---------- */
  const scan = (n) => {
    if (n.nodeType !== 1) return;
    const q = (s) => [...(n.matches(s) ? [n] : []), ...n.querySelectorAll(s)];
    q('.carousel:is([data-ms-arrows],[data-ms-dots],[data-ms-autoplay])').forEach(carousel);
    q('nav[data-ms-pages]').forEach((x) => !x.querySelector('[data-page]') && render(x));
    q('[role=group][data-ms-select]').forEach((g) => [...g.children].forEach((b) => b.hasAttribute('aria-pressed') || b.setAttribute('aria-pressed', 'false')));
  };
  scan(doc.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(doc.body, { childList: true, subtree: true });
}
