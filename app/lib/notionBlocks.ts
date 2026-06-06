// Conversion deterministe JSON TipTap <-> blocs Notion, et utilitaires rich_text.
// Jeu de blocs autorise uniquement : paragraphe, heading 2/3, listes a puces et
// numerotees (aplaties au premier niveau), image, marques gras/italique/lien.

const MAX = 2000; // limite Notion par rich_text

// ── Types TipTap minimaux ───────────────────────────────────────────────────
// Types volontairement laches : compatibles avec le JSONContent de TipTap.
export interface TipTapMark { type: string; attrs?: Record<string, unknown> | null }
export interface TipTapNode {
  type?: string;
  text?: string;
  marks?: TipTapMark[] | null;
  attrs?: Record<string, unknown> | null;
  content?: TipTapNode[];
}
export interface TipTapDoc { type?: string; content?: TipTapNode[] }

// ── Rich text ───────────────────────────────────────────────────────────────
interface NotionRichText {
  type: "text";
  text: { content: string; link?: { url: string } | null };
  annotations?: { bold?: boolean; italic?: boolean };
}

function chunk(str: string, size = MAX): string[] {
  if (str.length <= size) return [str];
  const out: string[] = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

// Convertit une liste de noeuds inline TipTap en rich_text Notion.
function inlineToRichText(nodes?: TipTapNode[]): NotionRichText[] {
  if (!nodes || nodes.length === 0) return [];
  const out: NotionRichText[] = [];
  for (const n of nodes) {
    if (n.type === "hardBreak") {
      out.push({ type: "text", text: { content: "\n" } });
      continue;
    }
    if (n.type !== "text" || !n.text) continue;
    const marks = n.marks ?? [];
    const bold = marks.some((m) => m.type === "bold");
    const italic = marks.some((m) => m.type === "italic");
    const linkMark = marks.find((m) => m.type === "link");
    const href = linkMark?.attrs?.href as string | undefined;
    for (const part of chunk(n.text)) {
      out.push({
        type: "text",
        text: { content: part, ...(href ? { link: { url: href } } : {}) },
        annotations: { bold, italic },
      });
    }
  }
  return out.slice(0, 100); // Notion : max 100 rich_text par bloc
}

type NotionBlock = Record<string, unknown>;

function textBlock(type: "paragraph" | "heading_2" | "heading_3", nodes?: TipTapNode[]): NotionBlock {
  return { object: "block", type, [type]: { rich_text: inlineToRichText(nodes) } };
}

function imageBlock(src: string, alt?: string): NotionBlock {
  return {
    object: "block",
    type: "image",
    image: {
      type: "external",
      external: { url: src },
      caption: alt ? [{ type: "text", text: { content: alt.slice(0, MAX) } }] : [],
    },
  };
}

// Aplatit une liste (et ses sous-listes) en blocs list_item de premier niveau.
function flattenList(listNode: TipTapNode, notionType: "bulleted_list_item" | "numbered_list_item"): NotionBlock[] {
  const out: NotionBlock[] = [];
  for (const item of listNode.content ?? []) {
    if (item.type !== "listItem") continue;
    for (const child of item.content ?? []) {
      if (child.type === "paragraph") {
        out.push({ object: "block", type: notionType, [notionType]: { rich_text: inlineToRichText(child.content) } });
      } else if (child.type === "bulletList") {
        out.push(...flattenList(child, "bulleted_list_item"));
      } else if (child.type === "orderedList") {
        out.push(...flattenList(child, "numbered_list_item"));
      }
    }
  }
  return out;
}

// JSON TipTap -> tableau de blocs Notion.
export function tiptapToNotionBlocks(doc: TipTapDoc | null | undefined): NotionBlock[] {
  if (!doc || !Array.isArray(doc.content)) return [];
  const blocks: NotionBlock[] = [];
  for (const node of doc.content) {
    switch (node.type) {
      case "paragraph":
        blocks.push(textBlock("paragraph", node.content));
        break;
      case "heading": {
        const level = (node.attrs?.level as number) ?? 2;
        blocks.push(textBlock(level === 3 ? "heading_3" : "heading_2", node.content));
        break;
      }
      case "bulletList":
        blocks.push(...flattenList(node, "bulleted_list_item"));
        break;
      case "orderedList":
        blocks.push(...flattenList(node, "numbered_list_item"));
        break;
      case "image": {
        const src = node.attrs?.src as string | undefined;
        if (src) blocks.push(imageBlock(src, node.attrs?.alt as string | undefined));
        break;
      }
      default:
        // Tout autre noyau de bloc : converti en paragraphe simple s'il a du contenu.
        if (node.content) blocks.push(textBlock("paragraph", node.content));
    }
  }
  return blocks;
}

// ── Blocs Notion (API) -> JSON TipTap ────────────────────────────────────────
// Reconstruit un document TipTap a partir des blocs enfants d'une page Notion.
// Sert a editer un article cree/modifie directement dans Notion (quand la
// propriete "Contenu JSON" est absente).
interface NotionApiRichText {
  plain_text?: string;
  href?: string | null;
  annotations?: { bold?: boolean; italic?: boolean };
  text?: { content?: string; link?: { url: string } | null };
}
interface NotionApiBlock {
  type: string;
  paragraph?: { rich_text: NotionApiRichText[] };
  heading_2?: { rich_text: NotionApiRichText[] };
  heading_3?: { rich_text: NotionApiRichText[] };
  bulleted_list_item?: { rich_text: NotionApiRichText[] };
  numbered_list_item?: { rich_text: NotionApiRichText[] };
  image?: { external?: { url: string }; file?: { url: string }; caption?: NotionApiRichText[] };
}

function richTextToTiptap(rts?: NotionApiRichText[]): TipTapNode[] {
  if (!rts || rts.length === 0) return [];
  const out: TipTapNode[] = [];
  for (const r of rts) {
    const content = r.plain_text ?? r.text?.content ?? "";
    if (!content) continue;
    const marks: TipTapMark[] = [];
    if (r.annotations?.bold) marks.push({ type: "bold" });
    if (r.annotations?.italic) marks.push({ type: "italic" });
    const href = r.href ?? r.text?.link?.url ?? null;
    if (href) marks.push({ type: "link", attrs: { href } });
    out.push({ type: "text", text: content, ...(marks.length ? { marks } : {}) });
  }
  return out;
}

function plainText(rts?: NotionApiRichText[]): string {
  return (rts ?? []).map((r) => r.plain_text ?? r.text?.content ?? "").join("");
}

export function notionBlocksToTiptap(blocks: NotionApiBlock[]): TipTapDoc {
  const content: TipTapNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const notionKey = b.type;
      const listType = notionKey === "bulleted_list_item" ? "bulletList" : "orderedList";
      const items: TipTapNode[] = [];
      while (i < blocks.length && blocks[i].type === notionKey) {
        const rt = notionKey === "bulleted_list_item"
          ? blocks[i].bulleted_list_item?.rich_text
          : blocks[i].numbered_list_item?.rich_text;
        items.push({ type: "listItem", content: [{ type: "paragraph", content: richTextToTiptap(rt) }] });
        i++;
      }
      content.push({ type: listType, content: items });
      continue;
    }
    switch (b.type) {
      case "paragraph": {
        const c = richTextToTiptap(b.paragraph?.rich_text);
        content.push(c.length ? { type: "paragraph", content: c } : { type: "paragraph" });
        break;
      }
      case "heading_2":
        content.push({ type: "heading", attrs: { level: 2 }, content: richTextToTiptap(b.heading_2?.rich_text) });
        break;
      case "heading_3":
        content.push({ type: "heading", attrs: { level: 3 }, content: richTextToTiptap(b.heading_3?.rich_text) });
        break;
      case "image": {
        const src = b.image?.external?.url ?? b.image?.file?.url ?? "";
        if (src) {
          const alt = plainText(b.image?.caption);
          content.push({ type: "image", attrs: { src, ...(alt ? { alt } : {}) } });
        }
        break;
      }
      default:
        break;
    }
    i++;
  }
  return { type: "doc", content };
}

// ── Stockage du JSON brut dans une propriete rich_text (decoupe en segments) ──
export function jsonToRichTextSegments(jsonStr: string): { text: { content: string } }[] {
  if (!jsonStr) return [];
  return chunk(jsonStr).map((c) => ({ text: { content: c } }));
}

export function richTextSegmentsToString(arr?: { plain_text?: string; text?: { content: string } }[]): string {
  if (!arr) return "";
  return arr.map((r) => r.plain_text ?? r.text?.content ?? "").join("");
}
