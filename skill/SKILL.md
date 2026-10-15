---
name: multistyle-ui
description: Build standalone HTML pages with multistyle-ui, a framework-free classless CSS UI library (12 styles, 30 themes, light/dark) loaded from a CDN, optionally with Alpine.js. Use when the user wants a plain HTML/CSS/JS page or prototype with polished components (buttons, forms, modals, drawers, toasts, tabs, tables, command palette, charts, code, icons), asks for Material/Fluent/Brutalist/Neon-style pages without React or a build step, or mentions multistyle-ui, `MS.set`, or `style-*`/`theme-*`/`mode-*` classes. Not for React (use react-multistyle-ui) or Tailwind/Bootstrap questions.
---

# multistyle-ui

Semantic HTML is styled with no classes; a few short classes opt in to extras. One CSS + one JS file. Per-component notes live in `references/<group>/`: read only the files for the components the page uses.

## Reference index
| Group | Files |
|---|---|
| Getting started | [classless-basics](references/getting-started/classless-basics.md), [layout](references/getting-started/layout.md), [fonts](references/getting-started/fonts.md) |
| Buttons | [buttons](references/buttons/buttons.md), [group](references/buttons/group.md) (button group), [chip-badge-avatar](references/buttons/chip-badge-avatar.md) |
| Inputs | [inputs](references/inputs/inputs.md) (text, icons/affixes, floating labels), [textarea](references/inputs/textarea.md), [select](references/inputs/select.md), [multiselect](references/inputs/multiselect.md), [checkbox-radio-range-rating](references/inputs/checkbox-radio-range-rating.md), [dropzone](references/inputs/dropzone.md) |
| Navigation | [tabs](references/navigation/tabs.md), [pagination](references/navigation/pagination.md), [stepper](references/navigation/stepper.md), [command](references/navigation/command.md) (Ctrl/Cmd+K palette) |
| Overlays (modals, drawers) | [modal](references/overlays/modal.md), [drawer](references/overlays/drawer.md), [dropdown](references/overlays/dropdown.md) (popover), [toast](references/overlays/toast.md) |
| Data display | [table](references/data-display/table.md), [alert](references/data-display/alert.md), [skeleton-progress-spinner](references/data-display/skeleton-progress-spinner.md), [carousel](references/data-display/carousel.md), [sortable](references/data-display/sortable.md), [icons](references/data-display/icons.md) |
| Add-ons (CDN) | [charts](references/add-ons/charts.md) (Chart.js), [mermaid](references/add-ons/mermaid.md), [editor](references/add-ons/editor.md) (Quill), [code](references/add-ons/code.md) (Prism) |

## 1. CDN setup (order matters)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AvinashSKaranth/multistyle-ui@HEAD/dist/multistyle.min.css">
<script defer src="https://cdn.jsdelivr.net/gh/AvinashSKaranth/multistyle-ui@HEAD/dist/multistyle.min.js"></script>
<!-- optional, AFTER multistyle -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```
`window.MS` is a global; do not import it as an ES module.

## 2. Body classes and defaults
`<body class="style-brutalist theme-ocean mode-dark">`. All optional; defaults: `style-material theme-blue mode-system` (follows the OS). Any element can carry them to scope a section. `data-ms-persist` on body remembers choices (localStorage).

- Styles (12): material, material3, fluent, brutalist, pixel, neon, metro, bootstrap, cartoon, illustration, carbon, liquid-glass.
- Themes (30): red pink fuchsia purple violet indigo blue azure cyan jade green lime yellow amber pumpkin orange sand grey zinc; slate classic ocean forest rose midnight gold candy storm royal; `custom`.
- Modes: light, dark, system.

## 3. Custom theme
```html
<body class="style-material theme-custom" style="--ms-primary:#ff6600; --ms-secondary:#0066ff; --ms-surface:#fffaf5">
```
JS: `MS.set({primary, secondary, surface})` (a colour implies custom). Surface must be a light colour; dark mode derives its own.

## 4. Classless (no class needed)
Typography, buttons, all inputs, checkbox/radio, `input[role=switch]`, range, select, textarea, fieldset, `[role=group]`, table, details/summary (`details[name]` = exclusive accordion), `dialog > article`, `article` (card), nav, breadcrumb (`nav[aria-label=breadcrumb]`), progress, meter, `[aria-busy=true]` (spinner), `[data-tooltip]` (+`data-placement`), `[role=alert][data-type]`, tabs (`[role=tablist]>[role=tab][aria-controls]` + `[role=tabpanel][id]`), figure, `[aria-invalid]`.

## 5. Opt-in class cheat sheet
- Buttons: `.secondary .outline .ghost .contrast .success .warning .error .info .tonal`; `.sm .lg .icon .fab`.
- Layout: `.container .container-fluid .grid` (`--cols` / `--min`), `.row .col .column`, `.row.justify-between|center|end .align-start|center|end`.
- `.badge .chip(.sm .lg) .avatar(.sm .lg, data-status) .avatar-group .skeleton(.circle .text .rect) .stepper .pagination .carousel(.full) .rating .rating-display .dropzone .divider .vr .chart .table-wrap`.
- Cards: `article.flat|.elevated|.compact|.spacious|.p-0`. Progress: `.sm .lg .striped .animated`.
- Dialogs: `dialog[data-size=sm|md|lg|full]`, `dialog.drawer[data-side=left|right|top|bottom]`, `dialog.command`. Dialog close: empty `<button rel="prev">` or `[data-ms-close]`.
- Inputs: `label.field`, `label.floating`, `textarea.autoresize`, `select.custom`, `.ms-icon`.

## 6. JS API (`window.MS`)
- `MS.set({style,theme,mode,font,primary,secondary,surface}, el?)`, `MS.get(el?)`, `MS.toggleMode()`, `MS.styles / themes / modes / fonts`.
- `MS.toast(msg,{type,timeout,dismissible,title,position,icon})`; `MS.open(sel)`, `MS.close(sel)`; `MS.command(sel)`; `MS.paginate(nav,{total,current,window})`; `MS.multiselect(el)`; `MS.code(el,{language,lines})`; `MS.chart(canvas,cfg)`; `MS.editor(el)`; `MS.mermaid(el)`; `MS.resolveColor(x)`.
- Events: `ms:change`, `ms:command`, `ms:sort`, `ms:page`, `ms:select`, `ms:dismiss`.
- Declarative: `select[data-ms=style|theme|mode|font]`, `data-ms-mode-toggle`, `data-ms-open="#id"`, `data-ms-close`, `data-ms-toast` (`-type -title -position`), `data-ms-dismiss`, `data-ms-sortable`, `data-ms-multiselect`, `data-ms-counter`, `data-ms-code`, `data-ms-autoplay|arrows|dots`, `data-ms-pages`, `data-ms-select`, `data-ms-hover-popover`, `data-ms-chart` (`-data -options`), `data-ms-editor`, body `data-ms-persist`, `data-ms-fonts="off"`, `data-ms-icons="off"`.

## 7. Alpine
Load after multistyle. `$store.ms` (reactive style/theme/mode/font) and `$ms` (the MS object):
```html
<div x-data><select x-model="$store.ms.style" @change="$ms.set({style:$event.target.value})">
  <template x-for="s in $ms.styles"><option :value="s" x-text="s"></option></template></select></div>
```
Native dialog: `@click="$refs.d.showModal()"`. Multi-select fires `change` (works with `x-model`).

## 8. Optional CDN add-ons (need network; add only if used)
Chart.js `chart.js@4.x.x/dist/chart.umd.min.js`; Mermaid `mermaid@11.4.1/dist/mermaid.min.js`; Quill `quill@2.0.3/dist/quill.js` + `quill.snow.css`; Prism `prismjs@1.30.0/components/prism-core.min.js` + `plugins/autoloader/prism-autoloader.min.js` (all under `https://cdn.jsdelivr.net/npm/`). Material Symbols loads itself from Google Fonts when a `.ms-icon` exists.

## 9. Gotchas
- Do not give your own classes names containing `theme-`, `mode-` or `style-`: they collide with the switchers.
- Nested theme scope: a `theme-*` on an inner element rescopes tokens only for that subtree; top-layer content (dialogs, popovers, toasts) is styled from where it lives in the DOM, so scope those too if needed.
- Script order: multistyle first, then Alpine; add-on libs `defer`, any order.
- Use real `<dialog>`, `<button>`, `<label>`; icon-only controls need `aria-label`; `.ms-icon` gets `aria-hidden="true"` plus text.
- Do not override `--ms-*` tokens on body unless using theme-custom.
- Inline `<script>` in dynamically inserted HTML will not run; call MS APIs explicitly.
- Template ids (dialogs, tab panels) must be unique per page.
