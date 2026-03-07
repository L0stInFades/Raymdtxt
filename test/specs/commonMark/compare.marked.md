## Compare with `marked.js`

Marked.js failed examples count: 15
MarkText failed examples count: 0

**Example32**

MarkText success and marked.js fail

```markdown
Markdown content
[foo](/f&ouml;&ouml; "f&ouml;&ouml;")

Expected Html
<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>

Actural Html
<p><a href="/f&ouml;&ouml;" title="f&ouml;&ouml;">foo</a></p>

marked.js html
<p><a href="/f&ouml;&ouml;" title="f&ouml;&ouml;">foo</a></p>

```

**Example33**

MarkText success and marked.js fail

```markdown
Markdown content
[foo]

[foo]: /f&ouml;&ouml; "f&ouml;&ouml;"

Expected Html
<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>

Actural Html
<p><a href="/f&ouml;&ouml;" title="f&ouml;&ouml;">foo</a></p>

marked.js html
<p><a href="/f&ouml;&ouml;" title="f&ouml;&ouml;">foo</a></p>

```

**Example503**

MarkText success and marked.js fail

```markdown
Markdown content
[link](foo%20b&auml;)

Expected Html
<p><a href="foo%20b%C3%A4">link</a></p>

Actural Html
<p><a href="foo%20b&auml;">link</a></p>

marked.js html
<p><a href="foo%20b&auml;">link</a></p>

```

**Example512**

MarkText success and marked.js fail

```markdown
Markdown content
[link [foo [bar]]](/uri)

Expected Html
<p><a href="/uri">link [foo [bar]]</a></p>

Actural Html
<p>[link [foo [bar]]](/uri)</p>

marked.js html
<p>[link [foo [bar]]](/uri)</p>

```

**Example518**

MarkText success and marked.js fail

```markdown
Markdown content
[foo [bar](/uri)](/uri)

Expected Html
<p>[foo <a href="/uri">bar</a>](/uri)</p>

Actural Html
<p><a href="/uri">foo <a href="/uri">bar</a></a></p>

marked.js html
<p><a href="/uri">foo <a href="/uri">bar</a></a></p>

```

**Example519**

MarkText success and marked.js fail

```markdown
Markdown content
[foo *[bar [baz](/uri)](/uri)*](/uri)

Expected Html
<p>[foo <em>[bar <a href="/uri">baz</a>](/uri)</em>](/uri)</p>

Actural Html
<p>[foo *<a href="/uri">bar <a href="/uri">baz</a></a>*](/uri)</p>

marked.js html
<p>[foo *<a href="/uri">bar <a href="/uri">baz</a></a>*](/uri)</p>

```

**Example520**

MarkText success and marked.js fail

```markdown
Markdown content
![[[foo](uri1)](uri2)](uri3)

Expected Html
<p><img src="uri3" alt="[foo](uri2)" /></p>

Actural Html
<p>![<a href="uri2"><a href="uri1">foo</a></a>](uri3)</p>

marked.js html
<p>![<a href="uri2"><a href="uri1">foo</a></a>](uri3)</p>

```

**Example524**

MarkText success and marked.js fail

```markdown
Markdown content
[foo <bar attr="](baz)">

Expected Html
<p>[foo <bar attr="](baz)"></p>

Actural Html
<p>[foo <bar attr="](baz)"></p>

marked.js html
<p><a href="baz">foo &lt;bar attr=&quot;</a>&quot;&gt;</p>

```

**Example526**

MarkText success and marked.js fail

```markdown
Markdown content
[foo<https://example.com/?search=](uri)>

Expected Html
<p>[foo<a href="https://example.com/?search=%5D(uri)">https://example.com/?search=](uri)</a></p>

Actural Html
<p>[foo<a href="https://example.com/?search=%5D(uri)">https://example.com/?search=](uri)</a></p>

marked.js html
<p><a href="uri">foo&lt;https://example.com/?search=</a>&gt;</p>

```

**Example528**

MarkText success and marked.js fail

```markdown
Markdown content
[link [foo [bar]]][ref]

[ref]: /uri

Expected Html
<p><a href="/uri">link [foo [bar]]</a></p>

Actural Html
<p>[link [foo [bar]]]<a href="/uri">ref</a></p>

marked.js html
<p>[link [foo [bar]]]<a href="/uri">ref</a></p>

```

**Example532**

MarkText success and marked.js fail

```markdown
Markdown content
[foo [bar](/uri)][ref]

[ref]: /uri

Expected Html
<p>[foo <a href="/uri">bar</a>]<a href="/uri">ref</a></p>

Actural Html
<p><a href="/uri">foo <a href="/uri">bar</a></a></p>

marked.js html
<p><a href="/uri">foo <a href="/uri">bar</a></a></p>

```

**Example533**

MarkText success and marked.js fail

```markdown
Markdown content
[foo *bar [baz][ref]*][ref]

[ref]: /uri

Expected Html
<p>[foo <em>bar <a href="/uri">baz</a></em>]<a href="/uri">ref</a></p>

Actural Html
<p><a href="/uri">foo <em>bar <a href="/uri">baz</a></em></a></p>

marked.js html
<p><a href="/uri">foo <em>bar <a href="/uri">baz</a></em></a></p>

```

**Example536**

MarkText success and marked.js fail

```markdown
Markdown content
[foo <bar attr="][ref]">

[ref]: /uri

Expected Html
<p>[foo <bar attr="][ref]"></p>

Actural Html
<p><a href="/uri">foo &lt;bar attr=&quot;</a>&quot;&gt;</p>

marked.js html
<p><a href="/uri">foo &lt;bar attr=&quot;</a>&quot;&gt;</p>

```

**Example538**

MarkText success and marked.js fail

```markdown
Markdown content
[foo<https://example.com/?search=][ref]>

[ref]: /uri

Expected Html
<p>[foo<a href="https://example.com/?search=%5D%5Bref%5D">https://example.com/?search=][ref]</a></p>

Actural Html
<p><a href="/uri">foo&lt;https://example.com/?search=</a>&gt;</p>

marked.js html
<p><a href="/uri">foo&lt;https://example.com/?search=</a>&gt;</p>

```

**Example540**

MarkText success and marked.js fail

```markdown
Markdown content
[ẞ]

[SS]: /url

Expected Html
<p><a href="/url">ẞ</a></p>

Actural Html
<p>[ẞ]</p>

marked.js html
<p>[ẞ]</p>

```

There are 15 examples are different with marked.js.