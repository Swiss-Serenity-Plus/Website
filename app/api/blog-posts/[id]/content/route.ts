// Contenu d'un article -> document TipTap.
//   GET ?id  -> reconstruit le corps (blocs enfants de la page Notion) en JSON
//               TipTap, pour editer un article cree/modifie dans Notion.
// Variables d'env : NOTION_TOKEN
import { NextRequest, NextResponse } from "next/server";
import { notionBlocksToTiptap } from "../../../../lib/notionBlocks";

const CORS = { "Content-Type": "application/json" };
const NOTION = "https://api.notion.com/v1";

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" };
}

async function fetchBlocks(pageId: string, token: string) {
  const out: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  do {
    const url = `${NOTION}/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, { headers: headers(token), cache: "no-store" });
    if (!res.ok) break;
    const data = await res.json();
    out.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
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
    const blocks = await fetchBlocks(id, token);
    const doc = notionBlocksToTiptap(blocks as unknown as Parameters<typeof notionBlocksToTiptap>[0]);
    return NextResponse.json({ doc }, { headers: CORS });
  } catch (err) {
    console.error("[blog-posts/content] error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}
