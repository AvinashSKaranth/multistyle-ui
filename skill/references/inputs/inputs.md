# Inputs

Classless text-like inputs. `label.field` wraps an input with slots `.ms-icon`, `.affix`, `button.ghost.icon`. `label.floating > input[placeholder=" "] + span` floats the label (Material filled by default / notched `.outlined` in material3; force with `label.floating.filled|.outlined` in any style; leading `.ms-icon` as first child, trailing `.ms-icon`/`button.ghost.icon` after the `<span>`; helper `<small>` right after the label; notch bg via `--ms-field-bg`). Material/material3 (and no-style) float plain labels automatically: `<label>Email <input></label>` or `<label for=x>Email</label><input id=x>`, no classes; other styles stay stacked; `data-ms-fields="stacked|floating|filled|outlined"` on an ancestor opts out/in (nearest wins). Wrap each control in a `<label>`; `aria-invalid` for errors, `small` for helper text.
```html
<label class="field"><span class="ms-icon">search</span><input type="search" aria-label="Search"></label>
<label class="floating"><input type="email" placeholder=" "><span>Email</span></label>
```
