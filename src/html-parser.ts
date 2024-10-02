import {Node} from './html-node.ts';
import {voidTags, opaqueTags} from './html-tags.ts';
import {anyTag, comment} from './regexp.ts';

/** Regular expression to match HTML comment or tag */
const commentTag = new RegExp(`^${comment.source}|^${anyTag.source}`);

/** HTML parser state */
type ParseState = 'DATA' | 'RAWTEXT';

/** `parseHTML` configuration */
export type ParseOptions = {
  rootTag: string;
  opaqueTags: Set<string>;
  voidTags: Set<string>;
};

export const getParseOptions = (): ParseOptions => ({
  rootTag: 'html',
  opaqueTags: new Set(opaqueTags),
  voidTags: new Set(voidTags)
});

const parseOptions: ParseOptions = getParseOptions();

/**
 * Parse HTML text into a Node tree
 * @param html HTML text to parse
 * @param tag Root tag name
 */
export const parseHTML = (html: string, options = parseOptions): Node => {
  // Create current parent node
  const root = new Node(null, 'ROOT', '', options.rootTag);
  let parent = root;
  let state: ParseState = 'DATA';
  // Start at first potential tag
  let offset = html.indexOf('<');

  while (offset >= 0 && offset < html.length - 2) {
    // Skip to start of potential tag
    if (offset > 0) {
      // Get the text skipped
      const text = html.substring(0, offset);
      // In RAWTEXT state text is concatenated otherwise append a text node
      if (state === 'RAWTEXT') {
        parent.raw += text;
      } else {
        parent.append(new Node(parent, 'TEXT', text));
      }
      // Reset offset and data to parse
      html = html.substring(offset);
      offset = 0;
    }

    // Match next HTML comment or tag
    const tag = html.match(commentTag);
    if (tag === null) {
      offset = html.substring(1).indexOf('<');
      // Add one to account for substring if found
      if (offset >= 0) offset += 1;
      // Next iteration ends if no tag was found
      continue;
    }

    // Matched tag parts
    const tagText = tag[0];
    const tagRaw = tag[1] ?? '';
    const tagName = tagRaw.toLowerCase();

    if (state === 'RAWTEXT') {
      // Switch state if closing tag matches
      if (tagName === parent.tag && tagText.startsWith('</')) {
        if (parent.parent === null) {
          throw new Error();
        }
        parent.raw += `</${parent.tag}>`;
        parent = parent.parent;
        state = 'DATA';
      } else {
        parent.raw += tagText;
      }
    }
    // Append comment
    else if (tagText.startsWith(`<!--`)) {
      parent.append(new Node(parent, 'COMMENT', tagText, tagRaw));
    }
    // Append self-closing and void tags
    else if (options.voidTags.has(tagName) || tagText.endsWith('/>')) {
      parent.append(new Node(parent, 'VOID', tagText, tagRaw));
    }
    // Append closing tag and descend
    else if (tagText.startsWith('</')) {
      if (parent.parent === null) {
        parent.append(new Node(parent, 'STRAY', tagText, tagRaw));
      } else {
        parent = parent.parent;
      }
    }
    // Append opaque tag and change state
    else if (options.opaqueTags.has(tagName)) {
      const node = new Node(parent, 'OPAQUE', tagText, tagRaw);
      parent.append(node);
      parent = node;
      state = 'RAWTEXT';
    }
    // Append opening tag and ascend
    else {
      const node = new Node(parent, 'ELEMENT', tagText, tagRaw);
      parent.append(node);
      parent = node;
    }

    // Skip ahead to next potential tag
    html = html.substring(tagText.length);
    offset = html.indexOf('<');
  }
  // Append leftover text
  if (html.length) {
    parent.append(new Node(parent, 'TEXT', html));
  }
  // Return node tree
  return root;
};
