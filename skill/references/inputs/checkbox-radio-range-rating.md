# Checkbox, radio, switch, range, rating

Classless. `.sm .lg` sizes. Switch: `input[type=checkbox][role=switch]`. Indeterminate via JS `el.indeterminate = true`. Range fill is automatic; ticks via `list=` datalist.
Rating: `fieldset.rating` with radio+label (star) pairs written 5 to 1; `.sm .lg`; `fieldset disabled` or `data-readonly`. Read-only fractions: `<span class="rating-display" style="--value:3.5" role="img" aria-label="3.5 of 5">`.
```html
<label><input type="checkbox" role="switch" checked> Notifications</label>
```
