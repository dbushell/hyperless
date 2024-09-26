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

/** Node.render(options) */
export type NodeRenderOptions = {
  includeComment?: boolean;
  includeStray?: boolean;
};

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

  /** Render node to HTML string */
  render(options: NodeRenderOptions = {}): string {
    // Skip comments by default
    if (this.type === 'COMMENT' && options.includeComment !== true) {
      return '';
    }
    // Skip stray tags by default
    if (this.type === 'STRAY' && options.includeStray !== true) {
      return '';
    }
    // Render nested children
    let raw = this.raw;
    for (const node of this.children) {
      raw += node.render();
    }
    // Close element tags
    if (this.type === 'ELEMENT') {
      raw += `</${this.tag}>`;
    }
    return raw;
  }
}
