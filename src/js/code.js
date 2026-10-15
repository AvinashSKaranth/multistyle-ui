// Prism bridge: MS.code + textarea[data-ms-code] editor + highlighted pre>code. Never imports Prism (uses window.Prism, call time).
// Theming is pure CSS (code.css maps .token.* to tokens), so no Prism theme stylesheet is needed.
export function init(MS) {
  let warned;
  const all = new Set();

  // Prism.highlightElement is sync when the grammar is loaded; with the autoloader plugin it loads it from the CDN then re-highlights.
  const hl = (code) => window.Prism?.highlightElement(code);

  MS.code = (el, opts = {}) => {
    el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!el) return null;
    if (el.msCode) return el.msCode;
    const d = el.dataset;
    const lang = opts.language ?? (d.msCode && d.msCode !== 'true' ? d.msCode : 'none');
    const lines = opts.lines ?? d.msLines != null;
    const box = document.createElement('div');
    box.className = 'ms-code';
    if (lines) box.dataset.lines = '';
    const gut = lines ? Object.assign(document.createElement('pre'), { className: 'ms-code-gutter', ariaHidden: 'true' }) : null;
    const pre = Object.assign(document.createElement('pre'), { className: 'ms-code-pre', ariaHidden: 'true' });
    const code = Object.assign(document.createElement('code'), { className: 'language-' + lang });
    pre.append(code);
    el.before(box);
    box.append(...[gut, pre, el].filter(Boolean));
    el.setAttribute('wrap', 'off');
    el.spellcheck = false;
    el.autocapitalize = 'off';

    let n = 0, esc = false;
    const update = () => {
      code.textContent = el.value + '\n';  // trailing newline keeps the last (empty) line's height in sync
      hl(code);
      if (gut) {
        const c = el.value.split('\n').length;
        if (c !== n) gut.textContent = Array.from({ length: n = c }, (_, i) => i + 1).join('\n');
      }
      scroll();
    };
    const scroll = () => { pre.scrollTop = el.scrollTop; pre.scrollLeft = el.scrollLeft; if (gut) gut.scrollTop = el.scrollTop; };
    // replace [a,b) with text through execCommand so native undo keeps working
    const edit = (a, b, text, s, e) => {
      el.setSelectionRange(a, b);
      if (!document.execCommand('insertText', false, text)) { el.setRangeText(text, a, b, 'end'); update(); }
      el.setSelectionRange(s, e);
    };
    const onKey = (ev) => {
      if (ev.key === 'Escape') { esc = true; return; }
      if (ev.key !== 'Tab' || esc || ev.ctrlKey || ev.altKey || ev.metaKey || el.readOnly) { esc = false; return; }
      ev.preventDefault();
      const v = el.value, { selectionStart: s, selectionEnd: e } = el;
      if (s === e && !ev.shiftKey) return edit(s, e, '  ', s + 2, s + 2);
      const a = v.lastIndexOf('\n', s - 1) + 1;
      const end = e > s && v[e - 1] === '\n' ? e - 1 : e;
      const block = v.slice(a, end).split('\n');
      const out = block.map((l) => (ev.shiftKey ? l.replace(/^ {1,2}|^\t/, '') : '  ' + l));
      const first = out[0].length - block[0].length;
      edit(a, end, out.join('\n'), Math.max(a, s + first), end + out.join('\n').length - block.join('\n').length);
    };
    const onReset = () => setTimeout(update);
    const on = [[el, 'input', update], [el, 'scroll', scroll], [el, 'keydown', onKey], [el, 'blur', () => (esc = false)], [el.form, 'reset', onReset]];
    on.forEach(([t, ev, f]) => t?.addEventListener(ev, f));
    new ResizeObserver(scroll).observe(el);

    if (!window.Prism && !warned) { warned = 1; console.info('[multistyle-ui] Prism not found: code editor works without syntax highlighting'); }
    update();
    const api = el.msCode = {
      el, update,
      destroy() {
        on.forEach(([t, ev, f]) => t?.removeEventListener(ev, f));
        all.delete(api); delete el.msCode; el.removeAttribute('data-ms-code');  // else the observer would re-wrap it
        el.removeAttribute('wrap');
        box.replaceWith(el);
      },
    };
    all.add(api);
    return api;
  };

  const scan = () => {
    document.querySelectorAll('textarea[data-ms-code]').forEach((e) => e.msCode || MS.code(e));
    if (!window.Prism) return;
    document.querySelectorAll('pre > code[class*="language-"]:not(.ms-code-pre > code)').forEach((c) => {
      if (c.dataset.msHl === c.textContent) return;  // already highlighted for this text
      hl(c);
      c.dataset.msHl = c.textContent;
    });
  };
  addEventListener('load', () => { scan(); all.forEach((a) => a.update()); });  // Prism <script> may arrive after init
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true, characterData: true });
}
