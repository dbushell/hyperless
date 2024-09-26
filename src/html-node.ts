import type {AttributeMap} from './attribute-map.ts';
import {parseAttributes} from './attribute-parser.ts';
import {anyTag} from './regexp.ts';

/** HTML node type */
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
  #parent: Node | null = null;
  #attributes: AttributeMap | undefined;
  children: Array<Node> = [];
  raw: string;
  tag: string;
  type: NodeType;

  constructor(
    parent: Node | null = null,
    type: NodeType = 'TEXT',
    text = '',
    tag = ''
  ) {
    this.#parent = parent;
    this.tag = tag;
    this.raw = text;
    this.type = type;
  }

  /** Parent node (or itself) */
  get parent(): Node {
    return this.#parent ?? this;
  }

  /** Map of HTML attributes */
  get attributes(): AttributeMap {
    if (this.#attributes === undefined) {
      const match = this.raw.match(new RegExp(anyTag.source, 's'));
      this.#attributes = parseAttributes(match?.[2] ?? '');
    }
    return this.#attributes;
  }

  /** Append a child node */
  append(node: Node): this {
    this.children.push(node);
    return this;
  }
}
