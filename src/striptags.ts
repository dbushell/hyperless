import {inlineTags} from './html.ts';
import {comment, fullTag, anyTag} from './regexp.ts';

/** Match any remaining HTML comments or tags */
const otherTags = new RegExp(`${comment.source}|${anyTag.source}`);

/** Bespoke list of elements to remove with their content */
const removeTags = [
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
];

/**
 * Remove HTML and return text content
 */
export const stripTags = (html: string): string => {
  // Find open and close tags
  let match: RegExpMatchArray | null;
  while ((match = html.match(fullTag))) {
    let {0: search, 2: tag, 3: text} = match;
    // Remove entire element
    if (removeTags.includes(tag)) {
      html = html.replace(search, () => '');
      continue;
    }
    // Remove tags and keep content
    const inline = inlineTags.includes(tag);
    // Wrap quotes
    if (['blockquote', 'q'].includes(tag)) {
      text = `“${stripTags(text).trim()}”`;
    }
    html = html.replace(search, () => text + (inline ? '' : ' '));
  }
  // Remove everthing else
  while ((match = html.match(otherTags))) {
    html = html.replace(match[0], () => '');
  }
  return html;
};
