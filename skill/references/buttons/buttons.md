# Buttons

Classless `button`, `input[type=submit]`, `[role=button]`.
- Variants: `.secondary .outline .ghost .contrast .success .warning .error .info .tonal` (combinable); sizes `.sm .lg`; `.icon` (square), `.fab`.
- a11y: icon-only needs `aria-label`.
```html
<button>Save</button> <button class="tonal error sm">Delete</button>
<button class="icon outline" aria-label="Settings">...</button>
```
