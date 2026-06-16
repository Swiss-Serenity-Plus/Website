// API — base de formations (Notion_Training_Database_ID).
//   GET /api/training-posts          → liste des items
//   GET /api/training-posts?id=&title= → corps HTML d'un item
//
// La logique de lecture et de conversion des blocs Notion vit dans
// app/lib/training.ts (mutualisée avec les routes dédiées /formation/[id]).
// Protégée par session admin.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, ADMIN_COOKIE } from "../../lib/adminAuth";
import { trainingDatabaseId, getTrainingItems, getTrainingBodyHtml } from "../../lib/training";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const sessionToken = store.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!trainingDatabaseId()) {
    return NextResponse.json(
      { error: "NOTION_TOKEN ou Notion_Training_Database_ID manquant" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("id");
  const pageTitle = searchParams.get("title") ?? "";

  // ── Corps d'un item ──────────────────────────────────────────────────────
  if (pageId) {
    const html = await getTrainingBodyHtml(pageId, pageTitle);
    return NextResponse.json({ html });
  }

  // ── Liste des items de la base ───────────────────────────────────────────
  const items = await getTrainingItems();
  return NextResponse.json({ items });
}
