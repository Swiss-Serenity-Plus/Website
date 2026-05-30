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
    const comments = ((data.results ?? []) as NotionComment[]).map((c) => ({
      id: c.id,
      text: c.rich_text.map((rt) => rt.plain_text ?? rt.text?.content ?? "").join(""),
      createdTime: c.created_time,
    }));

    return NextResponse.json({ comments }, { headers: CORS });
  } catch (err) {
    console.error("[comments] GET error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}
