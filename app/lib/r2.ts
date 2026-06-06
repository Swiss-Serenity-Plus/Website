// Utilitaires Cloudflare R2 cote serveur (suppression d'objets).
// Variables d'env : CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN,
//   CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_PUBLIC_URL.

// Extrait la cle d'objet R2 a partir de son URL publique. Renvoie null si l'URL
// n'appartient pas au bucket public configure (on ne supprime alors rien).
export function r2KeyFromUrl(url: string): string | null {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl || !url) return null;
  if (!url.startsWith(`${publicUrl}/`)) return null;
  const key = url.slice(publicUrl.length + 1).split("?")[0];
  return key || null;
}

// Supprime un objet R2 a partir de son URL publique. Best-effort : renvoie false
// (sans lever) si la configuration manque ou si l'URL n'est pas un objet R2.
export async function deleteR2Object(url: string): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const key = r2KeyFromUrl(url);
  if (!accountId || !apiToken || !bucketName || !key) return false;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${apiToken}` } }
    );
    return res.ok;
  } catch (err) {
    console.error("[r2] delete error:", err);
    return false;
  }
}
