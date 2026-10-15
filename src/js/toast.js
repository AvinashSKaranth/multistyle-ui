// MS.toast(message, {type, timeout, dismissible, title, position, icon}) + [data-ms-toast]
// One .ms-toasts popover container per position (data-position).
const POS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
export function init(MS) {
  const boxes = {};
  // A modal dialog makes everything outside itself inert (no clicks), so while one is open the
  // stacks live inside it; re-show the popover so it also sits above the dialog in the top layer.
  const place = (box) => {
    if (!box?.isConnected) return;
    const host = [...document.querySelectorAll('dialog')].reverse().find((d) => d.matches(':modal')) || document.body;
    if (box.parentNode !== host) host.append(box);
    if (box.showPopover) try { box.matches(':popover-open') && box.hidePopover(); box.showPopover(); } catch (e) { /* unsupported */ }
  };
  document.addEventListener('close', (e) => e.target.localName === 'dialog' && Object.values(boxes).forEach(place), true);
  MS.toast = (msg, { type = 'info', timeout = 4000, dismissible = true, title, position = 'bottom-right', icon } = {}) => {
    if (!POS.includes(position)) position = 'bottom-right';
    let box = boxes[position];
    if (!box || !box.isConnected) {
      box = boxes[position] = document.createElement('div');
      box.className = 'ms-toasts';
      box.dataset.position = position;
      box.setAttribute('aria-live', 'polite');
      box.setAttribute('popover', 'manual');
      document.body.append(box);
    }
    const t = document.createElement('div');
    t.className = 'ms-toast';
    t.setAttribute('role', 'status');
    t.dataset.type = type;
    const rm = () => { // slide out, then remove (reduced-motion makes the transition ~0ms)
      t.setAttribute('data-leaving', '');
      t.addEventListener('transitionend', () => t.remove(), { once: true });
      setTimeout(() => t.remove(), 300);
    };
    if (icon) {
      const i = document.createElement('span');
      i.className = 'ms-icon';
      i.setAttribute('aria-hidden', 'true');
      i.textContent = icon;
      t.append(i);
    } else t.dataset.icon = 'default';
    const body = document.createElement('div');
    body.className = 'ms-toast-body';
    if (title) {
      const h = document.createElement('strong');
      h.textContent = String(title); // text nodes: no HTML injection
      body.append(h);
    }
    body.append(String(msg));
    t.append(body);
    if (dismissible) {
      const b = document.createElement('button');
      b.className = 'ms-toast-close';
      b.setAttribute('aria-label', 'Close');
      b.textContent = '×';
      b.onclick = rm;
      t.append(b);
    }
    box.append(t);
    place(box);
    if (timeout > 0) setTimeout(rm, timeout);
    return t;
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('[data-ms-toast]');
    if (t) MS.toast(t.getAttribute('data-ms-toast'), {
      type: t.getAttribute('data-ms-toast-type') || 'info',
      position: t.getAttribute('data-ms-toast-position') || undefined,
      title: t.getAttribute('data-ms-toast-title') || undefined,
    });
  });
}
