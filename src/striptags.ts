import {inlineTags} from './html.ts';
import {comment, fullTag, anyTag} from './regexp.ts';

/** Match any remaining HTML comments or tags */
const otherTags = new RegExp(`${comment.source}|${anyTag.source}`);

/** Bespoke list of elements to remove with their content */
const removeTags = new Set([
  'audio',
  'canvas',
  'figure',
  'form',
  'iframe',
  'picture',
  'pre',
  'script',
  'style',
  'table',
  'video'
]);

/**
 * Remove HTML and return text content with a few niceties.
 *
 * Text in `<blockquote>` and `<q>` are wrapped in quotation marks.
 *
 * @param html  Original HTML content
 * @param depth Recursive count (for internal use)
 * @returns Text with HTML removed
 */
export const stripTags = (html: string, depth = 0): string => {
  // Find open and close tags
  let match: RegExpMatchArray | null;
  while ((match = html.match(fullTag))) {
    let {0: search, 2: tag, 3: text} = match;
    // Remove entire element
    if (removeTags.has(tag)) {
      html = html.replace(search, () => '');
      continue;
    }
    // Wrap quote in alternating typographic style
    if (['blockquote', 'q'].includes(tag)) {
      const quotes = depth % 2 ? '‘’' : '“”';
      const innerText = stripTags(text, depth + 1).trim();
      text = quotes[0] + innerText + quotes[1];
    }
    // Remove tags and keep content
    const inline = inlineTags.has(tag);
    html = html.replace(search, () => text + (inline ? '' : ' '));
  }
  // Remove everthing else
  while ((match = html.match(otherTags))) {
    html = html.replace(match[0], () => '');
  }
  return html;
};
