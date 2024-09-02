# 🧼 Hyperless

Remove the “H” from HTML. Hyperless is a lightweight library for converting HTML to plain text quickly. It removes the “ML” too I guess... HTML to text and other useful stuff. That’s the idea.

## Functions

### `stripTags`

Remove HTML and return text content with a few niceties.

```javascript
import {stripTags} from '@dbushell/hyperless';
// Pass a chunk of HTML
const text = stripTags('<p>Ceci n’est pas une paragraphe.</p>');
```

Text in `<blockquote>` and `<q>` are wrapped in quotation marks.

### `excerpt`

Generate a text excerpt from HTML content.

```javascript
import {excerpt} from '@dbushell/hyperless';
// Pass a chunk of HTML
const text = excerpt(html);
```

Output is context aware trimmed to the nearest sentence, or word, to fit the maximum length as close as possible.

An optional `maxLength` can be passed as the second argument (default: `300` characters).

* * *

[MIT License](/LICENSE) | Copyright © 2024 [David Bushell](https://dbushell.com)
