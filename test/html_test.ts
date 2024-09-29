import {parseHTML} from '../src/html-parser.ts';
import {assert, assertEquals} from 'jsr:@std/assert';

Deno.test('paragraph', () => {
  const html = '<p>Paragraph</p>';
  const root = parseHTML(html);
  const p = root.at(0)!;
  assertEquals(p.tag, 'p');
  assertEquals(p.toArray().length, 1);
  assertEquals(p.at(0)!.type, 'TEXT');
  assertEquals(p.at(0)!.raw, 'Paragraph');
});

Deno.test('case-insensitive', () => {
  const html = '<ArTiClE>Paragraph</aRtIcLe>';
  const root = parseHTML(html);
  assertEquals(root.at(0)!.tag, 'article');
});

Deno.test('paragraph inline', () => {
  const html = '<p>This is <strong>inline</strong></p>';
  const root = parseHTML(html);
  const p = root.at(0)!;
  const strong = p.at(1)!;
  assertEquals(p.toArray().length, 2);
  assertEquals(p.at(0)!.type, 'TEXT');
  assertEquals(strong.tag, 'strong');
  assertEquals(strong.at(0)!.raw, 'inline');
});

Deno.test('fake out tag', () => {
  const html = '<p>Less than < fake tag</p>';
  const root = parseHTML(html);
  const p = root.at(0)!;
  assertEquals(p.toArray().length, 2);
});

Deno.test('void element', () => {
  const html = '<p>1</p><img><p>2</p>';
  const root = parseHTML(html);
  assertEquals(root.toArray().length, 3);
  assertEquals(root.at(1)!.type, 'VOID');
});

Deno.test('self-closing', () => {
  const html = '<div />';
  const root = parseHTML(html);
  assertEquals(root.toArray().length, 1);
  assertEquals(root.at(0)!.type, 'VOID');
});

Deno.test('stray node', () => {
  const html = '<p>1</p></p><p>2</p>';
  const root = parseHTML(html);
  assertEquals(root.toArray().length, 3);
  assertEquals(root.at(1)!.type, 'STRAY');
});

Deno.test('leftover text', () => {
  const html = '<p>Paragraph</p>Leftover';
  const root = parseHTML(html);
  assertEquals(root.at(1)!.type, 'TEXT');
  assertEquals(root.at(1)!.raw, 'Leftover');
});

Deno.test('comments', () => {
  const html = `
<!--
  COMMENT 1 -->
<div>
  <p><!-- COMMENT 2 --></p>
</div>`;
  const root = parseHTML(html);
  assertEquals(root.at(1)!.type, 'COMMENT');
  assertEquals(root.at(3)!.at(1)!.at(0)!.type, 'COMMENT');
});

Deno.test('opaque state (svg)', () => {
  const svg = `<svg>
  <path />
  <rect />
  <circle />
</svg>`;
  const html = `<p>Before</p>${svg}<p>After</p>`;
  const root = parseHTML(html);
  assertEquals(root.toArray().length, 3);
  assertEquals(root.at(1)!.type, 'OPAQUE');
  assertEquals(root.at(1)!.raw, svg);
});

Deno.test('script fake tag', () => {
  const html = `<script>/* This is a fake </script> tag */</script><p>after</p>`;
  const root = parseHTML(html);
  assertEquals(root.at(1)!.raw, ' tag */');
});

Deno.test('attributes', () => {
  const html =
    '<div data-test="test123"a="\'b\'"c boolean data-2="2" data:3="3" _4=""s1=\'x="1"\'s2="x=\'\u20012\'" data5\u0009data_six=\' 6 \'>test</div>';
  const root = parseHTML(html);
  assertEquals(root.at(0)!.at(0)!.raw, 'test');
  assertEquals(root.at(0)!.attributes.size, 11);
});

Deno.test('render', () => {
  const html = `
<p>Paragraph
  <b>bold</b>
  <!-- comment --></p>
</p>
<small>&copy;</small>
`;
  const render = `
<p>Paragraph
  <b>bold</b>
  </p>

<small>&copy;</small>
`;
  const root = parseHTML(html);
  assertEquals(root.toString(), render);
});

Deno.test('remove', () => {
  const html = '<div><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p></div>';
  const root = parseHTML(html);
  const parent = root.at(0)!;
  const c0 = parent.at(0)!;
  const c1 = parent.at(1)!;
  const c2 = parent.at(2)!;
  const c3 = parent.at(3)!;
  const c4 = parent.at(4)!;
  assertEquals(parent.toArray().length, 5);
  c0.remove();
  assertEquals(parent.toArray().length, 4);
  assert(parent.head === c1);
  assert(parent.tail === c4);
  c3.remove();
  assertEquals(parent.toArray().length, 3);
  assert(parent.head === c1);
  assert(parent.tail === c4);
  c4.remove();
  assert(parent.tail === c2);
  c1.remove();
  assert(parent.head === c2);
  assertEquals(parent.toArray().length, 1);
});

Deno.test('Node.replace', () => {
  const html = '<div><p>1</p><p>2</p><p>3</p></div>';
  const root = parseHTML(html);
  const A = parseHTML('<p>A</p>');
  const B = parseHTML('<p>B</p>');
  const C = parseHTML('<p>C</p>');
  root.at(0)!.at(0)!.replace(A);
  root.at(0)!.at(1)!.replace(B);
  root.at(0)!.at(2)!.replace(C);
  assertEquals(root.toString(), '<div><p>A</p><p>B</p><p>C</p></div>');
  assert(root.at(0)!.head === A);
  assert(root.at(0)!.tail === C);
});

Deno.test('Node.indexOf', () => {
  const html = '<div><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p></div>';
  const root = parseHTML(html);
  const parent = root.at(0)!;
  const c0 = parent.at(0)!;
  const c2 = parent.at(2)!;
  const c4 = parent.at(4)!;
  assertEquals(parent.indexOf(c0), 0);
  assertEquals(parent.indexOf(c2), 2);
  assertEquals(parent.indexOf(c4), 4);
  assertEquals(c0.indexOf(c4), -1);
});

Deno.test('Node.insertAt', () => {
  const root = parseHTML('<div></div>');
  const n1 = parseHTML('<p>1</p>');
  const n2 = parseHTML('<p>2</p>');
  const n3 = parseHTML('<p>3</p>');
  const div = root.at(0)!;
  div.insertAt(n3, 0);
  div.insertAt(n2, 0);
  div.insertAt(n1, 0);
  assertEquals(root.toString(), '<div><p>1</p><p>2</p><p>3</p></div>');
  div.insertAfter(n1, n2);
  assertEquals(root.toString(), '<div><p>2</p><p>1</p><p>3</p></div>');
  div.insertBefore(n3, n2);
  assertEquals(root.toString(), '<div><p>3</p><p>2</p><p>1</p></div>');
  div.insertAt(n1, 0);
  div.insertAt(n3, 2);
  assertEquals(root.toString(), '<div><p>1</p><p>2</p><p>3</p></div>');
});
