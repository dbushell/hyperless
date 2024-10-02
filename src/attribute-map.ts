import {escape, unescape} from './html-utils.ts';

/**
 * HTML attributes map
 * Keys are case-insensitive keys
 * HTML entities in values are automatically encoded
 */
export class AttributeMap extends Map<string, string> {
  constructor(
    iterable?: Iterable<readonly [string, string]> | null | undefined
  ) {
    super(
      iterable instanceof AttributeMap
        ? Array.from(iterable, ([k, v]) => [k, escape(v)])
        : iterable
    );
  }
  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }
  set(key: string, value: string): this {
    value = escape(unescape(value));
    return super.set(key.toLowerCase(), value);
  }
  get(key: string, decode = true): string | undefined {
    const value = super.get(key.toLowerCase());
    if (value === undefined) return value;
    return decode ? unescape(value) : value;
  }
  has(key: string): boolean {
    return super.has(key.toLowerCase());
  }
  delete(key: string): boolean {
    return super.delete(key.toLowerCase());
  }
  entries(decode = true): IterableIterator<[string, string]> {
    const entries = super.entries();
    return (function* () {
      for (const [k, v] of entries) yield [k, decode ? unescape(v) : v];
    })();
  }
  values(decode = true): IterableIterator<string> {
    const values = super.values();
    return (function* () {
      for (const v of values) yield decode ? unescape(v) : v;
    })();
  }
  forEach(
    callbackfn: (value: string, key: string, map: Map<string, string>) => void,
    thisArg?: unknown
  ): void {
    super.forEach((value, key, map) =>
      callbackfn.call(thisArg, unescape(value), key, map)
    );
  }
  toString(): string {
    const entries = Array.from(super.entries());
    const attr = entries.map(([k, v]) =>
      v === '' ? k : v.indexOf('"') === -1 ? `${k}="${v}"` : `${k}='${v}'`
    );
    return attr.join(' ');
  }
}
