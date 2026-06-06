import { NextRequest, NextResponse } from "next/server";
import { deleteR2Object } from "../../lib/r2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  const headers = { ...CORS, "Content-Type": "application/json" };

  const accountId   = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken    = process.env.CLOUDFLARE_API_TOKEN;
  const bucketName  = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl   = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!accountId || !apiToken || !bucketName || !publicUrl) {
    console.error("[upload-image] Variables d'environnement manquantes");
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500, headers });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400, headers });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400, headers });
  }

  const originalName = (file as File).name ?? "image";
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = originalName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const key = `blog-covers/${Date.now()}-${safeName}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const r2Res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: arrayBuffer,
    }
  );

  if (!r2Res.ok) {
    const text = await r2Res.text().catch(() => "");
    console.error(`[upload-image] R2 error ${r2Res.status}: ${text}`);
    return NextResponse.json(
      { error: `Échec de l'upload (${r2Res.status})` },
      { status: 502, headers }
    );
  }

  const url = `${publicUrl}/${key}`;
  return NextResponse.json({ url }, { status: 200, headers });
}

// Supprime un fichier image du bucket R2 (a partir de son URL publique).
export async function DELETE(request: NextRequest) {
  const headers = { ...CORS, "Content-Type": "application/json" };
  let url = new URL(request.url).searchParams.get("url") ?? "";
  if (!url) {
    try { url = (await request.json())?.url ?? ""; } catch { /* corps absent */ }
  }
  if (!url) {
    return NextResponse.json({ error: "URL manquante" }, { status: 400, headers });
  }
  const ok = await deleteR2Object(url);
  if (!ok) {
    return NextResponse.json({ error: "Suppression R2 échouée" }, { status: 502, headers });
  }
  return NextResponse.json({ success: true }, { status: 200, headers });
}
