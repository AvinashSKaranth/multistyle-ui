// Command palette: <dialog class="command"> with input + [role=listbox] of [role=option]
export function init(MS) {
  const dlgOf = (x) => (typeof x === 'string' ? document.querySelector(x) : x) || document.querySelector('dialog.command');
  const opts = (d) => [...d.querySelectorAll('[role=option]')];
  const sel = (d, li) => {
    opts(d).forEach((o) => o.setAttribute('aria-selected', o === li));
    li?.scrollIntoView({ block: 'nearest' });
  };
  const filter = (d) => {
    const q = d.querySelector('input').value.trim().toLowerCase();
    const list = d.querySelector('[role=listbox]');
    list.querySelectorAll('.group, .empty').forEach((n) => n.remove());
    let last, first;
    opts(d).forEach((o) => {
      const hit = !q || `${o.textContent} ${o.dataset.keywords || ''} ${o.dataset.group || ''}`.toLowerCase().includes(q);
      o.hidden = !hit;
      if (!hit) return;
      first ||= o;
      const g = o.dataset.group;
      if (g && g !== last) {
        const h = document.createElement('li');
        h.className = 'group';
        h.setAttribute('role', 'presentation');
        h.textContent = g;
        o.before(h);
      }
      last = g;
    });
    if (!first) list.insertAdjacentHTML('beforeend', '<li class="empty" role="presentation">No results</li>');
    sel(d, first);
  };
  const open = (d) => {
    d = dlgOf(d);
    if (!d) return;
    opts(d).forEach((o) => {
      if (o.dataset.shortcut && !o.querySelector('kbd')) o.insertAdjacentHTML('beforeend', `<kbd>${o.dataset.shortcut}</kbd>`);
    });
    d.querySelector('input').value = '';
    filter(d);
    d.open || d.showModal();
    d.querySelector('input').focus();
  };
  const run = (d, li) => {
    d.dispatchEvent(new CustomEvent('ms:command', { detail: { value: li.dataset.value ?? li.firstChild?.textContent.trim() ?? li.textContent.trim(), el: li }, bubbles: true }));
    d.close();
    if (li.dataset.href) location.href = li.dataset.href;
  };
  MS.command = open;
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const d = [...document.querySelectorAll('dialog.command')].find((x) => (x.dataset.msCommandKey || 'k').toLowerCase() === e.key.toLowerCase());
    if (!d) return;
    e.preventDefault();
    d.open ? d.close() : open(d);
  });
  document.addEventListener('input', (e) => {
    const d = e.target.closest?.('dialog.command');
    d && e.target.matches('input') && filter(d);
  });
  document.addEventListener('keydown', (e) => {
    const d = e.target.closest?.('dialog.command');
    if (!d) return;
    const v = opts(d).filter((o) => !o.hidden);
    const i = v.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (v.length) sel(d, v[(i + (e.key === 'ArrowDown' ? 1 : -1) + v.length) % v.length]);
    } else if (e.key === 'Enter' && v[i]) {
      e.preventDefault();
      run(d, v[i]);
    }
  });
  document.addEventListener('click', (e) => {
    const li = e.target.closest?.('dialog.command [role=option]');
    if (li) return run(li.closest('dialog'), li);
    if (e.target.matches?.('dialog.command')) e.target.close(); // backdrop click
  });
  document.addEventListener('pointermove', (e) => {
    const li = e.target.closest?.('dialog.command [role=option]');
    li && li.getAttribute('aria-selected') !== 'true' && sel(li.closest('dialog'), li);
  });
}
