# Modal

```html
<button data-ms-open="#dlg">Open</button>
<dialog id="dlg" data-size="lg"><article>
  <header><button rel="prev" aria-label="Close"></button><h3>Title</h3></header><p>...</p></article></dialog>
```
Open with `data-ms-open` or `MS.open("#dlg")`; close with `rel=prev`, `[data-ms-close]`, Esc or backdrop. `data-size=sm|md|lg|full`. Native focus trap.
