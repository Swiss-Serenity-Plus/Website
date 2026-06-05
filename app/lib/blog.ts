// Lecture serveur des articles de blog (Server Components uniquement).
// Source de verite du contenu : les blocs enfants de la page Notion.
// Variables d'env : NOTION_TOKEN, NOTION_BLOG_DATABASE_ID.
// A n'importer que depuis des Server Components / routes (jamais cote client).

const NOTION = "https://api.notion.com/v1";
const DEFAULT_BLOG_DB_ID = "ca0b4df233c54095917cb3ea38bc59a0";
const REVALIDATE = 3600;

function token() { return process.env.NOTION_TOKEN; }
function dbId() { return process.env.NOTION_BLOG_DATABASE_ID ?? DEFAULT_BLOG_DB_ID; }
function headers() {
  return { Authorization: `Bearer ${token()}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
}

interface NotionRT {
  plain_text?: string;
  href?: string | null;
  annotations?: { bold?: boolean; italic?: boolean };
  text?: { content: string; link?: { url: string } | null };
}
interface NotionProps {
  title?: NotionRT[];
  rich_text?: NotionRT[];
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  url?: string | null;
  date?: { start: string } | null;
  number?: number | null;
}
interface NotionPage { id: string; properties: Record<string, NotionProps> }

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
  readingMinutes: number | null;
  metaDescription: string;
}

function readRT(arr?: NotionRT[]): string {
  return arr ? arr.map((r) => r.plain_text ?? r.text?.content ?? "").join("") : "";
}

function mapMeta(p: NotionPage): PostMeta {
  const props = p.properties;
  return {
    id: p.id,
    slug: readRT(props["Slug"]?.rich_text),
    title: readRT(props["Titre"]?.title),
    excerpt: readRT(props["Extrait"]?.rich_text),
    coverUrl: props["Image cover"]?.url ?? "",
    category: props["Catégorie"]?.select?.name ?? "",
    tags: (props["Tags"]?.multi_select ?? []).map((t) => t.name),
    author: readRT(props["Auteur"]?.rich_text),
    publishDate: props["Date de publication"]?.date?.start ?? "",
    readingMinutes: props["Temps de lecture (min)"]?.number ?? null,
    metaDescription: readRT(props["Meta description SEO"]?.rich_text),
  };
}

async function queryDb(filter: object, sorts?: object[]): Promise<NotionPage[]> {
  if (!token()) return [];
  const out: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const reqBody: Record<string, unknown> = { filter, page_size: 100 };
    if (sorts) reqBody.sorts = sorts;
    if (cursor) reqBody.start_cursor = cursor;
    const res = await fetch(`${NOTION}/databases/${dbId()}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(reqBody),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) break;
    const data = await res.json();
    out.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  const pages = await queryDb(
    { property: "Statut", select: { equals: "Publié" } },
    [{ property: "Date de publication", direction: "descending" }]
  );
  return pages.map(mapMeta).filter((p) => p.slug);
}

export async function getPostBySlug(slug: string): Promise<PostMeta | null> {
  const pages = await queryDb({
    and: [
      { property: "Statut", select: { equals: "Publié" } },
      { property: "Slug", rich_text: { equals: slug } },
    ],
  });
  return pages.length ? mapMeta(pages[0]) : null;
}

// ── Rendu HTML semantique des blocs ──────────────────────────────────────────
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRichText(rts?: NotionRT[]): string {
  if (!rts) return "";
  return rts.map((r) => {
    let t = escapeHtml(r.plain_text ?? r.text?.content ?? "").replace(/\n/g, "<br />");
    if (r.annotations?.bold) t = `<strong>${t}</strong>`;
    if (r.annotations?.italic) t = `<em>${t}</em>`;
    const href = r.href ?? r.text?.link?.url ?? null;
    if (href) t = `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${t}</a>`;
    return t;
  }).join("");
}

interface NotionBlock {
  type: string;
  paragraph?: { rich_text: NotionRT[] };
  heading_2?: { rich_text: NotionRT[] };
  heading_3?: { rich_text: NotionRT[] };
  bulleted_list_item?: { rich_text: NotionRT[] };
  numbered_list_item?: { rich_text: NotionRT[] };
  image?: { type: string; external?: { url: string }; file?: { url: string }; caption?: NotionRT[] };
}

async function fetchBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!token()) return [];
  const out: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const url = `${NOTION}/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: REVALIDATE } });
    if (!res.ok) break;
    const data = await res.json();
    out.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
}

// Rend les blocs Notion en HTML semantique (echappe), avec regroupement des
// listes consecutives. Retourne une chaine HTML prete a injecter cote serveur.
export async function getPostBlocks(pageId: string): Promise<string> {
  const blocks = await fetchBlocks(pageId);
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => { if (listType) { html.push(`</${listType}>`); listType = null; } };

  for (const b of blocks) {
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const want = b.type === "bulleted_list_item" ? "ul" : "ol";
      if (listType !== want) { closeList(); html.push(`<${want}>`); listType = want; }
      const rt = b.bulleted_list_item?.rich_text ?? b.numbered_list_item?.rich_text;
      html.push(`<li>${renderRichText(rt)}</li>`);
      continue;
    }
    closeList();
    switch (b.type) {
      case "heading_2": html.push(`<h2>${renderRichText(b.heading_2?.rich_text)}</h2>`); break;
      case "heading_3": html.push(`<h3>${renderRichText(b.heading_3?.rich_text)}</h3>`); break;
      case "paragraph": {
        const inner = renderRichText(b.paragraph?.rich_text);
        html.push(inner ? `<p>${inner}</p>` : "<p></p>");
        break;
      }
      case "image": {
        const url = b.image?.external?.url ?? b.image?.file?.url ?? "";
        if (!url) break;
        const alt = escapeHtml(readRT(b.image?.caption));
        html.push(`<figure><img src="${escapeHtml(url)}" alt="${alt}" loading="lazy" />${alt ? `<figcaption>${alt}</figcaption>` : ""}</figure>`);
        break;
      }
      default: break;
    }
  }
  closeList();
  return html.join("\n");
}
