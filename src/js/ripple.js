// Material ripple: only inside style-material / style-material3 (material is the default)
export function init() {
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest?.('button,[role=button],.chip');
    if (!b || b.disabled || b.tagName === 'INPUT' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const s = b.closest('[class^="style-"],[class*=" style-"]');
    const st = s ? [...s.classList].find((c) => c.startsWith('style-')).slice(6) : 'material';
    if (st !== 'material' && st !== 'material3') return;
    const r = b.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const el = document.createElement('span');
    el.className = 'ms-ripple';
    el.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.append(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 1000); // fallback if no animation CSS
  });
}
