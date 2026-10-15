// [data-ms-sortable]: native DnD + keyboard + pointer (touch) reorder
export function init() {
  const live = document.createElement('div');
  live.className = 'ms-live';
  live.setAttribute('aria-live', 'assertive');
  document.body.append(live);
  const say = (t) => { live.textContent = ''; setTimeout(() => (live.textContent = t), 30); };
  const horiz = (l) => l.dataset.msSortable === 'horizontal';
  const items = (l) => [...l.children];
  const key = (x) => x.id || x.textContent.trim();
  const order = (l) => items(l).map(key);
  const handleOf = (x) => x.querySelector('[data-ms-handle]');
  const itemOf = (e) => e.target.closest?.('[data-ms-sortable] > *');
  const prep = (l) => items(l).forEach((x) => {
    const h = handleOf(x);
    x.draggable = !h;
    (h || x).tabIndex = 0;
    (h || x).setAttribute('aria-roledescription', 'sortable item');
  });
  let drag; // {list, item, from, before}
  const begin = (item) => { const list = item.parentElement; drag = { list, item, from: items(list).indexOf(item), before: order(list) }; };
  const end = () => {
    if (!drag) return;
    const { list, item, from } = drag;
    const to = items(list).indexOf(item);
    item.classList.remove('ms-dragging');
    item.removeAttribute('data-ms-grabbed');
    drag = null;
    if (to !== from) list.dispatchEvent(new CustomEvent('ms:sort', { detail: { from, to, order: order(list) }, bubbles: true }));
  };
  const place = (list, item, x, y) => {
    const t = document.elementFromPoint(x, y)?.closest('[data-ms-sortable] > *');
    if (!t || t === item || t.parentElement !== list) return;
    const r = t.getBoundingClientRect();
    const after = horiz(list) ? x > r.left + r.width / 2 : y > r.top + r.height / 2;
    list.insertBefore(item, after ? t.nextSibling : t);
  };

  // mouse DnD
  document.addEventListener('dragstart', (e) => {
    const it = itemOf(e);
    if (!it) return;
    begin(it);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', it.textContent.trim());
    requestAnimationFrame(() => it.classList.add('ms-dragging'));
  });
  document.addEventListener('dragover', (e) => {
    if (!drag || !drag.list.contains(e.target)) return;
    e.preventDefault();
    place(drag.list, drag.item, e.clientX, e.clientY);
  });
  document.addEventListener('dragend', () => {
    end();
    document.querySelectorAll('[data-ms-sortable] > *').forEach((x) => handleOf(x) && (x.draggable = false));
  });

  // handle: enable drag on the item only while the handle is pressed (mouse); pointer reorder for touch/pen
  document.addEventListener('pointerdown', (e) => {
    const it = itemOf(e);
    if (!it) return;
    const h = e.target.closest('[data-ms-handle]');
    if (e.pointerType === 'mouse') { if (h) it.draggable = true; return; }
    if (handleOf(it) && !h) return;
    begin(it);
    it.classList.add('ms-dragging');
    it.setPointerCapture?.(e.pointerId);
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerType === 'mouse') return;
    place(drag.list, drag.item, e.clientX, e.clientY);
  });
  const up = (e) => { if (e.pointerType !== 'mouse') end(); };
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);

  // keyboard
  document.addEventListener('keydown', (e) => {
    const it = itemOf(e);
    if (!it || e.target.matches('input, textarea, select')) return;
    const list = it.parentElement;
    const h = handleOf(it);
    if (e.target !== (h || it)) return;
    const n = items(list).length;
    const name = it.textContent.trim();
    if (!drag) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        begin(it);
        it.setAttribute('data-ms-grabbed', '');
        say(`${name} grabbed, position ${drag.from + 1} of ${n}. Use arrow keys to move, space to drop, escape to cancel.`);
      }
      return;
    }
    if (drag.item !== it) return;
    const i = items(list).indexOf(it);
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (d) {
      e.preventDefault();
      const j = i + d;
      if (j < 0 || j >= n) return;
      list.insertBefore(it, d > 0 ? list.children[j].nextSibling : list.children[j]);
      (h || it).focus();
      say(`${name}, position ${j + 1} of ${n}`);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      say(`${name} dropped at position ${i + 1} of ${n}`);
      end();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const ids = drag.before;
      const map = new Map(items(list).map((x) => [key(x), x]));
      ids.forEach((k) => list.append(map.get(k)));
      (h || it).focus();
      it.removeAttribute('data-ms-grabbed');
      drag = null;
      say(`Move cancelled, ${name} returned to position ${ids.indexOf(key(it)) + 1}`);
    }
  });

  const scan = (n) => {
    if (n.nodeType !== 1) return;
    const l = n.closest('[data-ms-sortable]');
    (l ? [l] : [...n.querySelectorAll('[data-ms-sortable]')]).forEach(prep);
  };
  scan(document.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
}
