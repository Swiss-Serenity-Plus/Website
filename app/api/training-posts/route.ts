// API — base de formations (Notion_Training_Database_ID).
//   GET /api/training-posts          → liste des items de formation
//   GET /api/training-posts?id=<id>  → corps HTML d'un item (blocs Notion)
// Protégée par la session admin.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, ADMIN_COOKIE } from "../../lib/adminAuth";

const NOTION = "https://api.notion.com/v1";

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

type RT = { plain_text?: string };

function readRT(arr?: RT[]): string {
  return (arr ?? []).map((t) => t.plain_text ?? "").join("");
}

// Trouve une URL Tella dans les propriétés de la page Notion.
// Cherche d'abord les propriétés de type "url", puis les rich_text contenant tella.tv.
function findTellaUrl(properties: Record<string, { type?: string; url?: string | null; rich_text?: RT[] }>): string {
  for (const prop of Object.values(properties)) {
    if (prop.type === "url" && prop.url) {
      if (prop.url.includes("tella")) return prop.url;
    }
    if (prop.type === "rich_text") {
      const text = readRT(prop.rich_text).trim();
      if (text.includes("tella.tv")) return text;
    }
  }
  return "";
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Convertit les blocs Notion en HTML simple pour affichage dans le pop-up.
// Les listes consécutives sont regroupées en <ul>/<ol>.
function blocksToHtml(blocks: Array<{ type: string; [key: string]: unknown }>): string {
  const parts: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listType) { parts.push(`</${listType}>`); listType = null; }
  }

  for (const block of blocks) {
    const type = block.type as string;
    const content = (block[type] as { rich_text?: RT[]; language?: string }) ?? {};
    const text = readRT(content.rich_text);

    if (type === "bulleted_list_item") {
      if (listType !== "ul") { flushList(); parts.push("<ul>"); listType = "ul"; }
      parts.push(`<li>${escHtml(text)}</li>`);
      continue;
    }
    if (type === "numbered_list_item") {
      if (listType !== "ol") { flushList(); parts.push("<ol>"); listType = "ol"; }
      parts.push(`<li>${escHtml(text)}</li>`);
      continue;
    }
    flushList();

    switch (type) {
      case "heading_1": parts.push(`<h2>${escHtml(text)}</h2>`); break;
      case "heading_2": parts.push(`<h3>${escHtml(text)}</h3>`); break;
      case "heading_3": parts.push(`<h4>${escHtml(text)}</h4>`); break;
      case "paragraph": parts.push(text ? `<p>${escHtml(text)}</p>` : "<br>"); break;
      case "quote": parts.push(`<blockquote>${escHtml(text)}</blockquote>`); break;
      case "code": parts.push(`<pre><code>${escHtml(text)}</code></pre>`); break;
      case "divider": parts.push("<hr>"); break;
      default: if (text) parts.push(`<p>${escHtml(text)}</p>`);
    }
  }
  flushList();
  return parts.join("\n");
}

export async function GET(req: NextRequest) {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notionToken = process.env.NOTION_TOKEN;
  const dbId = process.env.Notion_Training_Database_ID;

  if (!notionToken || !dbId) {
    return NextResponse.json({ error: "NOTION_TOKEN ou Notion_Training_Database_ID manquant" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("id");

  // Corps d'un item (blocs Notion → HTML)
  if (pageId) {
    const res = await fetch(`${NOTION}/blocks/${pageId}/children?page_size=100`, {
      headers: notionHeaders(),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();
    const html = blocksToHtml(data.results ?? []);
    return NextResponse.json({ html });
  }

  // Liste des items de la base
  const res = await fetch(`${NOTION}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();

  const items = (data.results ?? []).map((page: Record<string, unknown>) => {
    const props = page.properties as Record<string, { type?: string; url?: string | null; rich_text?: RT[]; title?: RT[] }>;

    let title = "";
    for (const prop of Object.values(props)) {
      if (prop.type === "title" && prop.title) {
        title = readRT(prop.title);
        break;
      }
    }

    const tellaUrl = findTellaUrl(props);

    return {
      id: page.id as string,
      title,
      tellaUrl,
      createdTime: page.created_time as string,
    };
  });

  return NextResponse.json({ items });
}
