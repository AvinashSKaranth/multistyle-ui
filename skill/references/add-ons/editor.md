# Text editor

Needs Quill (CDN script + snow css). `<div data-ms-editor data-toolbar="minimal|full" data-name="body" data-placeholder="..."></div>`; `data-name` syncs a hidden input so it submits in forms. `MS.editor(el)` / `el.msEditor` is the Quill instance (appears async once the CDN script loads).
