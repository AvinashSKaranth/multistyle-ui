# Fonts

`MS.set({font:"inter"})`: a key of `MS.fonts` (case-insensitive), any CSS font-family string, or `"auto"` (style default). Google Fonts load lazily (`body[data-ms-fonts=off]` disables). `<select data-ms="font"></select>` is auto-populated. `MS.set({font}, el)` scopes `--ms-font` to an element. `ms:change` detail includes font.
