# multistyle-ui — Plan

Framework-free, CDN-first CSS library with **multi-style + multi-theme + mode** support.
Sibling of `react-multistyle-ui` / `svelte-multistyle-ui`, but in the spirit of [Pico CSS](https://picocss.com/):
semantic HTML gets styled automatically, classes are optional.

Output: **exactly two files**

```
dist/multistyle.min.css
dist/multistyle.min.js
```

No Tailwind. No React/Svelte/Vue. Works in a plain `.html` file opened from disk.

---

## 1. Goals / non-goals

**Goals**
- Use it by adding **3 classes on `<body>`**: `style-*`, `theme-*`, `mode-*`.
- `<input>`, `<button>`, `<select>`, `<table>`, `<dialog>`, … pick up the active style + theme with **no per-element classes** (classless, like Pico).
- 12 styles, the same as the React/Svelte libs, implemented simply (tokens first, few element overrides).
- Themes: **Pico's 20 color palette** plus the **named custom themes** from the React/Svelte repos (§4.2).
- **Defaults:** no `style-*` gives `material`, no `theme-*` gives `blue`, no `mode-*` gives `system`. A bare `<body>` is Material + blue + system.
- `theme-custom`: the user supplies 3 colors (primary, secondary, a **light** surface) and every other color and shade is derived.
- **Charts** via Chart.js, which the user loads as a separate CDN. Our JS themes the charts if `window.Chart` exists.
- Works with **Alpine.js loaded as a second CDN**, and also with no Alpine at all.

**Non-goals (v1)**
- CodeEditor, TextEditor, CommandPalette, SortableList, MultiSelect, a custom DatePicker. Native `<input type="date">` covers dates; the rest can come later as optional add-ons.
- JS-rendered components. HTML is the API.
- Supporting browsers older than about 2024 baseline (see §9).

---

## 2. Usage (target DX)

```html
<!doctype html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/multistyle-ui@1/dist/multistyle.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/multistyle-ui@1/dist/multistyle.min.js"></script>
  <!-- optional: Alpine as 2nd CDN, loaded AFTER multistyle -->
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <!-- optional: Chart.js, only if the page has charts -->
  <script defer src="https://cdn.jsdelivr.net/npm/chart.js@4.x.x/dist/chart.umd.min.js"></script>
</head>
<body class="style-brutalist theme-ocean mode-system">
  <main class="container">
    <article>
      <h2>Login</h2>
      <label>Email <input type="email" placeholder="you@x.com"></label>
      <label><input type="checkbox" role="switch"> Remember me</label>
      <button>Sign in</button>
      <button class="outline secondary">Cancel</button>
    </article>
  </main>
</body>
</html>
```

Custom theme: the three tokens go inline on `<body>`.

```html
<body class="style-material theme-custom"
      style="--ms-primary:#ff6600; --ms-secondary:#0066ff; --ms-surface:#fffaf5">
```

---

## 3. Key architecture decisions

| # | Decision | Why |
|---|----------|-----|
| D1 | **Pure CSS drives style, theme and mode.** JS is optional sugar. | The page renders correctly with JS disabled and without a flash of the wrong theme. |
| D2 | **Mode via `color-scheme` + `light-dark()`.** `body{color-scheme:light dark}`, `.mode-light{color-scheme:light}`, `.mode-dark{color-scheme:dark}`. Every color token is `light-dark(<light>, <dark>)`. | One rule per token and no media-query duplication. "System" is the default for free, and native controls (scrollbars, date picker) follow the mode. |
| D3 | **Custom-theme shades are computed in CSS** with `color-mix(in oklch, …)` and relative color syntax `oklch(from var(--x) …)`. | No JS needed, and changing `--ms-primary` live re-derives everything instantly. |
| D4 | **Cascade layers**: `@layer ms.reset, ms.tokens, ms.base, ms.style, ms.utils;` | Any un-layered user CSS always wins with no specificity fights, so overrides are trivial. |
| D5 | **Low-specificity selectors** with `:where()`, e.g. `:where(.style-brutalist) :where(button)`. | Same reason as D4. Also lets a nested element override the style locally (§4.4). |
| D6 | **Alpine is used, not re-implemented.** Our JS is about 5–7 KB and registers an Alpine store and magic if Alpine is present. Interactive widgets lean on native HTML (`<dialog>`, `<details>`, `popover`, `commandfor`). | Re-implementing Alpine (about 15 KB, with a reactive engine) is wasted effort. Native HTML plus a tiny helper covers non-Alpine users. |
| D7 | **Build tool: `esbuild` only** (one dev dependency). | It bundles CSS `@import`s and JS into one IIFE, minified, in milliseconds. No PostCSS or Tailwind needed. |
| D8 | **Token prefix `--ms-`** (the existing libs use `--t-`). | Avoids clashing with the user's own CSS. The names map 1:1 to the existing `--t-*` set, so presets port mechanically. |

---

## 4. Body classes

### 4.1 Style: `style-<name>`
`material` (default if none), `material3`, `fluent`, `brutalist`, `pixel`, `neon`, `metro`, `bootstrap`, `cartoon`, `illustration`, `carbon`, `liquid-glass`.

Each style is one CSS file that overrides **shape tokens** first (radius, border width, shadow, font, transition) and then adds element rules only where tokens can't express the look (brutalist hard offset shadow, pixel inset bevels, neon glow, glass `backdrop-filter`, material ripple).

Traits are ported from `react-multistyle-ui/src/lib/components/*-styles.css`:

| Style | Radius | Border | Shadow / effect | Font |
|---|---|---|---|---|
| material | theme | theme | elevation shadows, ripple | Roboto |
| material3 | 20px pill buttons | theme | ripple | Roboto |
| fluent | 4px | theme | `0 1px 2px` subtle | Segoe UI |
| brutalist | 0 | solid `--ms-text` | `4px 4px 0 var(--ms-text)`, shifts on hover | Courier New |
| pixel | 0 | solid | inset bevels, `steps(3)` transitions | Courier New / pixel font |
| neon | theme | primary | double glow; filled = surface background with colored text | Exo 2 |
| metro | 0 | primary | none, weight 600 | Segoe UI |
| bootstrap | 6px | `--ms-border` | xs shadow, 3px focus ring | system |
| cartoon | 16px | `--ms-text` | 4–6px primary offset, bold | Comic Neue |
| illustration | 8px | `--ms-text` | 3–4px offset in border color, italic headings | Dancing Script |
| carbon | 0 | 2px bottom | none; hover colors the bottom border | IBM Plex Sans |
| liquid-glass | 16px | `rgba(255,255,255,.2)` | `backdrop-filter: blur(24px) saturate(1.6)`, inset highlight | system (Apple) |

**Fonts:** web fonts are not `@import`ed in the CSS, because that would download all 12. Each style sets `--ms-font` to a stack with system fallbacks. The JS lazily injects one Google Fonts `<link>` for the active style. Opt out with `data-ms-fonts="off"` on `<body>`.

### 4.2 Theme: `theme-<name>`
No class gives `blue`.

**A. Pico color themes (20):** `red`, `pink`, `fuchsia`, `purple`, `violet`, `indigo`, `blue`, `azure`, `cyan`, `jade`, `green`, `lime`, `yellow`, `amber`, `pumpkin`, `orange`, `sand`, `grey`, `zinc`, `slate`.
- These are simple: one primary hex (Pico's 550 step), a secondary picked as a neighboring hue, and the shared neutral surface and text (white / near-black, inverted in dark).
- Everything else is derived by `tokens.css` (§5.2). In practice each theme is about 3 lines of CSS.
- Light hues (`yellow`, `lime`, `amber`, `sand`) automatically get dark `--ms-on-primary` text.

**B. Named custom themes from the React/Svelte repos (9):** `ocean`, `forest`, `rose`, `midnight`, `gold`, `candy`, `storm`, `royal`, plus the repo's `default`, which is renamed `classic`.
- These keep their own tinted surface, text, card surface and radii from `presets.js`.
- **Name clash:** the repo's `slate` is merged into Pico's `slate`, keeping the repo's tinted surface values.

**C. `custom`:** user tokens (§5.3).

Port `react-multistyle-ui/src/lib/themes/presets.js` with a small Node script (`scripts/gen-themes.js`) that emits `src/css/themes.css`. The Pico hex values are hard-coded in `scripts/pico-colors.js`. Each preset becomes:

```css
.theme-ocean {
  --ms-primary: #0ea5e9;  --ms-secondary: #06b6d4;
  --ms-info: …; --ms-success: …; --ms-warning: …; --ms-error: …;
  --ms-surface:  light-dark(#ffffff, <inverted>);
  --ms-card:     light-dark(#e0f2fe, <inverted>);
  --ms-text:     light-dark(#0c4a6e, <inverted>);
  --ms-radius-btn: 10px; --ms-radius-card: 12px; --ms-radius-input: 8px; --ms-border-w: 1.5px;
}
```

The dark values come from the existing HSL-invert function (`color.js`, lift 20/10/14), run **at build time**. Dark-native themes (`midnight`, `storm`, `royal`) keep their explicit dark values.

### 4.3 Mode: `mode-<light|dark|system>`
No class means `system`. That is pure CSS (D2): `body{color-scheme:light dark}` plus `light-dark()` tokens. The JS only adds persistence and toggling (§6).

### 4.4 Scoped overrides (free bonus)
Because everything is token- and class-driven, the same classes work on **any element**:
```html
<section class="style-neon theme-midnight mode-dark"> … </section>
```
This needs no extra work, as long as style rules use `:where(.style-x) el` (descendant) rather than `body.style-x`. The innermost class wins because the nearest ancestor's custom properties apply.

---

## 5. Color system (the core)

### 5.1 Input tokens (all themes, including custom)
`--ms-primary`, `--ms-secondary`, `--ms-surface`. Optional: `--ms-text`, `--ms-info`, `--ms-success`, `--ms-warning`, `--ms-error`.

### 5.2 Derived tokens (one shared file `tokens.css`, applies to every theme)

**Shade scales** for `primary` and `secondary` (50 → 950, mixed in OKLCH so hue stays stable):
```css
--ms-primary-50:  color-mix(in oklch, var(--ms-primary) 8%,  white);
--ms-primary-100: color-mix(in oklch, var(--ms-primary) 16%, white);
--ms-primary-200: color-mix(in oklch, var(--ms-primary) 32%, white);
--ms-primary-300: color-mix(in oklch, var(--ms-primary) 52%, white);
--ms-primary-400: color-mix(in oklch, var(--ms-primary) 76%, white);
--ms-primary-500: var(--ms-primary);
--ms-primary-600: color-mix(in oklch, var(--ms-primary) 84%, black);
--ms-primary-700: color-mix(in oklch, var(--ms-primary) 68%, black);
--ms-primary-800: color-mix(in oklch, var(--ms-primary) 52%, black);
--ms-primary-900: color-mix(in oklch, var(--ms-primary) 38%, black);
--ms-primary-950: color-mix(in oklch, var(--ms-primary) 24%, black);
```
The same scale applies to secondary, and to neutral (from surface/text). Status colors get 3 steps (subtle, base, strong).

**Surface and text derivations:**
| Token | Formula |
|---|---|
| `--ms-surface-2` (cards) | `color-mix(in oklch, var(--ms-surface), var(--ms-text) 4%)` |
| `--ms-surface-3` (hover, inputs) | `… 8%` |
| `--ms-border` | `color-mix(in oklch, var(--ms-text) 14%, var(--ms-surface))` |
| `--ms-muted` | `color-mix(in oklch, var(--ms-text) 55%, var(--ms-surface))` |
| `--ms-disabled` | `… 35%` |
| `--ms-on-primary` | `oklch(from var(--ms-primary) clamp(0, (0.62 - l) * 999, 1) 0 0)`, auto black or white for contrast |
| `--ms-on-secondary` | same trick |
| `--ms-focus` | `color-mix(in oklch, var(--ms-primary) 45%, transparent)` |
| `--ms-shadow-color` | `color-mix(in oklch, var(--ms-primary) 18%, transparent)` |

### 5.3 `theme-custom`, including dark mode
**Rule:** the user's `--ms-surface` must be a **light** color. It is used **only in light mode**. In dark mode the **default dark surface and text** are used (the same as `theme-blue` in dark). Primary and secondary apply in both modes.

```css
.theme-custom {
  --ms-c-surface: light-dark(var(--ms-surface, #fff), var(--ms-default-surface-dark));
  --ms-c-text:    light-dark(var(--ms-default-text-light), var(--ms-default-text-dark));
  /* primary/secondary in dark: lift lightness slightly so they read on the dark surface */
  --ms-c-primary: light-dark(var(--ms-primary), oklch(from var(--ms-primary) max(l, 0.68) c h));
}
```
- Light surfaces only: the docs say so, and `MS.set({surface})` warns in the console if the surface's OKLCH lightness is below 0.85. There is no dark-native handling for custom themes.
- To avoid a naming clash between inputs and computed values, components read **effective** tokens (`--ms-c-*`), while users set **input** tokens (`--ms-primary`). `tokens.css` maps input to effective for all themes.

---

## 6. JavaScript (`multistyle.min.js`, target ≤ 7 KB min incl. chart bridge)

One IIFE that exposes `window.MS`. No dependencies.

| Feature | API | Notes |
|---|---|---|
| Set style/theme/mode | `MS.set({style, theme, mode, primary, secondary, surface}, el = document.body)` | Swaps `style-*`, `theme-*` and `mode-*` classes, and sets custom tokens inline. |
| Read current | `MS.get(el)` | Returns `{style, theme, mode, resolvedMode}`. |
| Persist | `data-ms-persist` on body | Saves to and restores from `localStorage` (wrapped in try/catch). Restore runs synchronously at script start; recommend the script without `defer` in `<head>` when persisting, to avoid a flash. |
| Toggle mode | `MS.toggleMode()` | Cycles light → dark → system. |
| Change event | `ms:change` CustomEvent on `document` | For non-Alpine users. |
| Font loader | automatic | Injects a Google Fonts link for the active style. |
| Declarative controls | `<select data-ms="style">`, `<button data-ms-mode-toggle>` | Zero-JS-written switchers. |
| Toast | `MS.toast(msg, {type, timeout})` | The only widget with no native equivalent. Renders into an auto-created `<div class="ms-toasts" popover="manual">`. |
| Tabs | `[role=tablist]` arrow-key and selection wiring | Delegated listener. About 30 lines. |
| Ripple | material/material3 only | Delegated `pointerdown`. CSS-only fallback otherwise. |

**Alpine integration** (inside the same file, about 20 lines):
```js
document.addEventListener('alpine:init', () => {
  Alpine.store('ms', MS.get());            // reactive {style, theme, mode}
  Alpine.magic('ms', () => MS);            // $ms.set({...}), $ms.toast(...)
  document.addEventListener('ms:change', e => Object.assign(Alpine.store('ms'), e.detail));
});
```
Usage: `<select x-model="$store.ms.style" @change="$ms.set({style: $event.target.value})">`.
Script order: multistyle before Alpine, both `defer`, which is how Alpine plugins are loaded.

**Charts (Chart.js, loaded separately by the user):**
- Our JS never bundles Chart.js. If `window.Chart` is missing, chart features stay inert and log one console warning when a chart is requested.
- **Declarative:** `<canvas data-ms-chart="bar" data-ms-chart-data='{"labels":[…],"datasets":[{"label":"…","data":[…]}]}'></canvas>`. All canvases are auto-initialized on `DOMContentLoaded`, and new ones are picked up via a `MutationObserver`, so Alpine `x-if`/`x-for` works.
- **Programmatic:** `MS.chart(canvas, chartJsConfig)` returns the Chart instance. It is the normal Chart.js config with theme defaults merged in.
- **Types:** `bar`, `line`, `pie`, `doughnut`, `radar`, `polarArea`, `scatter`, `bubble`, plus the shortcuts `stacked-bar`, `stacked-line` and `combo` (bar + line). These map to the native Chart.js type plus options, ported from `react-multistyle-ui/src/lib/components/charts/chart-config.js`.
- **Theming:** the dataset palette is primary, secondary, success, warning, error, info, then primary shades. Grid, ticks, legend and tooltip use the text, border and surface tokens, and the font comes from `--ms-font`.
- **Re-theming:** on `ms:change` and on OS `prefers-color-scheme` change, every chart's colors are recomputed and `chart.update('none')` is called.
- **Gotcha:** `getComputedStyle().getPropertyValue('--ms-primary')` returns the *unresolved* `color-mix()`/`light-dark()` text, which Chart.js can't parse. Resolve colors by setting a hidden probe element's `color: var(--x)` and reading `getComputedStyle(probe).color`.
- Card wrapper styling for charts: `article > canvas` sizing rules in `components/chart.css`, ported from `chart-styles.css`.
- Size: about 1.5 KB min extra. JS budget is raised to ≤ 7 KB.

**Native-first interactivity (no JS from us):**
- Modal: `<dialog>` + `<button commandfor="dlg" command="show-modal">`. Fallback `MS.open('#dlg')` for older Safari.
- Drawer: `<dialog class="drawer">` (CSS slide-in).
- Accordion: `<details name="group">` (exclusive groups are native).
- Dropdown / popover / tooltip: `popover` attribute + CSS anchor positioning where supported, `[data-tooltip]` CSS-only (Pico pattern).
- Carousel: CSS scroll-snap.

---

## 7. Component coverage

### 7.1 Classless (auto-styled, no class needed)
| Element | Notes |
|---|---|
| `body`, headings, `p`, `a`, `small`, `mark`, `kbd`, `code`, `pre`, `blockquote`, `hr` | Typography from tokens. |
| `button`, `input[type=submit/button/reset]`, `[role=button]` | Primary filled by default. |
| `input` (text, email, password, number, search, url, tel, date, time, datetime-local, month, color, file) | Includes `:focus-visible`, `:invalid` after `:user-invalid`, `[aria-invalid]` states. |
| `input[type=checkbox]`, `input[type=radio]` | `appearance:none` custom. |
| `input[type=checkbox][role=switch]` | Toggle. |
| `input[type=range]` | Slider. |
| `select`, `select[multiple]`, `textarea` | |
| `label`, `fieldset`, `legend`, `[role=group]` (button group / input group) | |
| `table`, `thead`, `tbody`, `tfoot` | Striped option with `.striped`. |
| `details`/`summary` | Accordion. |
| `dialog`, `dialog > article` | Modal. |
| `article` | Card (Pico convention). `header`/`footer` inside are styled. |
| `nav ul`, `nav[aria-label=breadcrumb]` | Navbar and breadcrumb. |
| `progress`, `meter` | ProgressBar. |
| `[aria-busy=true]` | Spinner (on a button or any element). |
| `[data-tooltip]` | Tooltip. |
| `[role=alert]` | Alert (`data-type="success|warning|error|info"`). |
| `[role=tablist]` / `[role=tab]` / `[role=tabpanel]` | Tabs (JS wiring §6). |
| `[popover]` | Popover / dropdown menu. |

### 7.2 Opt-in classes (few, short, Pico-style)
- Button variants: `.secondary`, `.outline`, `.ghost`, `.success`, `.warning`, `.error`, `.icon` (IconButton), `.fab`. Sizes: `.sm`, `.lg`.
- Layout: `.container`, `.container-fluid`, `.grid` (auto columns), `.row`, `.col`.
- Display: `.chip`, `.avatar`, `.skeleton`, `.badge`, `ol.stepper`, `nav.pagination`, `.carousel`, `.drawer` (on dialog), `.rating` (radio-based, CSS only), `.dropzone` (on a file label).
- Toast container: `.ms-toasts` (JS-created).

Each component lives in `src/css/components/<name>.css`, with style-specific overrides in `src/css/styles/<style>.css` grouped by component. Port the visual values from the matching `react-multistyle-ui/src/lib/components/<comp>-styles.css`; the selectors are rewritten from `.s-button-brutalist` to `:where(.style-brutalist) :where(button, …)`.

---

## 8. Repo layout

```
multistyle-ui/
├─ .document/plan.md
├─ src/
│  ├─ css/
│  │  ├─ index.css              # @layer order + @imports (esbuild entry)
│  │  ├─ reset.css              # minimal modern reset (layer ms.reset)
│  │  ├─ tokens.css             # derived tokens, shade scales, color-scheme/mode (ms.tokens)
│  │  ├─ themes.css             # GENERATED from presets (ms.tokens)
│  │  ├─ components/*.css       # classless + opt-in base rules (ms.base)
│  │  ├─ styles/<style>.css     # 12 files (ms.style)
│  │  └─ utils.css              # tiny utility set: visually-hidden, text-muted, gap-* (ms.utils)
│  └─ js/
│     ├─ index.js               # MS API, persistence, font loader, alpine bridge
│     ├─ toast.js
│     ├─ tabs.js
│     └─ chart.js               # Chart.js bridge (no Chart.js bundled)
├─ scripts/
│  ├─ presets.js                # copied from react-multistyle-ui themes/presets.js
│  ├─ pico-colors.js            # 20 Pico palette hexes
│  ├─ gen-themes.js             # presets → src/css/themes.css (uses HSL-invert from color.js)
│  └─ build.js                  # esbuild: css + js → dist/*.min.*, prints sizes
├─ docs/                        # self-sufficient docs/demo site (GitHub Pages ready), see §12
│  ├─ index.html
│  ├─ docs.css / docs.js        # docs-page chrome only (sidebar, code blocks, copy button)
│  ├─ multistyle.min.css/.js    # COPIED from dist/ by build
│  └─ vendor/alpine.min.js, vendor/chart.umd.min.js   # COPIED from node_modules by build
├─ tests/smoke.spec.js          # Playwright: computed-style checks
├─ dist/multistyle.min.css
├─ dist/multistyle.min.js
├─ package.json                 # devDeps: esbuild, @playwright/test
└─ README.md
```

**Build** (`npm run build`):
1. `node scripts/gen-themes.js`
2. `esbuild src/css/index.css --bundle --minify --outfile=dist/multistyle.min.css`
3. `esbuild src/js/index.js --bundle --minify --format=iife --outfile=dist/multistyle.min.js`

4. Copy `dist/*` and the vendor files (`alpinejs`, `chart.js` devDeps) into `docs/`.

`npm run dev` runs esbuild in watch mode plus `esbuild --servedir=docs` to serve the docs page.

**Publishing:** npm package `multistyle-ui` with `files: ["dist"]`. The CDN is jsDelivr/unpkg off npm, so there is no separate CDN setup.

---

## 9. Browser support

Target: **Baseline 2024+** (Chrome/Edge 123+, Firefox 128+, Safari 17.5+).
| Feature | Needed for | Fallback |
|---|---|---|
| `light-dark()` | mode | none needed at target |
| `color-mix()` | shades | none needed at target |
| Relative color `oklch(from …)` | on-color contrast, custom dark | static `--ms-on-primary: #fff` declared first, overridden inside `@supports (color: oklch(from red l c h))` |
| `@layer` | overrides | none needed |
| `popover` | dropdown/tooltip | at target |
| `commandfor` | dialog open without JS | `MS.open()` + `data-ms-open="#id"` delegated handler |
| CSS anchor positioning | popover placement | progressive: default centered/below placement |

---

## 10. Milestones

| # | Milestone | Deliverable | Done when |
|---|---|---|---|
| M1 | Skeleton + build | package.json, esbuild script, empty layers, dist outputs 2 files | `npm run build` produces both files |
| M2 | Tokens + themes + mode | `tokens.css`, `gen-themes.js`, `themes.css` | 20 Pico + 9 named + custom render correctly in light, dark and system; bare `<body>` is material + blue + system; on-primary contrast ≥ 4.5 on all presets |
| M3 | Base classless elements (material) | typography, buttons, forms, table, article, details, dialog, nav, progress | Docs page "Elements" sections look complete with no classes |
| M4 | Opt-in components | chip, avatar, alert, tabs, tooltip, popover, skeleton, spinner, stepper, pagination, grid, drawer, toast, carousel, rating, dropzone | All listed in §7 render |
| M5 | 12 styles | `styles/*.css` ported from react libs | Gallery switcher shows each style distinctly for every element |
| M6 | JS | MS API, persistence, fonts, toast, tabs, ripple, Alpine bridge | Works with and without Alpine; ≤ 7 KB min |
| M6b | Charts | chart bridge + `components/chart.css`, all 11 types | Charts render declaratively and via `MS.chart()`, re-theme on mode/theme switch, stay inert without Chart.js |
| M7 | Docs page + tests + README | finish `docs/` (§12), Playwright smoke tests against `docs/index.html`, README with CDN snippet | Tests green; `docs/index.html` works from `file://` with no network; README copy-paste example works |

Rough size budget: CSS ≤ 80 KB min (≈ 14 KB gzip), JS ≤ 7 KB min.

---

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | 12 styles × ~35 elements makes the CSS large | Styles override tokens first; element rules only where needed. Track size in the build output. Optional later: per-style CSS files alongside the full bundle. |
| R2 | 29 themes bloat the CSS | Pico themes are about 3 lines each (primary + secondary only); derivations are shared in `tokens.css`. |
| R3 | `liquid-glass` needs a colorful background to look right, and forces white text in light mode in the react lib | Ship a default gradient body background under `.style-liquid-glass`, overridable via `--ms-bg-image`. |
| R4 | Classless rules clash with third-party widgets on the page | `@layer` keeps our rules weak, and a `.ms-reset-off` / `[data-ms-ignore]` escape hatch uses `:where(:not([data-ms-ignore] *))`. Add it only if someone hits the problem. |
| R5 | Google Fonts are an external request (privacy/offline) | Font loader can be disabled; system fallbacks are always in the stack. |

---

## 12. Docs page (`docs/`)

A single self-sufficient page that shows **how to use every component**. Doubles as the live gallery and the Playwright test target.

**Self-sufficient:** no network needed. It loads the library, Alpine and Chart.js from local copies in `docs/` (copied by the build). It opens from `file://` or is served as GitHub Pages from `/docs`. Only the Google Fonts for styles are external, and they degrade to system fonts offline.

**Layout:** built with the library itself (dogfooding).
- **Top bar:** style `<select>`, theme `<select>`, mode toggle, and for `theme-custom` three `<input type="color">` pickers. All are wired through Alpine and `$ms.set()`, and the current `<body class="…">` string is shown live, ready to copy.
- **Sidebar:** links to every section, using `nav` with an `aria-current` scroll spy.
- **Main sections:**
  1. **Getting started:** CDN snippet (CSS, JS, optional Alpine, optional Chart.js), the 3 body classes, defaults.
  2. **Styles:** card grid with one mini preview per style (each card uses scoped `style-*` classes, §4.4).
  3. **Themes:** swatch grid of all 30 themes showing primary/secondary shades 50–950, click to apply.
  4. **Custom theme:** color pickers plus the generated inline-style snippet.
  5. **Elements (classless):** typography, buttons, every input type, checkbox/radio/switch, range, select, textarea, fieldset, table, details, dialog, article, nav, progress/meter, tooltip, busy.
  6. **Components (opt-in classes):** button variants, chip, badge, avatar, alert, tabs, popover/dropdown, drawer, toast, skeleton, stepper, pagination, carousel, rating, dropzone, grid/row/col.
  7. **Charts:** all 11 types, declarative and `MS.chart()`.
  8. **JS API:** `MS.set/get/toggleMode/toast/chart/open`, the `ms:change` event, persistence, Alpine `$store.ms` / `$ms`.
  9. **Alpine recipes:** style switcher, modal with `x-data`, toast on submit, live chart data.
- **Each example block:** live preview, then the exact HTML source in `<pre><code>`, then a copy button, then 1–2 lines of notes (classless or class needed, a11y attributes). **Single source:** each example is written once inside `<template class="example">`. `docs.js` clones it into the preview and escapes the same markup into the code block, so preview and snippet can never drift.

**Docs-only code:** `docs.css` and `docs.js` handle layout chrome, example rendering and copy. They are not shipped in `dist/`.

## 13. Decisions (confirmed 2026-10-15)

1. **Class names:** plain `style-*`, `theme-*`, `mode-*`. Defaults: `material` + `blue` + `system`.
2. **Alpine:** optional 2nd CDN plus a tiny bridge; not re-implemented. **npm/CDN:** `multistyle-ui` via jsDelivr.
3. **Themes:** Pico's 20 colors, the 9 named themes from the React/Svelte repos, and `custom`. Styles kept simple.
4. **Custom theme:** surface must be light and is used in light mode only; dark mode uses the default dark surface and text.
5. **Charts:** included; the user loads the Chart.js CDN separately and our JS themes the charts.
6. **CodeGraph:** initialized in `multistyle-ui/`. The index is empty until source exists; re-run `codegraph index` after M1.
7. **Docs page:** self-sufficient `docs/index.html` showing usage of every component (§12).
