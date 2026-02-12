/**
 * rehype plugin: CommonMark 파서가 놓친 **...**를 <strong>으로 변환
 *
 * 원인: 닫는 ** 바로 앞이 구두점("), ))이고 뒤에 한글이 오면
 * right-flanking delimiter 조건을 못 충족해 볼드 파싱이 실패함.
 * 이 플러그인이 텍스트 노드에 남아있는 리터럴 **...**를 후처리.
 */

interface TextNode {
  type: "text";
  value: string;
}

interface ElementNode {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: (TextNode | ElementNode)[];
}

interface ParentNode {
  children: (TextNode | ElementNode)[];
}

function splitEmphasis(node: TextNode): (TextNode | ElementNode)[] | null {
  const pattern = /\*\*(.+?)\*\*/g;
  if (!pattern.test(node.value)) return null;

  pattern.lastIndex = 0;
  const result: (TextNode | ElementNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(node.value)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", value: node.value.slice(lastIndex, match.index) });
    }
    result.push({
      type: "element",
      tagName: "strong",
      properties: {},
      children: [{ type: "text", value: match[1] }],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < node.value.length) {
    result.push({ type: "text", value: node.value.slice(lastIndex) });
  }

  return result;
}

function walk(node: ParentNode) {
  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i];
    if (child.type === "element") {
      walk(child);
    } else if (child.type === "text") {
      const fixed = splitEmphasis(child);
      if (fixed) {
        node.children.splice(i, 1, ...fixed);
      }
    }
  }
}

export function rehypeFixEmphasis() {
  return (tree: ParentNode) => {
    walk(tree);
  };
}
