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

const renderTypes = new Set(['ELEMENT', 'VOID']);

/**
 * HTML node
 */
export class Node {
  #attributes: AttributeMap | undefined;
  #children: Array<Node> = [];
  #tag: string;
  raw: string;
  type: NodeType;
  parent: Node | null = null;

  constructor(
    parent: Node | null = null,
    type: NodeType = 'TEXT',
    raw = '',
    tag = ''
  ) {
    parent?.append(this);
    this.type = type;
    this.raw = raw;
    this.#tag = tag;
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

  /** Array of child nodes */
  get children(): Array<Node> {
    return this.#children;
  }

  /** Number of child nodes */
  get size(): number {
    return this.children.length;
  }

  /** First child node */
  get head(): Node | null {
    return this.children[0] ?? null;
  }

  /** Last child node */
  get tail(): Node | null {
    return this.children[this.size - 1] ?? null;
  }

  /** Node index within parent children (or -1 if detached) */
  get index(): number {
    return this.parent?.indexOf(this) ?? -1;
  }

  /** Adjacent node after this within parent children */
  get next(): Node | null {
    return this.parent?.children[this.index + 1] ?? null;
  }

  /** Adjacent node before this within parent children */
  get previous(): Node | null {
    return this.parent?.children[this.index - 1] ?? null;
  }

  /** Tag name normalized to lowercase */
  get tag() {
    return this.#tag.toLowerCase();
  }

  /** Tag name unformatted */
  get tagRaw() {
    return this.#tag;
  }

  /** Formatted opening tag with parsed attributes */
  get tagOpen(): string | undefined {
    if (renderTypes.has(this.type) === false) {
      return undefined;
    }
    let out = '<' + this.tag;
    const attr = this.attributes.toString();
    if (attr.length) out += ' ' + attr;
    if (this.type === 'VOID') out += '/';
    return out + '>';
  }

  /** Formatted closing tag */
  get tagClose(): string | undefined {
    if (this.type === 'ELEMENT') {
      return `</${this.tag}>`;
    }
    return undefined;
  }

  /** Append one or more child nodes */
  append(...nodes: Array<Node>): void {
    for (const node of nodes) {
      node.detach();
      node.parent = this;
      this.children.push(node);
    }
  }

  /** Remove all child nodes */
  clear(): void {
    this.children.map((child) => (child.parent = null));
    this.#children = [];
  }

  /* Return child node at index */
  at(index: number): Node | null {
    return this.children.at(index) ?? null;
  }

  /** Return index of child node (or -1 if not parent) */
  indexOf(node: Node): number {
    return this.children.indexOf(node);
  }

  /** Remove this node from its parent */
  detach(): void {
    this.parent?.children.splice(this.index, 1);
    this.parent = null;
  }

  /** Replace this node with another */
  replaceWith(node: Node): void {
    node.detach();
    if (this.parent === null) return;
    this.parent.children[this.index] = node;
    node.parent = this.parent;
    this.parent = null;
  }

  /** Add child node at index */
  insertAt(node: Node, index: number): void {
    node.detach();
    this.#children.splice(index, 0, node);
    node.parent = this;
  }

  /** Add child node after target */
  insertAfter(node: Node, target: Node): void {
    node.detach();
    if (target.parent !== this) return;
    this.insertAt(node, target.index + 1);
  }

  /** Add child node before target */
  insertBefore(node: Node, target: Node): void {
    node.detach();
    if (target.parent !== this) return;
    this.insertAt(node, target.index);
  }

  /** Traverse node tree */
  traverse(callback: (node: Node) => unknown): void {
    for (const child of this.#children) {
      if (callback(child) !== false) child.traverse(callback);
    }
  }

  /** Traverse tree until matching node is found */
  find(match: (node: Node) => boolean): Node | null {
    for (const child of this.#children) {
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

  /** Render node to HTML string */
  toString(): string {
    if (this.type === 'COMMENT') return '';
    if (this.type === 'STRAY') return '';
    let out = this.tagOpen || this.raw;
    for (const node of this.#children) {
      out += node.toString();
    }
    out += this.tagClose ?? '';
    return out;
  }
}
