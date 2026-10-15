// <select multiple data-ms-multiselect data-placeholder="..."> -> chips + filter + listbox. The select stays the source of truth.
const doc = document;
let uid = 0;
const el = (tag, cls, attrs = {}) => { const e = doc.createElement(tag); if (cls) e.className = cls; for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

export function multiselect(sel) {
  if (sel._msMulti) return sel._msMulti;
  const id = 'ms-multi-' + ++uid;
  const root = el('div', 'ms-multi');
  const control = el('div', 'ms-multi-control');
  const input = el('input', '', { type: 'text', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': id, 'aria-autocomplete': 'list', autocomplete: 'off' });
  const list = el('ul', 'ms-multi-list', { id, role: 'listbox', 'aria-multiselectable': 'true', hidden: '' });
  const label = sel.getAttribute('aria-label') || sel.labels?.[0]?.firstChild?.textContent.trim();
  if (label) input.setAttribute('aria-label', label);
  control.append(input);
  root.append(control, list);
  sel.hidden = true;
  sel.after(root);
  let active = -1, items = [];

  const open = (v) => {
    list.hidden = !v; input.setAttribute('aria-expanded', v);
    if (!v) { active = -1; input.removeAttribute('aria-activedescendant'); items.forEach((li) => li.classList.remove('active')); }
  };
  const toggle = (o) => {
    if (o.disabled) return;
    o.selected = !o.selected;
    sel.dispatchEvent(new Event('input', { bubbles: true }));
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const setActive = (i) => {
    items.forEach((li, n) => li.classList.toggle('active', n === i));
    active = i;
    const li = items[i];
    if (li) { input.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' }); }
  };

  function render() {
    control.querySelectorAll('.chip').forEach((c) => c.remove());
    const chosen = [...sel.selectedOptions];
    chosen.forEach((o) => {
      const chip = el('span', 'chip');
      const b = el('button', '', { type: 'button', 'aria-label': 'Remove ' + o.textContent });
      b.textContent = '×';
      b.addEventListener('click', (e) => { e.stopPropagation(); toggle(o); input.focus(); });
      chip.append(o.textContent, b);
      input.before(chip);
    });
    input.placeholder = chosen.length ? '' : sel.dataset.placeholder || '';
    const q = input.value.trim().toLowerCase();
    list.replaceChildren();
    items = [];
    [...sel.options].filter((o) => !q || o.textContent.toLowerCase().includes(q)).forEach((o) => {
      const li = el('li', '', { id: id + '-o' + o.index, role: 'option', 'aria-selected': o.selected });
      if (o.disabled) li.setAttribute('aria-disabled', 'true');
      li.textContent = o.textContent;
      li.addEventListener('mousedown', (e) => e.preventDefault()); // keep input focus
      li.addEventListener('click', () => toggle(o));
      li.addEventListener('mousemove', () => { const i = items.indexOf(li); i !== active && setActive(i); });
      list.append(li); items.push(li);
    });
    if (!items.length) { const li = el('li', 'empty'); li.textContent = 'No options'; list.append(li); }
    active = Math.min(active, items.length - 1);
    if (active >= 0 && !list.hidden) setActive(active);
    root.toggleAttribute('data-disabled', sel.disabled);
    input.disabled = sel.disabled;
  }

  const move = (d) => {
    if (list.hidden) open(true);
    if (items.length) setActive((active + d + items.length) % items.length);
  };
  input.addEventListener('input', () => { open(true); active = -1; render(); setActive(items.length ? 0 : -1); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { if (!list.hidden) { e.preventDefault(); items[active]?.click(); } }
    else if (e.key === 'Escape') { if (!list.hidden) { e.stopPropagation(); open(false); } }
    else if (e.key === 'Backspace' && !input.value) { const c = sel.selectedOptions; c.length && toggle(c[c.length - 1]); }
  });
  control.addEventListener('click', () => { if (!sel.disabled) { input.focus(); open(true); } });
  const outside = (e) => {
    if (!sel.isConnected) return doc.removeEventListener('pointerdown', outside);
    if (!root.contains(e.target)) { open(false); if (input.value) { input.value = ''; render(); } }
  };
  doc.addEventListener('pointerdown', outside);
  sel.addEventListener('change', render); // also catches programmatic changes (Alpine x-model)
  sel.form?.addEventListener('reset', () => setTimeout(render));
  render();
  return (sel._msMulti = { root, render });
}

export function init(MS) {
  MS.multiselect = (s) => { const e = typeof s === 'string' ? doc.querySelector(s) : s; return e && multiselect(e); };
  const scan = (n) => {
    if (n.nodeType !== 1) return;
    n.matches('select[data-ms-multiselect]') && multiselect(n);
    n.querySelectorAll('select[data-ms-multiselect]').forEach(multiselect);
  };
  scan(doc.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(doc.body, { childList: true, subtree: true });
}
