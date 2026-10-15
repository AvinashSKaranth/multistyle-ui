// forms: textarea counter, dropzone drag state + file names, range fill (%), placeholder=" " for class-free floating labels (autofloat.css)
const doc = document;

// --ms-af (filled|outlined|off) is inherited from the nearest style / data-ms-fields scope (see autofloat.css)
const floats = (el) => getComputedStyle(el).getPropertyValue('--ms-af').trim() in { filled: 1, outlined: 1 };
const FIELD = 'input:not([type^=c],[type^=r],[type=file],[type^=h],[type^=b],[type=submit],[type^=i]),textarea';

// :placeholder-shown drives the float: give label-wrapped / label-preceded fields a blank placeholder (never overwrite an author's; remove ours when the scope stops floating)
function ph(root) {
  if (root.nodeType !== 1) return;
  for (const t of [...(root.matches(FIELD) ? [root] : []), ...root.querySelectorAll(FIELD)]) {
    const own = t.hasAttribute('placeholder') && !t.hasAttribute('data-ms-ph');
    if (own || !(t.parentElement?.tagName === 'LABEL' || t.previousElementSibling?.matches('label[for]'))) continue;
    const on = floats(t);
    if (on && !own) { t.placeholder = ' '; t.setAttribute('data-ms-ph', ''); }
    else if (!on) { t.removeAttribute('placeholder'); t.removeAttribute('data-ms-ph'); }
  }
}

function counter(t) {
  if (!t.maxLength || t.maxLength < 0) return;
  const p = t.parentElement, h = p?.matches('label.floating') || (p?.tagName === 'LABEL' && floats(t)) ? p : t; // inside a floating label the counter goes after the label
  let c = h.nextElementSibling;
  if (!c?.matches('small.counter')) {
    c = doc.createElement('small');
    c.className = 'counter'; c.setAttribute('aria-live', 'polite');
    h.after(c);
  }
  c.textContent = t.value.length + '/' + t.maxLength;
  c.classList.toggle('full', t.value.length >= t.maxLength);
}

function fill(r) {
  const min = +r.min || 0, max = r.max === '' ? 100 : +r.max;
  r.style.setProperty('--_pct', (max > min ? ((r.value - min) / (max - min)) * 100 : 0) + '%');
}

function scan(root) {
  if (root.nodeType !== 1) return;
  ph(root);
  root.matches('textarea[data-ms-counter]') && counter(root);
  root.matches('input[type=range]') && fill(root);
  root.querySelectorAll('textarea[data-ms-counter]').forEach(counter);
  root.querySelectorAll('input[type=range]').forEach(fill);
}

function files(z, list) {
  let s = z.querySelector(':scope > small.files');
  if (!s) { s = doc.createElement('small'); s.className = 'files'; z.append(s); }
  s.replaceChildren(...[...list].map((f) => { const e = doc.createElement('span'); e.textContent = f.name; return e; }));
}

export function init(MS) {
  scan(doc.body);
  doc.addEventListener('ms:change', () => ph(doc.body));
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(doc.body, { childList: true, subtree: true });

  doc.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches?.('textarea[data-ms-counter]')) counter(t);
    else if (t.matches?.('input[type=range]')) fill(t);
  });
  doc.addEventListener('reset', (e) => setTimeout(() => scan(e.target)));

  // dropzone: the file input covers the zone, so events target the input; toggle .dragover on the zone
  const zone = (e) => e.target.closest?.('.dropzone');
  for (const t of ['dragenter', 'dragover']) doc.addEventListener(t, (e) => zone(e)?.classList.add('dragover'));
  doc.addEventListener('dragleave', (e) => { const z = zone(e); z && !z.contains(e.relatedTarget) && z.classList.remove('dragover'); });
  doc.addEventListener('drop', (e) => zone(e)?.classList.remove('dragover'));
  doc.addEventListener('change', (e) => {
    const z = zone(e);
    if (z && e.target.type === 'file') files(z, e.target.files);
  });
}
