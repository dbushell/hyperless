/**
 * Parse HTML Attributes
 * {@link https://html.spec.whatwg.org/#before-attribute-name-state}
 */
import {AttributeMap} from './attribute-map.ts';
import {
  INVALID_ATTRIBUTE_NAME,
  INVALID_ATTRIBUTE_VALUE,
  ASCII_WHITESPACE
} from './constants.ts';

/** Attribute parser state */
type STATE =
  | 'BEFORE_NAME'
  | 'NAME'
  | 'AFTER_NAME'
  | 'BEFORE_VALUE'
  | 'DOUBLE_QUOTED'
  | 'SINGLE_QUOTED'
  | 'UNQUOTED';

/**
 * Return a map of HTML attributes
 * @param attributes HTML tag to parse
 * @returns {Map} Key/value attributes map
 */
export const parseAttributes = (attributes: string): Map<string, string> => {
  const map: AttributeMap = new AttributeMap();

  let state: STATE = 'BEFORE_NAME';
  let name = '';
  let value = '';

  for (let i = 0; i < attributes.length; i++) {
    const char = attributes[i];

    if (state === 'BEFORE_NAME') {
      if (char === '/' || char === '>') {
        break;
      }
      if (ASCII_WHITESPACE.has(char)) {
        continue;
      }
      if (INVALID_ATTRIBUTE_NAME.has(char)) {
        throw new Error(`Invalid attribute name at character ${i}`);
      }
      name = char;
      value = '';
      state = 'NAME';
      continue;
    }

    if (state === 'NAME') {
      if (char === '/' || char === '>') {
        break;
      }
      if (ASCII_WHITESPACE.has(char)) {
        state = 'AFTER_NAME';
        continue;
      }
      if (char === '=') {
        state = 'BEFORE_VALUE';
        continue;
      }
      if (INVALID_ATTRIBUTE_NAME.has(char)) {
        throw new Error(`invalid name at ${i}`);
      }
      name += char;
      continue;
    }

    if (state === 'AFTER_NAME') {
      if (ASCII_WHITESPACE.has(char)) {
        continue;
      }
      if (char === '=') {
        state = 'BEFORE_VALUE';
        continue;
      }
      // Found empty attribute
      map.set(name, '');
      // Rewind state in to match new name
      state = 'BEFORE_NAME';
      i--;
      continue;
    }

    if (state === 'BEFORE_VALUE') {
      if (ASCII_WHITESPACE.has(char)) {
        continue;
      }
      if (char === "'") {
        state = 'SINGLE_QUOTED';
        continue;
      }
      if (char === '"') {
        state = 'DOUBLE_QUOTED';
        continue;
      }
      if (INVALID_ATTRIBUTE_VALUE.has(char)) {
        throw new Error(`Invalid unquoted attribute value at character ${i}`);
      }
      value += char;
      state = 'UNQUOTED';
      continue;
    }

    if (state === 'DOUBLE_QUOTED') {
      if (char === '"') {
        // End of double quoted attribute
        map.set(name, value);
        state = 'BEFORE_NAME';
        continue;
      }
      value += char;
      continue;
    }

    if (state === 'SINGLE_QUOTED') {
      if (char === "'") {
        // End of single quoted attribute
        map.set(name, value);
        state = 'BEFORE_NAME';
        continue;
      }
      value += char;
      continue;
    }

    if (state === 'UNQUOTED') {
      if (ASCII_WHITESPACE.has(char)) {
        // End of unquoted attribute
        map.set(name, value);
        state = 'BEFORE_NAME';
        continue;
      }
      if (INVALID_ATTRIBUTE_VALUE.has(char)) {
        throw new Error(`Invalid unquoted attribute value at character ${i}`);
      }
      value += char;
      continue;
    }
  }

  // Handle end state
  switch (state) {
    case 'NAME':
      map.set(name, '');
      break;
    case 'UNQUOTED':
      map.set(name, value);
      break;
  }
  return map;
};
