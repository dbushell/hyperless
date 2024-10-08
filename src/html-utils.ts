const entities = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#39;']
]);

const encodes = new Map(Array.from(entities, ([k, v]) => [v, k]));

const entityKeys = new RegExp(`${[...entities.keys()].join('|')}`, 'g');

const encodedKeys = new RegExp(`${[...encodes.keys()].join('|')}`, 'g');

/** Escape HTML entities */
export const escape = (str: string): string =>
  str.replaceAll(entityKeys, (k) => entities.get(k)!);

/** Unescape HTML entities */
export const unescape = (str: string): string =>
  str.replaceAll(encodedKeys, (k) => encodes.get(k)!);

/** Escape single character */
export const escapeChar = (str: string, char = "'"): string =>
  str.replace(/\\/g, '\\\\').replaceAll(char, '\\' + char);

/** Unescape single character */
export const unescapeChar = (str: string, char = "'"): string =>
  str.replace(/\\\\/g, '\\').replaceAll('\\' + char, char);
