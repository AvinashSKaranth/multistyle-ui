# Multi-select

`select[multiple][data-ms-multiselect]` becomes chips + filter + listbox. The real select stays the form source of truth and fires `change` (Alpine `x-model` works). Attr `data-placeholder`. Keys: arrows/Enter/Escape; Backspace removes the last chip. `MS.multiselect(el)` inits manually.
```html
<select name="skills" multiple data-ms-multiselect data-placeholder="Pick...">
  <option value="js">JS</option><option value="css" selected>CSS</option></select>
```
