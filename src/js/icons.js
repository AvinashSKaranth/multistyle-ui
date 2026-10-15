// Material Symbols Outlined loader: injects the Google Fonts stylesheet once, when a .ms-icon exists.
// Opt out (self-host / offline): <body data-ms-icons="off"> and load the font yourself.
const HREF = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
export function init() {
  const root = document.documentElement;
  const ready = () => root.classList.add('ms-icons-ready'); // un-hides ligature text (CSS keeps it transparent until then)
  if (document.body.dataset.msIcons === 'off') return ready();
  let done = false;
  const load = () => {
    if (done) return;
    done = true;
    mo.disconnect();
    const font = () => document.fonts.load('1em "Material Symbols Outlined"', 'star').then(ready, () => {});
    const old = document.querySelector('link[href*="Material+Symbols"],link[href*="Material%20Symbols"]');
    if (old) return font();
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = HREF; l.onload = font;
    document.head.append(l);
  };
  const check = () => document.querySelector('.ms-icon') && load();
  const mo = new MutationObserver(check);
  mo.observe(document.body, { childList: true, subtree: true });
  check();
  setTimeout(() => mo.disconnect(), 10000); // cheap: stop watching after 10s
}
