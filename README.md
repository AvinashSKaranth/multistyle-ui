# multistyle-ui

Framework-free, classless CSS UI library with **12 styles**, **30 themes** and light/dark mode. Write semantic HTML and it looks good; a few short classes opt in to extra components. One CSS file, one small JS file, no build step needed to use it.

**Docs and live gallery:** open [`docs/index.html`](docs/index.html) (works from `file://`, or serve `/docs` on GitHub Pages).

## Usage (CDN)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/multistyle-ui@0/dist/multistyle.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/multistyle-ui@0/dist/multistyle.min.js"></script>

<!-- optional: Alpine ($store.ms, $ms). Load AFTER multistyle -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<!-- optional: Chart.js, only if the page has charts -->
<script defer src="https://cdn.jsdelivr.net/npm/chart.js@4.x.x/dist/chart.umd.min.js"></script>

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

## Body classes

| Class | Values | Default |
|---|---|---|
| `style-*` | material, material3, fluent, brutalist, pixel, neon, metro, bootstrap, cartoon, illustration, carbon, liquid-glass | `material` |
| `theme-*` | see below | `blue` |
| `mode-*` | light, dark, system | `system` (follows the OS) |

With no classes at all you get material + blue + system. Any element can carry these classes to scope a style/theme/mode to a section.

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

`window.MS`: `set`, `get`, `toggleMode`, `toast`, `chart`, `open`, `close`, `resolveColor`, plus the `ms:change` event and declarative attributes (`data-ms`, `data-ms-mode-toggle`, `data-ms-open`, `data-ms-toast`, `data-ms-chart`, `data-ms-persist`). See the docs page for the full table.

## Develop

```bash
npm install
npm run build   # esbuild -> dist/ (2 files), copied to docs/
npm run dev     # watch mode
npm test        # Playwright smoke tests against docs/index.html (file://)
```

`docs/multistyle.min.*` and `docs/vendor/*` are build output. Do not edit them.

## License

Apache-2.0
