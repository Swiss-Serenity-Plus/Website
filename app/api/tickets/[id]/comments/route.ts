// Comments API — GET les commentaires d'une page Notion (ticket).
// L'API Notion ne renvoie que les commentaires (non resolus) du bloc interroge.
// On interroge donc la page ET chacun de ses blocs enfants, puis on fusionne.
// Variables d'env : NOTION_TOKEN
import { NextRequest, NextResponse } from "next/server";

const CORS = { "Content-Type": "application/json" };
const NOTION = "https://api.notion.com/v1";

interface NotionRichText { plain_text?: string; text?: { content: string } }
interface NotionComment {
  id: string;
  created_time: string;
  rich_text: NotionRichText[];
  created_by?: { id: string; name?: string };
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" };
}

// Tous les commentaires d'un bloc (pagine).
async function fetchCommentsFor(blockId: string, token: string): Promise<NotionComment[]> {
  const out: NotionComment[] = [];
  let cursor: string | undefined;
  do {
    const url = `${NOTION}/comments?block_id=${encodeURIComponent(blockId)}&page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, { headers: headers(token), cache: "no-store" });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[comments] Notion comments API error", res.status, JSON.stringify(errBody));
      break;
    }
    const data = await res.json();
    out.push(...((data.results ?? []) as NotionComment[]));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
}

// Ids des blocs enfants de la page (un niveau, pagine).
async function fetchChildBlockIds(pageId: string, token: string): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const url = `${NOTION}/blocks/${encodeURIComponent(pageId)}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, { headers: headers(token), cache: "no-store" });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[comments] Notion blocks API error", res.status, JSON.stringify(errBody));
      break;
    }
    const data = await res.json();
    for (const b of data.results ?? []) if (b?.id) ids.push(b.id);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return ids;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500, headers: CORS });
  }
  let body: { text?: string };
  try { body = await req.json(); } catch { body = {}; }
  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Texte requis" }, { status: 400, headers: CORS });
  }
  try {
    const res = await fetch(`${NOTION}/comments`, {
      method: "POST",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        parent: { page_id: id },
        rich_text: [{ type: "text", text: { content: text } }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message ?? "Erreur Notion" }, { status: res.status, headers: CORS });
    }
    return NextResponse.json({ id: data.id }, { status: 201, headers: CORS });
  } catch (err) {
    console.error("[comments] POST error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500, headers: CORS });
  }

  try {
    // Page + blocs enfants en parallele.
    const childIds = await fetchChildBlockIds(id, token);
    const lists = await Promise.all([id, ...childIds].map((bid) => fetchCommentsFor(bid, token)));

    // Fusion + dedup par id.
    const byId = new Map<string, NotionComment>();
    for (const list of lists) for (const c of list) byId.set(c.id, c);
    const raw = [...byId.values()].sort(
      (a, b) => new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
    );

    // Resolution des noms d'auteurs (un fetch par utilisateur unique).
    const nameCache = new Map<string, string>();
    const userIds = [...new Set(raw.map((c) => c.created_by?.id).filter(Boolean) as string[])];
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const ures = await fetch(`${NOTION}/users/${uid}`, { headers: headers(token), cache: "no-store" });
          if (ures.ok) {
            const u = await ures.json();
            if (u?.name) nameCache.set(uid, u.name);
          }
        } catch { /* nom indisponible : on ignore */ }
      })
    );

    const comments = raw.map((c) => ({
      id: c.id,
      text: c.rich_text.map((rt) => rt.plain_text ?? rt.text?.content ?? "").join(""),
      createdTime: c.created_time,
      author: (c.created_by?.id && nameCache.get(c.created_by.id)) || c.created_by?.name || "Équipe",
    }));

    return NextResponse.json({ comments }, { headers: CORS });
  } catch (err) {
    console.error("[comments] GET error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}
