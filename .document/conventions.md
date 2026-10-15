# Component markup + JS API conventions (Phase 2 output)

## Opt-in component markup
- Buttons: variants `.secondary .outline .ghost .contrast .success .warning .error` (combinable, e.g. `.outline.secondary`); sizes/shapes `.sm .lg .icon .fab`. Work on `[role=button]`, `input[type=submit]`.
- Layout: `.container`, `.container-fluid`, `.grid`, `.row > .col`.
- Badge: `.badge` (+ `.secondary/.success/.warning/.error/.info/.outline`).
- Chip: `.chip` (selected: `.selected` or `aria-pressed=true`; inner `button` = small close).
- Avatar: `<span class="avatar">AB</span>` or `<img class="avatar">`, sizes `.sm .lg`.
- Skeleton: `.skeleton` (user sets height).
- Stepper: `<ol class="stepper"><li class="done">…<li aria-current="step">…`.
- Pagination: `<nav class="pagination"><ul><li><a aria-current="page">`.
- Carousel: `.carousel > *` (`.carousel.full` = one slide per view).
- Drawer: `<dialog class="drawer" data-side="right">` (default left).
- Rating: `<fieldset class="rating">` with `input[type=radio]`+`label` pairs written 5→1 (labels contain ★).
- Dropzone: `<label class="dropzone"><input type=file>text</label>`.
- Toast: `.ms-toasts > .ms-toast[data-type]` (created by JS).
- Chart: `.chart > canvas`, height via `--ms-chart-h`.
- Dialog header close: empty `<button rel=prev>` or `[data-ms-close]` renders ×.
- Dropdown: `[popover].menu` or `menu[popover]` (anchored below trigger where `position-area` supported).
- Classless (no class): typography, buttons, all inputs, checkbox/radio, `input[type=checkbox][role=switch]`, range, select, textarea, fieldset, `[role=group]`, table (`.striped`), details/summary (`details[name]` exclusive), dialog > article, article (card), nav, `nav[aria-label=breadcrumb]`, progress, meter, `[aria-busy=true]`, `[data-tooltip]` (+`data-placement`), `[role=alert][data-type]`, tabs `[role=tablist]>[role=tab][aria-controls]` + `[role=tabpanel][id]`, figure, `[aria-invalid]`, `small` helper text.

## JS API
- `MS.toast(msg, {type='info'|'success'|'warning'|'error', timeout=4000, dismissible=true})` → element; `timeout:0` sticky. Declarative `[data-ms-toast="msg"]` + `data-ms-toast-type`.
- Tabs: no API — markup above; click + Arrow/Home/End keys; dynamic tablists auto-wired.
- `MS.chart(canvas|selector, {type, data, options})` → Chart instance or null (warns if no window.Chart). Types: bar line pie doughnut radar polarArea scatter bubble stacked-bar stacked-line combo (combo: datasets after first become line unless dataset has `type`).
- Declarative chart: `<canvas data-ms-chart="type" data-ms-chart-data='JSON' data-ms-chart-options='JSON'>`; auto-init incl. added later; destroyed on removal; re-themed on `ms:change`.
- Ripple: automatic under material/material3/default.
- Core: see contract.md §10 (MS.set/get/toggleMode/open/close/resolveColor, data-ms selects, data-ms-mode-toggle, data-ms-open/close, data-ms-persist, data-ms-fonts="off", Alpine $store.ms / $ms).
