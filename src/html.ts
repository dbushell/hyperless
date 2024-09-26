/**
 * Complete list of inline HTML elements
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element#inline_text_semantics}
 */
export const inlineTags = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr'
]);

/**
 * Complete list of HTML void elements
 * {@link https://developer.mozilla.org/en-US/docs/Glossary/Void_element}
 */
export const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

/**
 * List of HTML elements to avoid parsing inside
 */
export const opaqueTags = new Set([
  'code',
  'iframe',
  'math',
  'noscript',
  'object',
  'pre',
  'script',
  'style',
  'svg',
  'template',
  'textarea'
]);
