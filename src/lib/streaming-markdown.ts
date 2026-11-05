// The small part of the HTML tree (hast) these plugins touch.
type Text = { type: 'text'; value: string };
type Element = {
  type: 'element';
  tagName: string;
  properties?: { className?: unknown; [key: string]: unknown };
  children: Node[];
};
type Node = Text | Element | { type: string };
type Root = { type: 'root'; children: Node[] };
type ElementContent = Text | Element;

/**
 * Holds back what would render one way now and another way a moment later, so the
 * page never jumps while an answer streams: a half-written table, a half-typed
 * marker on its own line, an unclosed bold or inline code span.
 */
export function prepareStreamingMarkdown(input: string): string {
  let text = input;

  // A last line that is only the start of a block marker: "-", "#", ">", "1.", "|", backticks.
  text = text.replace(/\n[ \t]*(?:[-*+=_]{1,2}|#{1,6}|>|\d+[.)]?|\|)?[ \t]*$/, (m) =>
    m.trim() ? '' : m
  );

  // A table shows only once its delimiter row is complete, then one whole row at a time.
  const lines = text.split('\n');
  let end = lines.length;
  while (end > 0 && !lines[end - 1].trim()) end--;
  let start = end - 1;
  while (start >= 0 && lines[start].trimStart().startsWith('|')) start--;
  start += 1;
  if (start < end) {
    const delimiter = lines[start + 1];
    const complete =
      start + 1 < end &&
      /^\s*\|?[\s:|-]*-[\s:|-]*\|[\s:|-]*$/.test(delimiter);
    if (!complete || end - start < 3) {
      text = lines.slice(0, start).join('\n');
    } else if (!lines[end - 1].trimEnd().endsWith('|')) {
      text = lines.slice(0, end - 1).join('\n');
    }
  }

  // Close what is still open, so it is bold or code from its first word.
  if ((text.match(/\*\*/g)?.length ?? 0) % 2 === 1) text += '**';
  if ((text.match(/`/g)?.length ?? 0) % 2 === 1) text += '`';

  // "[label](" with no closing bracket yet reads as literal text: hold it back.
  return text.replace(/\[[^\]\n]*(?:\]\([^)\n]*)?$/, '');
}

const wordsOf = (value: string): ElementContent[] =>
  value.split(/(\s+)/).flatMap((part): ElementContent[] => {
    if (!part) return [];
    if (/^\s+$/.test(part)) return [{ type: 'text', value: part }];
    return [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['stream-word'] },
        children: [{ type: 'text', value: part }],
      },
    ];
  });

function wrapWords(node: Root | Element) {
  node.children = node.children.flatMap((child): Node[] => {
    if (child.type === 'text') return wordsOf((child as Text).value);
    if (child.type === 'element' && (child as Element).tagName !== 'code') {
      wrapWords(child as Element);
    }
    return [child];
  });
}

/** The deepest last block, where the next word will appear. */
function lastBlock(node: Root | Element): Root | Element {
  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i];
    if (child.type === 'element') {
      const el = child as Element;
      if (String(el.properties?.className ?? '').includes('stream-word')) return node;
      if (el.tagName === 'code' || el.tagName === 'a') return node;
      return lastBlock(el);
    }
    if (child.type === 'text' && (child as Text).value.trim()) return node;
  }
  return node;
}

/**
 * Wraps each word so a new one fades in as it arrives. React keeps the spans it
 * already has, so only new words animate. One still cursor follows the last word.
 */
export function rehypeStreaming() {
  return (tree: Root) => {
    wrapWords(tree);
    lastBlock(tree).children.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['stream-cursor'], ariaHidden: 'true' },
      children: [],
    });
  };
}
