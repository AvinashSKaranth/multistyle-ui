# multistyle-ui

Framework-free, classless CSS UI library with **12 styles**, **30 themes** and light/dark mode. Write semantic HTML and it looks good; a few short classes opt in to extra components. One CSS file, one small JS file, no build step needed to use it.

**Live demo:** <https://avinashskaranth.github.io/multistyle-ui> (guide) and [components](https://avinashskaranth.github.io/multistyle-ui/components.html) (explorer). Offline: open [`docs/index.html`](docs/index.html) (works from `file://`). The guide is `docs/index.html`; the component explorer is on its own page, [`docs/components.html`](docs/components.html) (one tab per component, Preview/Code toggle, deep links like `docs/components.html#c-modal`); the Mermaid, Text editor, Code and Icons tabs load their libraries from a CDN and need network.

## Getting started

### 1. Add the CDN tags

Served by jsDelivr straight from this repo. `@HEAD` is the latest `master` (jsDelivr caches branches for up to 12 hours); for production pin a commit, e.g. `@5d573ca`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AvinashSKaranth/multistyle-ui@HEAD/dist/multistyle.min.css">
<script defer src="https://cdn.jsdelivr.net/gh/AvinashSKaranth/multistyle-ui@HEAD/dist/multistyle.min.js"></script>

<!-- optional: Alpine ($store.ms, $ms). Load AFTER multistyle -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<!-- optional: Chart.js, only if the page has charts -->
<script defer src="https://cdn.jsdelivr.net/npm/chart.js@4.x.x/dist/chart.umd.min.js"></script>
<!-- optional add-ons, each only on pages that use them (all CDN, need network):
     Mermaid  https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js
     Quill    https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js (+ quill.snow.css)
     Prism    https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-core.min.js
              + plugins/autoloader/prism-autoloader.min.js  (defer; order vs multistyle does not matter)
     Material Symbols font: loaded automatically from Google Fonts when a .ms-icon exists (body data-ms-icons="off" to opt out) -->

<body class="style-brutalist theme-ocean mode-system">
  <main class="container">
    <article>
      <h2>Login</h2>
      <label>Email <input type="email"></label>
      <button>Sign in</button>
      <button class="outline secondary">Cancel</button>
    </article>
  </main>
</body>
```

### 2. Optional: install the AI skill

`skill/` teaches an AI coding agent (Claude Code and others) to build pages with multistyle-ui:

```bash
npx skills add https://github.com/AvinashSKaranth/multistyle-ui
```

Add `-g` to install it for every project instead of only the current one. Run `npx skills update` to get the latest version.

## Body classes

| Class | Values | Default |
|---|---|---|
| `style-*` | material, material3, fluent, brutalist, pixel, neon, metro, bootstrap, cartoon, illustration, carbon, liquid-glass | `material` |
| `theme-*` | see below | `blue` |
| `mode-*` | light, dark, system | `system` (follows the OS) |

With no classes at all you get material + blue + system. Any element can carry these classes to scope a style/theme/mode to a section.

## Components

Typography, buttons (incl. tonal, icon, FAB), icons (Material Symbols), inputs (icons/affixes, floating labels (automatic and class-free in material/material3), autoresize textarea, character counter, custom and multi select), checkbox/radio/switch, range, rating, dropzone, fieldset/validation, button group, table, accordion, modal, drawer, command palette (Ctrl/Cmd+K), card, divider, nav/breadcrumb, progress/meter, spinner, tooltip, alert, tabs, sortable list, dropdown/popover (placement, hover), toast, chip/badge/avatar, skeleton, stepper, pagination (generated), carousel (arrows, dots, autoplay), layout, charts (Chart.js), Mermaid, text editor (Quill), code (Prism + textarea editor), fonts (`MS.set({font})`).

## Themes (30)

Pico colours: red, pink, fuchsia, purple, violet, indigo, blue, azure, cyan, jade, green, lime, yellow, amber, pumpkin, orange, sand, grey, zinc.
Named: slate, classic, ocean, forest, rose, midnight, gold, candy, storm, royal.
Plus `custom`.

## Custom theme

```html
<body class="style-material theme-custom"
      style="--ms-primary:#ff6600; --ms-secondary:#0066ff; --ms-surface:#fffaf5">
```

Or from JS: `MS.set({ primary: '#ff6600', secondary: '#0066ff', surface: '#fffaf5' })`. The surface should be a light colour.

## JavaScript

`window.MS`: `set` (style, theme, mode, font, colours), `get`, `toggleMode`, `toast`, `command`, `paginate`, `multiselect`, `code`, `chart`, `open`, `close`, `resolveColor`, `fonts`, plus the events `ms:change`, `ms:command`, `ms:sort`, `ms:page`, `ms:select`, `ms:dismiss`, and declarative attributes (`data-ms`, `data-ms-mode-toggle`, `data-ms-open`, `data-ms-toast`, `data-ms-chart`, `data-ms-persist`). See the docs page for the full table.

## Develop

```bash
npm install
npm run build   # esbuild -> dist/ (2 files), copied to docs/
npm run dev     # watch mode
npm test        # Playwright smoke tests against docs/index.html and docs/components.html (file://)
```

`docs/multistyle.min.*` and `docs/vendor/*` are build output. Do not edit them.

## License

Apache-2.0
