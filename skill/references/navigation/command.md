# Command palette

```html
<button onclick="MS.command('#cmd')">Open <kbd>Ctrl K</kbd></button>
<dialog class="command" id="cmd"><input type="search" aria-label="Command">
  <ul role="listbox"><li role="option" data-group="Nav" data-keywords="home" data-shortcut="G H">Home</li></ul></dialog>
```
Ctrl/Cmd+K opens it. Option attrs: `data-group`, `data-keywords`, `data-shortcut`, `data-href`, `data-value`. Listen: `document.addEventListener("ms:command", e => e.detail.value)`. Keys: arrows, Enter, Esc.
