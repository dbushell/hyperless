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

  parseLoop: for (let i = 0; i < attributes.length; i++) {
    const char = attributes[i];
    switch (state) {
      case 'BEFORE_NAME':
        if (char === '/' || char === '>') {
          break parseLoop;
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
      case 'NAME':
        if (char === '/' || char === '>') {
          break parseLoop;
        } else if (ASCII_WHITESPACE.has(char)) {
          state = 'AFTER_NAME';
        } else if (char === '=') {
          state = 'BEFORE_VALUE';
        } else if (INVALID_ATTRIBUTE_NAME.has(char)) {
          throw new Error(`invalid name at ${i}`);
        } else {
          name += char;
        }
        continue;
      case 'AFTER_NAME':
        if (ASCII_WHITESPACE.has(char)) {
          continue;
        } else if (char === '=') {
          state = 'BEFORE_VALUE';
        } else {
          // Found empty attribute
          map.set(name, '');
          // Rewind state to match new name
          i--;
          state = 'BEFORE_NAME';
        }
        continue;
      case 'BEFORE_VALUE':
        if (ASCII_WHITESPACE.has(char)) {
          continue;
        } else if (char === "'") {
          state = 'SINGLE_QUOTED';
        } else if (char === '"') {
          state = 'DOUBLE_QUOTED';
        } else if (INVALID_ATTRIBUTE_VALUE.has(char)) {
          throw new Error(`Invalid unquoted attribute value at character ${i}`);
        } else {
          value += char;
          state = 'UNQUOTED';
        }
        continue;
      case 'DOUBLE_QUOTED':
        if (char === '"') {
          // End of double quoted attribute
          map.set(name, value);
          state = 'BEFORE_NAME';
        } else {
          value += char;
        }
        continue;
      case 'SINGLE_QUOTED':
        if (char === "'") {
          // End of single quoted attribute
          map.set(name, value);
          state = 'BEFORE_NAME';
        } else {
          value += char;
        }
        continue;
      case 'UNQUOTED':
        if (char === '/' || char === '>') {
          break parseLoop;
        } else if (ASCII_WHITESPACE.has(char)) {
          // End of unquoted attribute
          map.set(name, value);
          state = 'BEFORE_NAME';
        } else if (INVALID_ATTRIBUTE_VALUE.has(char)) {
          throw new Error(`Invalid unquoted attribute value at character ${i}`);
        } else {
          value += char;
        }
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
