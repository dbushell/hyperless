/**
 * HTML attributes map with case-insensitive keys
 */
export class AttributeMap extends Map<string, string> {
  constructor(
    iterable?: Iterable<readonly [string, string]> | null | undefined
  ) {
    super(iterable);
  }
  set(key: string, value: string): this {
    return super.set(key.toLowerCase(), value);
  }
  get(key: string): string | undefined {
    return super.get(key.toLowerCase());
  }
  has(key: string): boolean {
    return super.has(key.toLowerCase());
  }
  delete(key: string): boolean {
    return super.delete(key.toLowerCase());
  }
  toString(): string {
    const attr = Array.from(this.entries()).map(([k, v]) =>
      v === '' ? k : v.indexOf('"') === -1 ? `${k}="${v}"` : `${k}='${v}'`
    );
    return attr.join(' ');
  }
}
