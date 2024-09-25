# 🧼 Hyperless

[![JSR](https://jsr.io/badges/@dbushell/hyperless?labelColor=98e6c8&color=333)](https://jsr.io/@dbushell/hyperless) [![NPM](https://img.shields.io/npm/v/@dbushell/hyperless?labelColor=98e6c8&color=333)](https://www.npmjs.com/package/@dbushell/hyperless)

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

### `parseAttributes`

Parse an HTML attribute string into a case-insensitive deduplicated key/value map.

```javascript
import {parseAttributes} from '@dbushell/hyperless';
const map = parseAttributes('a="1" b="2" c d="d" D="d"');
```

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
