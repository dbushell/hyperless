# 🧼 Hyperless

Remove the “H” from HTML. Hyperless is a lightweight library for converting HTML to plain text quickly. It removes the “ML” too I guess... HTML to text and other useful stuff. That's the idea.

## Functions

### `stripTags`

Remove HTML and return text content with a few niceties.

```javascript
import {stripTags} from '@dbushell/hyperless';

const text = stripTags('<p>Ceci n’est pas une paragraphe.</p>');
```

Text in `<blockquote>` and `<q>` are wrapped in quotation marks.

* * *

[MIT License](/LICENSE) | Copyright © 2024 [David Bushell](https://dbushell.com)
