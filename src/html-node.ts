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
    if (this.#attributes === undefined) {
      const match = this.raw.match(new RegExp(anyTag.source, 's'));
      this.#attributes = parseAttributes(match?.[2] ?? '');
    }
    return this.#attributes;
  }

  /** Detatch node from parent tree */
  remove() {
    const {next, previous, parent} = this;
    this.parent = null;
    this.next = null;
    this.previous = null;
    if (next) {
      next.previous = previous;
      if (parent?.head === this) {
        parent.head = next;
      }
    }
    if (previous) {
      previous.next = next;
      if (parent?.tail === this) {
        parent.tail = previous;
      }
    }
  }

  /** Remove this node with another */
  replaceWith(node: Node) {
    node.remove();
    const {next, previous, parent} = this;
    this.parent = null;
    this.next = null;
    this.previous = null;
    if (parent === null) {
      return;
    }
    node.parent = parent;
    if (next) {
      node.next = next;
      next.previous = node;
    } else {
      parent.tail = node;
    }
    if (previous) {
      node.previous = previous;
      previous.next = node;
    } else {
      parent.head = node;
    }
  }

  insertAfter(node: Node, after: Node): this {
    node.remove();
    node.parent = this;
    node.previous = after;
    node.next = after.next;
    if (node.next) {
      node.next.previous = node;
    }
    if (node.previous) {
      node.previous.next = node;
    }
    return this;
  }

  /** Append a child node */
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

  /** Traverse tree until matching node is found */
  find(matcher: (node: Node) => boolean): Node | null {
    for (const child of this) {
      const found = matcher(child) ? child : child.find(matcher);
      if (found) return found;
    }
    return null;
  }

  /** Traverse node tree */
  traverse(callback: (node: Node) => unknown): void {
    for (const child of this) {
      if (callback(child) !== false) child.traverse(callback);
    }
  }

  /** Find closest matching parent node */
  closest(matcher: (node: Node) => boolean): Node | null {
    let parent = this.parent;
    while (parent) {
      if (parent === null) return null;
      if (matcher(parent)) return parent;
      parent = parent.parent;
    }
    return parent;
  }

  /* Return child node at specified index */
  at(index: number): Node | null {
    let i = 0;
    for (const node of this) {
      if (i++ === index) return node;
    }
    return null;
  }

  /** Render node to HTML string */
  toString(): string {
    if (this.type === 'COMMENT') return '';
    if (this.type === 'STRAY') return '';
    // Render nested children
    let raw = this.raw;
    for (const node of this) {
      raw += node.toString();
    }
    // Close element tags
    if (this.type === 'ELEMENT' && this.tag) {
      raw += `</${this.tag}>`;
    }
    return raw;
  }

  /** Return child node list as array */
  toArray(): Array<Node> {
    return Array.from(this);
  }

  *[Symbol.iterator](): Generator<Node, void, unknown> {
    let node = this.head;
    while (node) {
      yield node;
      node = node.next;
    }
  }
}
