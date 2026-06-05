// Comments API — GET les commentaires d'une page Notion (ticket).
// Variables d'env : NOTION_TOKEN
import { NextRequest, NextResponse } from "next/server";

const CORS = { "Content-Type": "application/json" };

interface NotionRichText {
  plain_text?: string;
  text?: { content: string };
}
interface NotionComment {
  id: string;
  created_time: string;
  rich_text: NotionRichText[];
  created_by?: { id: string; name?: string };
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
    const res = await fetch(
      `https://api.notion.com/v1/comments?block_id=${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[comments] Notion error:", JSON.stringify(err));
      return NextResponse.json({ error: `Notion ${res.status}` }, { status: 502, headers: CORS });
    }

    const data = await res.json();
    const raw = (data.results ?? []) as NotionComment[];

    // Resout les noms d'auteurs (un fetch par utilisateur unique, en cache local).
    const nameCache = new Map<string, string>();
    const userIds = [...new Set(raw.map((c) => c.created_by?.id).filter(Boolean) as string[])];
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const ures = await fetch(`https://api.notion.com/v1/users/${uid}`, {
            headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" },
            cache: "no-store",
          });
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
