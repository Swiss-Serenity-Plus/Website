// Rendu HTML d'un document TipTap pour l'apercu de l'editeur (client).
// Memes noeuds autorises que la conversion Notion : paragraphe, h2/h3, listes,
// image, gras/italique/lien. Le texte est echappe.
import type { TipTapDoc, TipTapNode } from "./notionBlocks";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function inline(nodes?: TipTapNode[]): string {
  if (!nodes) return "";
  return nodes.map((n) => {
    if (n.type === "hardBreak") return "<br />";
    if (n.type !== "text" || !n.text) return "";
    let t = esc(n.text);
    const marks = n.marks ?? [];
    if (marks.some((m) => m.type === "bold")) t = `<strong>${t}</strong>`;
    if (marks.some((m) => m.type === "italic")) t = `<em>${t}</em>`;
    const href = marks.find((m) => m.type === "link")?.attrs?.href as string | undefined;
    if (href) t = `<a href="${esc(href)}" rel="noopener noreferrer">${t}</a>`;
    return t;
  }).join("");
}

function listItems(listNode: TipTapNode): string {
  const out: string[] = [];
  for (const item of listNode.content ?? []) {
    if (item.type !== "listItem") continue;
    for (const child of item.content ?? []) {
      if (child.type === "paragraph") out.push(`<li>${inline(child.content)}</li>`);
      else if (child.type === "bulletList" || child.type === "orderedList") out.push(listItems(child));
    }
  }
  return out.join("");
}

export function tiptapDocToHtml(doc?: TipTapDoc | null): string {
  if (!doc || !Array.isArray(doc.content)) return "";
  const html: string[] = [];
  for (const node of doc.content) {
    switch (node.type) {
      case "paragraph": {
        const inner = inline(node.content);
        html.push(inner ? `<p>${inner}</p>` : "<p></p>");
        break;
      }
      case "heading": {
        const level = (node.attrs?.level as number) === 3 ? 3 : 2;
        html.push(`<h${level}>${inline(node.content)}</h${level}>`);
        break;
      }
      case "bulletList": html.push(`<ul>${listItems(node)}</ul>`); break;
      case "orderedList": html.push(`<ol>${listItems(node)}</ol>`); break;
      case "image": {
        const src = node.attrs?.src as string | undefined;
        if (src) {
          const alt = esc((node.attrs?.alt as string) ?? "");
          html.push(`<figure><img src="${esc(src)}" alt="${alt}" />${alt ? `<figcaption>${alt}</figcaption>` : ""}</figure>`);
        }
        break;
      }
      default: if (node.content) html.push(`<p>${inline(node.content)}</p>`);
    }
  }
  return html.join("");
}
