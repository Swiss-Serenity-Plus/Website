// Génération d'URL pré-signées pour l'API S3-compatible de Cloudflare R2.
//
// Permet au navigateur d'uploader un fichier DIRECTEMENT vers R2 (PUT), sans
// passer par une fonction Vercel — ce qui contourne la limite dure de 4,5 Mo
// imposée par Vercel sur le corps des requêtes vers les fonctions.
//
// Signature AWS Signature V4 (query-string), implémentée avec le module crypto
// natif de Node pour éviter toute dépendance externe. Le corps n'est pas signé
// (UNSIGNED-PAYLOAD) : le navigateur peut donc envoyer n'importe quel
// Content-Type sans invalider la signature.
import "server-only";
import { createHash, createHmac } from "crypto";

const REGION = "auto"; // R2 ignore la région mais elle doit figurer dans la signature
const SERVICE = "s3";

function sha256hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

// Encodage RFC 3986. Les entrées (clé d'objet, valeurs de query) sont générées
// en ASCII, donc charCodeAt suffit pour les octets à échapper.
function uriEncode(str: string, encodeSlash: boolean): string {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (/[A-Za-z0-9_.~-]/.test(ch)) out += ch;
    else if (ch === "/") out += encodeSlash ? "%2F" : "/";
    else out += "%" + str.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

// Configuration des clés S3 R2. Renvoie null si l'une des variables manque.
export function r2PresignConfig(): R2Config | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

// Construit une clé d'objet sûre et unique à partir du nom de fichier.
export function buildObjectKey(filename: string, prefix = "blog-covers"): string {
  const ext = (filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const base =
    filename
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  return `${prefix}/${Date.now()}-${base}.${ext}`;
}

// URL PUT pré-signée (path-style) vers le bucket R2.
export function presignR2Put(cfg: R2Config, key: string, expiresSeconds = 300): string {
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

  const canonicalUri = "/" + uriEncode(cfg.bucket, false) + "/" + uriEncode(key, false);

  const params: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${cfg.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresSeconds),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQuery = Object.keys(params)
    .sort()
    .map((k) => `${uriEncode(k, true)}=${uriEncode(params[k], true)}`)
    .join("&");

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac("AWS4" + cfg.secretAccessKey, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
