import {parseHTML} from '../src/html-parser.ts';
import {assertEquals} from 'jsr:@std/assert';

Deno.test('paragraph', () => {
  const html = '<p>Paragraph</p>';
  const root = parseHTML(html);
  const p = root.children[0];
  assertEquals(p.tag, 'p');
  assertEquals(p.children.length, 1);
  assertEquals(p.children[0].type, 'TEXT');
  assertEquals(p.children[0].raw, 'Paragraph');
});

Deno.test('case-insensitive', () => {
  const html = '<ArTiClE>Paragraph</aRtIcLe>';
  const root = parseHTML(html);
  assertEquals(root.children[0].tag, 'article');
});

Deno.test('paragraph inline', () => {
  const html = '<p>This is <strong>inline</strong></p>';
  const root = parseHTML(html);
  const p = root.children[0];
  const strong = p.children[1];
  assertEquals(p.children.length, 2);
  assertEquals(p.children[0].type, 'TEXT');
  assertEquals(strong.tag, 'strong');
  assertEquals(strong.children[0].raw, 'inline');
});

Deno.test('fake out tag', () => {
  const html = '<p>Less than < fake tag</p>';
  const root = parseHTML(html);
  const p = root.children[0];
  assertEquals(p.children.length, 2);
});

Deno.test('void element', () => {
  const html = '<p>1</p><img><p>2</p>';
  const root = parseHTML(html);
  assertEquals(root.children.length, 3);
  assertEquals(root.children[1].type, 'VOID');
});

Deno.test('stray node', () => {
  const html = '<p>1</p></p><p>2</p>';
  const root = parseHTML(html);
  assertEquals(root.children.length, 3);
  assertEquals(root.children[1].type, 'STRAY');
});

Deno.test('leftover text', () => {
  const html = '<p>Paragraph</p>Leftover';
  const root = parseHTML(html);
  assertEquals(root.children[1].type, 'TEXT');
  assertEquals(root.children[1].raw, 'Leftover');
});

Deno.test('comments', () => {
  const html = `
<!--
  COMMENT 1 -->
<div>
  <p><!-- COMMENT 2 --></p>
</div>`;
  const root = parseHTML(html);
  assertEquals(root.children[1].type, 'COMMENT');
  assertEquals(root.children[3].children[1].children[0].type, 'COMMENT');
});

Deno.test('opaque state (svg)', () => {
  const svg = `<svg>
  <path />
  <rect />
  <circle />
</svg>`;
  const html = `<p>Before</p>${svg}<p>After</p>`;
  const root = parseHTML(html);
  assertEquals(root.children.length, 3);
  assertEquals(root.children[1].type, 'OPAQUE');
  assertEquals(root.children[1].raw, svg);
});

Deno.test('script fake tag', () => {
  const html = `<script>/* This is a fake </script> tag */</script><p>after</p>`;
  const root = parseHTML(html);
  assertEquals(root.children[1].raw, ' tag */');
});

Deno.test('attributes', () => {
  const html =
    '<div data-test="test123"a="\'b\'"c boolean data-2="2" data:3="3" _4=""s1=\'x="1"\'s2="x=\'\u20012\'" data5\u0009data_six=\' 6 \'>test</div>';
  const root = parseHTML(html);
  assertEquals(root.children[0].children[0].raw, 'test');
  assertEquals(root.children[0].attributes.size, 11);
});
