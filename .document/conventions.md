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

## Additions (round 2)
- Buttons: `.tonal` (soft fill) and `.info`; combine with other variants/sizes. Icons: `<span class="ms-icon" aria-hidden="true">name</span>` (Material Symbols, loaded on demand; `.filled`; `body[data-ms-icons=off]` opts out). Keep a text label / aria-label.
- Modal `dialog[data-size=sm|md|lg|full]`; Drawer `data-side=left|right|top|bottom`.
- Alert: `[data-type]` gets a default icon (`data-icon="none"` removes), leading `strong` = title, `.close[data-ms-dismiss]`. `[data-ms-dismiss]` removes closest alert/.chip/.ms-toast/[data-ms-dismissable] (fires `ms:dismiss`).
- Toast: `MS.toast(msg,{type,timeout,dismissible,title,position:'top|bottom-left|center|right',icon})`; attrs `data-ms-toast-position`, `data-ms-toast-title`.
- Divider: `.divider` (label text), `.vr` / `.divider.vertical`. Card: `article.flat|.elevated|.compact|.spacious|.p-0`. Layout: `.grid` with `--cols`/`--min`, `.column`, `.row.justify-*|align-*`.
- Progress `.sm .lg .striped .animated`; Skeleton `.circle .text .rect`; Chip `.sm .lg`, `.avatar-group`, `.avatar[data-status]`; Table `.table-wrap` (`--ms-table-h`) + `table.sticky .compact .hover`.
- Inputs: `label.field` wrapper with slots `.ms-icon .affix button.ghost.icon`; `label.floating > input|textarea|select + span` (input needs `placeholder=" "`); `textarea.autoresize` (`--min-rows/--max-rows`); `data-ms-counter` + maxlength; `select.custom` (Chromium base-select); `select[multiple][data-ms-multiselect]` (`MS.multiselect(el)`, fires change); range ticks via `list=`; `.rating-display[style=--value:3.5]`, `.rating.sm|.lg`, readonly via fieldset disabled/`data-readonly`.
- Command palette: `dialog.command > input[type=search] + ul[role=listbox] > li[role=option][data-group|data-keywords|data-shortcut|data-href]`; Ctrl/Cmd+K or `MS.command(sel)`; event `ms:command {value, el}`.
- Sortable: `[data-ms-sortable]` (`="horizontal"`), optional `[data-ms-handle]`; keyboard Space/arrows/Space/Escape; `ms:sort {from,to,order}`.
- Carousel: `data-ms-arrows`, `data-ms-dots`, `data-ms-autoplay="ms"`. Pagination: `nav.pagination[data-ms-pages][data-ms-page][data-ms-window]` / `MS.paginate(nav,{total,current,window})`; `ms:page {page}`. Group: `[role=group][data-ms-select=single|multi]` toggles aria-pressed, `ms:select {values}`, `aria-orientation=vertical`.
- Popover: `data-placement`, `[data-ms-hover-popover="#id"]` with `popover=manual`.
- Code (CDN Prism core + autoloader, no theme CSS): `pre>code.language-x` highlighted; `textarea[data-ms-code=lang][data-ms-lines]` editor; `MS.code(el,{language,lines})` -> `{el,update(),destroy()}`.
- Fonts: `MS.set({font})` (key of `MS.fonts`, CSS family string, or `auto`), `MS.fonts`, `select[data-ms=font]`, `ms:change` detail includes font.
- Class-free floating labels (`autofloat.css`, `ms.utils`): in style-material (filled) and style-material3 (outlined, notch via the label's `::first-line` background) — and with no style class — plain `<label>Email <input></label>` and `<label for=x>Email</label><input id=x>` float automatically (input/textarea/select; date-like + select always floated; checkbox/radio/range/color/file/multi-control labels/`.floating|.field|.dropzone` untouched). Other styles are unchanged. Scope = inherited `--ms-af` (read via `@container style()`, nearest ancestor wins); `data-ms-fields="stacked|floating|filled|outlined"` on any ancestor overrides (`floating` = the style's natural variant; use `stacked` for app chrome such as toolbars). `forms.js` adds `placeholder=" "` (tagged `data-ms-ph`, removed when the scope stops floating, author placeholders never touched) on init, added nodes and `ms:change`; without JS the label stays floated. Limits: pattern A needs one control per label; textarea must come after the label text and gets no required `*`; helper `<small>` inside the label works for pattern A only; changing `data-ms-fields` at runtime is not observed; style-scope changes on a non-body element fire no `ms:change`.
