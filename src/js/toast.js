// MS.toast(message, {type, timeout, dismissible}) + [data-ms-toast]
export function init(MS) {
  let box;
  MS.toast = (msg, { type = 'info', timeout = 4000, dismissible = true } = {}) => {
    if (!box || !box.isConnected) {
      box = document.createElement('div');
      box.className = 'ms-toasts';
      box.setAttribute('aria-live', 'polite');
      box.setAttribute('popover', 'manual');
      document.body.append(box);
    }
    const t = document.createElement('div');
    t.className = 'ms-toast';
    t.setAttribute('role', 'status');
    t.dataset.type = type;
    t.append(String(msg)); // text node: no HTML injection
    if (dismissible) {
      const b = document.createElement('button');
      b.className = 'ms-toast-close';
      b.setAttribute('aria-label', 'Close');
      b.textContent = '×';
      b.onclick = () => t.remove();
      t.append(b);
    }
    box.append(t);
    if (box.showPopover) { // re-show so the stack sits above any dialog opened since
      try { box.matches(':popover-open') && box.hidePopover(); box.showPopover(); } catch (e) { /* unsupported */ }
    }
    if (timeout > 0) setTimeout(() => t.remove(), timeout);
    return t;
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('[data-ms-toast]');
    if (t) MS.toast(t.getAttribute('data-ms-toast'), { type: t.getAttribute('data-ms-toast-type') || 'info' });
  });
}
