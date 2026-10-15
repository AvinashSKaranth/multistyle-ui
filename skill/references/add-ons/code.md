# Code

Needs Prism core + autoloader (CDN); no Prism theme CSS (the library themes tokens). Read-only: `<pre><code class="language-js">...</code></pre>`. Editor: `<textarea data-ms-code="javascript" data-ms-lines name="src" rows="6">` (still a form field; Tab = 2 spaces, Esc then Tab leaves; honours `readonly`; works uncoloured without Prism). `MS.code(el,{language,lines})` returns `{el,update(),destroy()}`; call `update()` after setting `.value`.
