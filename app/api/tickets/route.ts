// Tickets API — GET liste tous les items d'une database Notion (pagination complète), DELETE archive une page.
// Variables d'env : NOTION_TOKEN, NOTION_DATABASE_ID
import { NextRequest, NextResponse } from "next/server";

const CORS = { "Content-Type": "application/json" };

interface NotionRichText {
  plain_text?: string;
  text?: { content: string };
}
interface NotionSelect {
  name: string;
  color?: string;
}
interface NotionFileEntry {
  type: string;
  external?: { url: string };
}
interface NotionPage {
  id: string;
  archived: boolean;
  properties: {
    "Ticket"?: { title: NotionRichText[] };
    "Ticket ID"?: { unique_id: { prefix: string | null; number: number | null } | null };
    "Élément ciblé"?: { rich_text: NotionRichText[] };
    "Action"?: { select: NotionSelect | null };
    "Page concernée"?: { select: NotionSelect | null };
    "Retour"?: { rich_text: NotionRichText[] };
    "Statut"?: { select: NotionSelect | null };
    "Date soumission"?: { date: { start: string } | null };
    "Format"?: { select: NotionSelect | null };
    "URL"?: { url: string | null };
    "Files & media"?: { files: NotionFileEntry[] };
  };
}

// Concatene TOUS les segments rich_text (Notion decoupe le texte aux mentions,
// liens, et toutes les 2000 car.). `plain_text` couvre aussi les mentions.
function str(arr?: NotionRichText[]): string {
  return arr ? arr.map((r) => r.plain_text ?? r.text?.content ?? "").join("") : "";
}

// Decoupe un texte en segments rich_text Notion (<= 2000 car. chacun), sans troncature.
function chunkRichText(text: string): { text: { content: string } }[] {
  if (!text) return [];
  const out: { text: { content: string } }[] = [];
  for (let i = 0; i < text.length; i += 2000) out.push({ text: { content: text.slice(i, i + 2000) } });
  return out;
}

export async function GET() {
  const token  = process.env.NOTION_TOKEN;
  const dbId   = process.env.NOTION_DATABASE_ID;

  if (!token || !dbId) {
    return NextResponse.json(
      { error: "Configuration serveur manquante (NOTION_TOKEN ou NOTION_DATABASE_ID)" },
      { status: 500, headers: CORS }
    );
  }

  try {
    const allPages: NotionPage[] = [];
    let nextCursor: string | undefined;

    do {
      const body: Record<string, unknown> = {
        sorts: [{ timestamp: "created_time", direction: "descending" }],
        page_size: 100,
      };
      if (nextCursor) body.start_cursor = nextCursor;

      const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[tickets] Notion query error:", JSON.stringify(err));
        return NextResponse.json(
          { error: `Notion a retourné ${res.status} — vérifiez NOTION_TOKEN, NOTION_DATABASE_ID et la permission "Lire le contenu" de l'intégration.` },
          { status: 502, headers: CORS }
        );
      }

      const data = await res.json();
      allPages.push(...(data.results ?? []));
      nextCursor = data.has_more ? data.next_cursor : undefined;
    } while (nextCursor);

    const tickets = allPages
      .filter((p) => !p.archived)
      .filter((p) =>
        str(p.properties["Élément ciblé"]?.rich_text) !== "" ||
        str(p.properties["Retour"]?.rich_text) !== ""
      )
      .map((p) => {
        const uid = p.properties["Ticket ID"]?.unique_id;
        const ticketId = uid && uid.number != null
          ? `${uid.prefix ? uid.prefix + "-" : ""}${uid.number}`
          : "";
        return {
          notionId:    p.id,
          ticketId,                                          // N° auto-increment (ex. MIR-380)
          title:       str(p.properties["Ticket"]?.title),   // titre Notion (resume)
          element:     str(p.properties["Élément ciblé"]?.rich_text),
          action:      p.properties["Action"]?.select?.name ?? "",
          page:        p.properties["Page concernée"]?.select?.name ?? "",
          text:        str(p.properties["Retour"]?.rich_text),
          status:      p.properties["Statut"]?.select?.name ?? "À traiter",
          statusColor: p.properties["Statut"]?.select?.color ?? "gray",
          timestamp:   p.properties["Date soumission"]?.date?.start ?? "",
          format:      p.properties["Format"]?.select?.name ?? "",
          url:         p.properties["URL"]?.url ?? "",
          imageUrl:    p.properties["Files & media"]?.files?.find((f) => f.type === "external")?.external?.url ?? "",
        };
      });

    return NextResponse.json({ tickets }, { headers: CORS });
  } catch (err) {
    console.error("[tickets] GET error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("id");
  if (!pageId) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400, headers: CORS });
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500, headers: CORS });
  }

  let body: { status?: string; action?: string; text?: string; imageUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400, headers: CORS });
  }

  const properties: Record<string, unknown> = {};
  if (body.status) properties["Statut"] = { select: { name: body.status } };
  if (body.action !== undefined) {
    properties["Action"] = body.action ? { select: { name: body.action } } : { select: null };
  }
  if (body.text !== undefined) {
    // Notion limite chaque rich_text a 2000 car. : on decoupe en segments sans tronquer.
    properties["Retour"] = { rich_text: chunkRichText(body.text) };
  }
  // Image jointe : on reecrit completement la propriete (remplacement) ou on la
  // vide (suppression). Notion remplace l'ancienne valeur par la nouvelle.
  if (body.imageUrl !== undefined) {
    const url = (body.imageUrl ?? "").trim();
    properties["Files & media"] = url
      ? { files: [{ type: "external", name: url.split("/").pop() || "image", external: { url } }] }
      : { files: [] };
  }

  if (Object.keys(properties).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400, headers: CORS });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[tickets] PATCH error:", JSON.stringify(err));
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 502, headers: CORS });
    }
    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    console.error("[tickets] PATCH error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("id");

  if (!pageId) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400, headers: CORS });
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500, headers: CORS });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archived: true }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[tickets] DELETE error:", err);
      return NextResponse.json({ error: "Suppression échouée" }, { status: 502, headers: CORS });
    }

    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    console.error("[tickets] DELETE error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500, headers: CORS });
  }
}
