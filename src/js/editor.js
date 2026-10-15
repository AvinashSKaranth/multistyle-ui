// Quill bridge: MS.editor + [data-ms-editor]. Never imports Quill (uses window.Quill). Theming is pure CSS.
const H = [{ header: [1, 2, 3, false] }], L = [{ list: 'ordered' }, { list: 'bullet' }];
const TOOLBARS = {
  minimal: [['bold', 'italic', 'link'], ['clean']],
  default: [H, ['bold', 'italic', 'underline', 'strike'], L, ['link', 'blockquote', 'code-block'], ['clean']],
  full: [H, ['bold', 'italic', 'underline', 'strike'], [{ color: [] }, { background: [] }], L.concat([{ indent: '-1' }, { indent: '+1' }]), [{ align: [] }], ['link', 'blockquote', 'code-block'], ['clean']],
};

export function init(MS) {
  let warned;

  MS.editor = (el, opts = {}) => {
    const Q = window.Quill;
    if (!Q) { warned || console.warn('[multistyle-ui] Quill not found: load it before calling MS.editor'); warned = 1; return null; }
    el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!el) return null;
    if (el.msEditor) return el.msEditor;
    const d = el.dataset;
    const ed = el.msEditor = new Q(el, { theme: 'snow', placeholder: d.placeholder, modules: { toolbar: TOOLBARS[d.toolbar] || TOOLBARS.default }, ...opts });
    if (d.name) {
      const f = el.parentNode.querySelector(`input[type=hidden][name="${CSS.escape(d.name)}"]`) || Object.assign(document.createElement('input'), { type: 'hidden', name: d.name });
      f.isConnected || el.after(f);
      const sync = () => { f.value = ed.getLength() < 2 && !ed.root.querySelector('img,iframe') ? '' : ed.root.innerHTML; };
      ed.on('text-change', sync);
      sync();
    }
    return ed;
  };

  const scan = () => document.querySelectorAll('[data-ms-editor]').forEach((e) => e.msEditor || MS.editor(e));
  addEventListener('load', scan);
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}
