# Button group

`[role=group]` joins buttons (or input + button). `data-ms-select="single|multi"` toggles `aria-pressed` on children and fires `ms:select {values}`. `aria-orientation="vertical"` stacks.
```html
<div role="group" data-ms-select="single" aria-label="View">
  <button class="outline" aria-pressed="true">Day</button><button class="outline">Week</button></div>
```
