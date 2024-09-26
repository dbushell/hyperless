import {Node} from './html-node.ts';
import {voidTags, opaqueTags} from './html.ts';
import {anyTag, comment} from './regexp.ts';

/** Regular expression to match HTML comment or tag */
const commentTag = new RegExp(`^${comment.source}|^${anyTag.source}`);

/** HTML parser state */
type ParseState = 'DATA' | 'RAWTEXT';

/**
 * Parse HTML text into a Node tree
 * @param html HTML text to parse
 * @param tag Root tag name
 */
export const parseHTML = (html: string, tag = 'html'): Node => {
  // Create current parent node
  const root = new Node(null, 'ROOT', '', tag);
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
    const tagName = tag[1]?.toLowerCase() ?? '';

    if (state === 'RAWTEXT') {
      // Switch state if closing tag matches
      if (tagName === parent.tag && tagText.startsWith('</')) {
        parent.raw += `</${parent.tag}>`;
        parent = parent.parent;
        state = 'DATA';
      } else {
        parent.raw += tagText;
      }
    }
    // Append comment
    else if (tagText.startsWith(`<!--`)) {
      parent.append(new Node(parent, 'COMMENT', tagText, tagName));
    }
    // Append self-closing and void tags
    else if (voidTags.has(tagName) || tagText.endsWith('/>')) {
      parent.append(new Node(parent, 'VOID', tagText, tagName));
    }
    // Append closing tag and descend
    else if (tagText.startsWith('</')) {
      if (parent === parent.parent) {
        parent.append(new Node(parent, 'STRAY', tagText, tagName));
      } else {
        // parent.append(new Node(parent, 'CLOSE', tagText, tagName));
        parent = parent.parent;
      }
    }
    // Append opaque tag and change state
    else if (opaqueTags.has(tagName)) {
      const node = new Node(parent, 'OPAQUE', tagText, tagName);
      parent.append(node);
      parent = node;
      state = 'RAWTEXT';
    }
    // Append opening tag and ascend
    else {
      const node = new Node(parent, 'ELEMENT', tagText, tagName);
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
