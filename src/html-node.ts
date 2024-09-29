import type {AttributeMap} from './attribute-map.ts';
import {parseAttributes} from './attribute-parser.ts';
import {anyTag} from './regexp.ts';

/** Node.type values */
export type NodeType =
  | 'COMMENT'
  | 'ELEMENT'
  | 'OPAQUE'
  | 'ROOT'
  | 'STRAY'
  | 'TEXT'
  | 'VOID';

/**
 * HTML node
 */
export class Node {
  #attributes: AttributeMap | undefined;
  raw: string;
  tag: string;
  type: NodeType;
  /** Parent node */
  parent: Node | null = null;
  /** First child node */
  head: Node | null = null;
  /** Last child node */
  tail: Node | null = null;
  /** Next adjacent sibling node */
  next: Node | null = null;
  /** Previous adjacent sibling node */
  previous: Node | null = null;

  constructor(
    parent: Node | null = null,
    type: NodeType = 'TEXT',
    raw = '',
    tag = ''
  ) {
    this.parent = parent;
    this.tag = tag;
    this.raw = raw;
    this.type = type;
  }

  /** Map of HTML attributes */
  get attributes(): AttributeMap {
    // Parse on first request for performance
    if (this.#attributes === undefined) {
      const match = this.raw.match(new RegExp(anyTag.source, 's'));
      this.#attributes = parseAttributes(match?.[2] ?? '');
    }
    return this.#attributes;
  }

  /** Opening tag HTML with parsed attributes */
  get tagOpen(): string {
    if (this.tag === '' || ['ELEMENT', 'VOID'].includes(this.type) === false) {
      return '';
    }
    let out = '<' + this.tag;
    const attr = this.attributes.toString();
    if (attr.length) out += ' ' + attr;
    if (this.type === 'VOID') out += '/';
    return out + '>';
  }

  /** Closing tag HTML */
  get tagClose(): string {
    if (this.tag && this.type === 'ELEMENT') {
      return `</${this.tag}>`;
    }
    return '';
  }

  /** Iterate over child nodes */
  *[Symbol.iterator](): Generator<Node, void, unknown> {
    for (let node = this.head; node; node = node.next) {
      yield node;
    }
  }

  /** Remove all child nodes */
  clear(): this {
    while (this.tail) this.tail.remove();
    return this;
  }

  /** Append one or more child nodes */
  append(...nodes: Array<Node>): this {
    for (const node of nodes) {
      node.remove();
      node.parent = this;
      node.previous = this.tail;
      if (this.tail) {
        this.tail.next = node;
        this.tail = node;
      } else {
        this.head = node;
        this.tail = node;
      }
    }
    return this;
  }

  /* Return child node at index */
  at(index: number): Node | null {
    let i = 0;
    for (const node of this) {
      if (i++ === index) return node;
    }
    return null;
  }

  /** Return index of child node, or -1 if not found */
  indexOf(node: Node): number {
    let i = 0;
    for (const child of this) {
      if (node === child) return i;
      i++;
    }
    return -1;
  }

  /** Detatch this node from parent */
  remove() {
    const {next, previous, parent} = this;
    this.next = null;
    this.previous = null;
    this.parent = null;
    if (next) next.previous = previous;
    if (previous) previous.next = next;
    if (parent?.head === this) parent.head = next;
    if (parent?.tail === this) parent.tail = previous;
  }

  /** Replace this node with another */
  replaceWith(node: Node) {
    node.remove();
    if (this.parent) {
      this.parent.insertAfter(node, this);
      this.remove();
    }
  }

  /** Insert child node at index */
  insertAt(node: Node, index: number): boolean {
    if (index < 0) return false;
    node.remove();
    node.parent = this;
    const before = index ? this.at(index - 1) : null;
    const after = this.at(index);
    if (before) {
      before.next = node;
      node.previous = before;
    } else {
      this.head = node;
    }
    if (after) {
      after.previous = node;
      node.next = after;
    } else {
      this.tail = node;
    }
    return true;
  }

  /** Insert child node after target */
  insertAfter(node: Node, target: Node): boolean {
    node.remove();
    const index = this.indexOf(target);
    if (index === -1) return false;
    return this.insertAt(node, index + 1);
  }

  /** Insert child node before target */
  insertBefore(node: Node, target: Node): boolean {
    node.remove();
    const index = this.indexOf(target);
    if (index === -1) return false;
    return this.insertAt(node, index);
  }

  /** Traverse node tree */
  traverse(callback: (node: Node) => unknown): void {
    for (const child of this) {
      if (callback(child) !== false) child.traverse(callback);
    }
  }

  /** Traverse tree until matching node is found */
  find(match: (node: Node) => boolean): Node | null {
    for (const child of this) {
      const found = match(child) ? child : child.find(match);
      if (found) return found;
    }
    return null;
  }

  /** Find closest matching parent node */
  closest(match: (node: Node) => boolean): Node | null {
    let parent = this.parent;
    while (parent) {
      if (parent === null) return null;
      if (match(parent)) return parent;
      parent = parent.parent;
    }
    return null;
  }

  /** Return child node list as array */
  toArray(): Array<Node> {
    return Array.from(this);
  }

  /** Render node to HTML string */
  toString(): string {
    if (this.type === 'COMMENT') return '';
    if (this.type === 'STRAY') return '';
    let out = this.tagOpen || this.raw;
    for (const node of this) {
      out += node.toString();
    }
    out += this.tagClose;
    return out;
  }
}
