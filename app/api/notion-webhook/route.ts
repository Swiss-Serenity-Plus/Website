// Recepteur de webhook Notion.
//   Notion appelle cet endpoint quand une page est creee / modifiee / supprimee.
//   But : invalider le cache ISR des pages blog (`/blog` + `/blog/[slug]`) pour
//   que le site public reflete immediatement les changements faits dans Notion,
//   sans attendre la revalidation horaire.
//
// Flux Notion :
//   1) Verification : a la creation de l'abonnement, Notion envoie un POST
//      `{ "verification_token": "..." }`. On le journalise (a recopier dans le
//      tableau de bord Notion pour confirmer l'endpoint) et on repond 200.
//   2) Evenements : chaque requete porte l'entete `X-Notion-Signature`
//      (HMAC-SHA256 du corps brut avec le verification_token comme cle). On la
//      verifie si `NOTION_WEBHOOK_SECRET` est configure, puis on revalide.
//
// Variables d'env : NOTION_TOKEN (resolution du slug), NOTION_WEBHOOK_SECRET
//   (= verification_token, optionnel mais recommande pour verifier la signature).
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

const NOTION = "https://api.notion.com/v1";

interface NotionRT { plain_text?: string; text?: { content: string } }

// Resout le slug d'une page blog (pour revalider l'article precis).
async function fetchSlug(pageId: string): Promise<string | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${NOTION}/pages/${pageId}`, {
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rt: NotionRT[] | undefined = data?.properties?.Slug?.rich_text;
    const slug = rt ? rt.map((r) => r.plain_text ?? r.text?.content ?? "").join("") : "";
    return slug || null;
  } catch {
    return null;
  }
}

function verifySignature(rawBody: string, header: string, secret: string): boolean {
  const provided = header.replace(/^sha256=/, "");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (provided.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw); } catch { /* corps non-JSON */ }

  // 1) Handshake de verification de l'abonnement.
  if (typeof body.verification_token === "string") {
    console.log(`[notion-webhook] verification_token reçu : ${body.verification_token}`);
    return NextResponse.json({ verification_token: body.verification_token }, { status: 200 });
  }

  // 2) Verification de la signature (si le secret est configure).
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get("x-notion-signature") ?? "";
    if (!sig || !verifySignature(raw, sig, secret)) {
      console.warn("[notion-webhook] signature invalide — requête ignorée");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }
  }

  // 3) Revalidation ISR du blog.
  try {
    revalidatePath("/blog");
    const entity = body.entity as { id?: string } | undefined;
    if (entity?.id) {
      const slug = await fetchSlug(entity.id);
      if (slug) revalidatePath(`/blog/${slug}`);
    }
  } catch (err) {
    console.error("[notion-webhook] erreur de revalidation :", err);
  }

  // Toujours repondre 200 rapidement (sinon Notion retente l'envoi).
  return NextResponse.json({ ok: true }, { status: 200 });
}

// Petit check de disponibilite (Notion / navigateur).
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "notion-webhook" });
}
