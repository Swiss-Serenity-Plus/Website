// Blog posts API — base "Articles de blog" Notion.
//   GET    -> liste les articles
//   POST   -> cree un article
//   PATCH  -> met a jour un article (?id=)
// Variables d'env : NOTION_TOKEN, NOTION_BLOG_DATABASE_ID
// (DB ID par defaut : ca0b4df233c54095917cb3ea38bc59a0 — fallback dev)
import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const DEFAULT_BLOG_DB_ID = "ca0b4df233c54095917cb3ea38bc59a0";

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
  body?: string;
  status?: "Brouillon" | "À relire" | "Publié" | "Archivé";
}

const NOTION_RICH_TEXT_MAX = 2000;
const PROPERTY_PREVIEW_LIMIT = 1900;
const TRUNCATION_MARKER = "… [Contenu complet dans le corps de la page ↓]";

function rt(content: string) {
  if (!content) return [];
  if (content.length <= NOTION_RICH_TEXT_MAX) return [{ text: { content } }];
  return [{ text: { content: content.slice(0, PROPERTY_PREVIEW_LIMIT) + TRUNCATION_MARKER } }];
}

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
  if (body.body !== undefined) properties["Corps"] = { rich_text: rt(body.body) };
  return properties;
}

interface NotionRT { plain_text?: string; text?: { content: string } }
function readRT(arr?: NotionRT[]): string {
  if (!arr) return "";
  return arr.map((r) => r.plain_text ?? r.text?.content ?? "").join("");
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
    body: readRT(props["Corps"]?.rich_text),
    status: props["Statut"]?.select?.name ?? "Brouillon",
  };
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const headers = { ...CORS, "Content-Type": "application/json" };
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_BLOG_DATABASE_ID ?? DEFAULT_BLOG_DB_ID;
  if (!token) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });
  }
  try {
    const all: NotionBlogPage[] = [];
    let cursor: string | undefined;
    do {
      const reqBody: Record<string, unknown> = {
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
        page_size: 100,
      };
      if (cursor) reqBody.start_cursor = cursor;
      const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: notionHeaders(token),
        body: JSON.stringify(reqBody),
        cache: "no-store",
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
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400, headers });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400, headers });
  }

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_BLOG_DATABASE_ID ?? DEFAULT_BLOG_DB_ID;
  if (!token) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });
  }

  // Body Notion : paragraphes natifs (double saut), chacun decoupe en blocs <= 2000 char.
  const children: object[] = [];
  if (body.body) {
    const paragraphs = body.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    for (const p of paragraphs) {
      for (let i = 0; i < p.length; i += NOTION_RICH_TEXT_MAX) {
        children.push({
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: p.slice(i, i + NOTION_RICH_TEXT_MAX) } }] },
        });
      }
    }
  }

  try {
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify({ parent: { database_id: dbId }, properties: buildProperties(body), children }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[blog-posts] POST error:", JSON.stringify(err));
      return NextResponse.json({ error: `Notion a retourné ${res.status}`, details: err }, { status: 502, headers });
    }
    const data = await res.json();
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
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400, headers });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400, headers });
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: notionHeaders(token),
      body: JSON.stringify({ properties: buildProperties(body) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[blog-posts] PATCH error:", JSON.stringify(err));
      return NextResponse.json({ error: `Notion a retourné ${res.status}`, details: err }, { status: 502, headers });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id, url: data.url }, { headers });
  } catch (err) {
    console.error("[blog-posts] PATCH network error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500, headers });
  }
}
