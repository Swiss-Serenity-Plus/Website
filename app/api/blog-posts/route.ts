// Blog posts API — base "Articles de blog" Notion.
//   GET    -> liste les articles (avec le JSON TipTap pour reedition)
//   POST   -> cree un article (corps en blocs enfants)
//   PATCH  -> met a jour un article (?id=) : remplace proprietes + blocs enfants
// Le corps est stocke en BLOCS ENFANTS de la page (jamais tronque dans une
// propriete). Le JSON TipTap brut est conserve dans la propriete "Contenu JSON".
// Variables d'env : NOTION_TOKEN, NOTION_BLOG_DATABASE_ID
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  tiptapToNotionBlocks, jsonToRichTextSegments, richTextSegmentsToString, type TipTapDoc,
} from "../../lib/notionBlocks";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const DEFAULT_BLOG_DB_ID = "ca0b4df233c54095917cb3ea38bc59a0";
const NOTION = "https://api.notion.com/v1";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

interface BlogPostPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  coverUrl?: string;
  author?: string;
  publishDate?: string;
  readingMinutes?: number;
  metaDescription?: string;
  bodyJson?: TipTapDoc | null;
  status?: "Brouillon" | "À relire" | "Publié" | "Archivé";
}

const MAX = 2000;
function rt(content: string) {
  if (!content) return [];
  return content.length <= MAX ? [{ text: { content } }] : [{ text: { content: content.slice(0, MAX) } }];
}

function notionHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
}

// Proprietes de page (sans le corps, qui passe par les blocs enfants).
function buildProperties(body: BlogPostPayload) {
  const properties: Record<string, unknown> = {
    Titre: { title: rt(body.title.trim()) },
    Statut: { select: { name: body.status ?? "Brouillon" } },
  };
  if (body.slug !== undefined) properties["Slug"] = { rich_text: rt(body.slug) };
  if (body.excerpt !== undefined) properties["Extrait"] = { rich_text: rt(body.excerpt) };
  if (body.category) properties["Catégorie"] = { select: { name: body.category } };
  if (body.tags) properties["Tags"] = { multi_select: body.tags.map((t) => ({ name: t })) };
  if (body.coverUrl !== undefined) properties["Image cover"] = { url: body.coverUrl || null };
  if (body.author !== undefined) properties["Auteur"] = { rich_text: rt(body.author) };
  if (body.publishDate) properties["Date de publication"] = { date: { start: body.publishDate } };
  if (typeof body.readingMinutes === "number") properties["Temps de lecture (min)"] = { number: body.readingMinutes };
  if (body.metaDescription !== undefined) properties["Meta description SEO"] = { rich_text: rt(body.metaDescription) };
  if (body.bodyJson !== undefined) {
    properties["Contenu JSON"] = { rich_text: jsonToRichTextSegments(JSON.stringify(body.bodyJson ?? {})) };
  }
  return properties;
}

// ── Blocs enfants ───────────────────────────────────────────────────────────
async function appendChildren(pageId: string, blocks: object[], token: string) {
  for (let i = 0; i < blocks.length; i += 100) {
    const res = await fetch(`${NOTION}/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: notionHeaders(token),
      body: JSON.stringify({ children: blocks.slice(i, i + 100) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`append blocks: ${JSON.stringify(err)}`);
    }
  }
}

async function clearChildren(pageId: string, token: string) {
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const url = `${NOTION}/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, { headers: notionHeaders(token), cache: "no-store" });
    if (!res.ok) break;
    const data = await res.json();
    for (const b of data.results ?? []) if (b?.id) ids.push(b.id);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  // Suppression sequentielle (delete = archive le bloc).
  for (const bid of ids) {
    await fetch(`${NOTION}/blocks/${bid}`, { method: "DELETE", headers: notionHeaders(token) });
  }
}

// ── Lecture / mapping ────────────────────────────────────────────────────────
interface NotionRT { plain_text?: string; text?: { content: string } }
function readRT(arr?: NotionRT[]): string {
  return arr ? arr.map((r) => r.plain_text ?? r.text?.content ?? "").join("") : "";
}

interface NotionBlogPage {
  id: string;
  url?: string;
  last_edited_time?: string;
  properties: Record<string, {
    title?: NotionRT[];
    rich_text?: NotionRT[];
    select?: { name: string } | null;
    multi_select?: { name: string }[];
    url?: string | null;
    date?: { start: string } | null;
    number?: number | null;
  }>;
}

function mapPost(p: NotionBlogPage) {
  const props = p.properties;
  let bodyJson: unknown = null;
  const rawJson = richTextSegmentsToString(props["Contenu JSON"]?.rich_text);
  if (rawJson) { try { bodyJson = JSON.parse(rawJson); } catch { bodyJson = null; } }
  return {
    id: p.id,
    url: p.url ?? "",
    lastEdited: p.last_edited_time ?? "",
    title: readRT(props["Titre"]?.title),
    slug: readRT(props["Slug"]?.rich_text),
    excerpt: readRT(props["Extrait"]?.rich_text),
    category: props["Catégorie"]?.select?.name ?? "",
    tags: (props["Tags"]?.multi_select ?? []).map((t) => t.name),
    coverUrl: props["Image cover"]?.url ?? "",
    author: readRT(props["Auteur"]?.rich_text),
    publishDate: props["Date de publication"]?.date?.start ?? "",
    readingMinutes: props["Temps de lecture (min)"]?.number ?? null,
    metaDescription: readRT(props["Meta description SEO"]?.rich_text),
    bodyJson,
    status: props["Statut"]?.select?.name ?? "Brouillon",
  };
}

// Revalidation on-demand (best-effort) lors d'une publication.
function revalidateIfPublished(status: string | undefined, slug?: string) {
  if (status !== "Publié") return;
  try {
    revalidatePath("/blog");
    if (slug) revalidatePath(`/blog/${slug}`);
  } catch (err) {
    console.error("[blog-posts] revalidate échouée:", err);
  }
}

export async function GET() {
  const headers = { ...CORS, "Content-Type": "application/json" };
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_BLOG_DATABASE_ID ?? DEFAULT_BLOG_DB_ID;
  if (!token) return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });
  try {
    const all: NotionBlogPage[] = [];
    let cursor: string | undefined;
    do {
      const reqBody: Record<string, unknown> = {
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
        page_size: 100,
      };
      if (cursor) reqBody.start_cursor = cursor;
      const res = await fetch(`${NOTION}/databases/${dbId}/query`, {
        method: "POST", headers: notionHeaders(token), body: JSON.stringify(reqBody), cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[blog-posts] GET error:", JSON.stringify(err));
        return NextResponse.json({ error: `Notion a retourné ${res.status}` }, { status: 502, headers });
      }
      const data = await res.json();
      all.push(...(data.results ?? []));
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);
    return NextResponse.json({ posts: all.map(mapPost) }, { headers });
  } catch (err) {
    console.error("[blog-posts] GET network error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  const headers = { ...CORS, "Content-Type": "application/json" };
  let body: BlogPostPayload;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400, headers }); }
  if (!body.title?.trim()) return NextResponse.json({ error: "Le titre est requis" }, { status: 400, headers });

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_BLOG_DATABASE_ID ?? DEFAULT_BLOG_DB_ID;
  if (!token) return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });

  const blocks = tiptapToNotionBlocks(body.bodyJson);
  try {
    // Cree la page (avec un premier lot de blocs <= 100), puis ajoute le reste.
    const res = await fetch(`${NOTION}/pages`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify({ parent: { database_id: dbId }, properties: buildProperties(body), children: blocks.slice(0, 100) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[blog-posts] POST error:", JSON.stringify(err));
      return NextResponse.json({ error: `Notion a retourné ${res.status}`, details: err }, { status: 502, headers });
    }
    const data = await res.json();
    if (blocks.length > 100) await appendChildren(data.id, blocks.slice(100), token);
    revalidateIfPublished(body.status, body.slug);
    return NextResponse.json({ success: true, id: data.id, url: data.url }, { headers });
  } catch (err) {
    console.error("[blog-posts] POST network error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500, headers });
  }
}

export async function PATCH(request: NextRequest) {
  const headers = { ...CORS, "Content-Type": "application/json" };
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400, headers });

  let body: BlogPostPayload;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400, headers }); }
  if (!body.title?.trim()) return NextResponse.json({ error: "Le titre est requis" }, { status: 400, headers });

  const token = process.env.NOTION_TOKEN;
  if (!token) return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });

  try {
    // 1) Met a jour les proprietes.
    const res = await fetch(`${NOTION}/pages/${id}`, {
      method: "PATCH", headers: notionHeaders(token), body: JSON.stringify({ properties: buildProperties(body) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[blog-posts] PATCH error:", JSON.stringify(err));
      return NextResponse.json({ error: `Notion a retourné ${res.status}`, details: err }, { status: 502, headers });
    }
    // 2) Remplace les blocs enfants (corps), seulement si un corps est fourni.
    if (body.bodyJson !== undefined) {
      await clearChildren(id, token);
      const blocks = tiptapToNotionBlocks(body.bodyJson);
      if (blocks.length > 0) await appendChildren(id, blocks, token);
    }
    revalidateIfPublished(body.status, body.slug);
    return NextResponse.json({ success: true, id }, { headers });
  } catch (err) {
    console.error("[blog-posts] PATCH network error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500, headers });
  }
}
