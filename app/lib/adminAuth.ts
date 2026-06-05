// Authentification de la console /admin.
// Un mot de passe unique (ADMIN_PASSWORD) protege la console sur tous les
// deploiements (production et previews Vercel, dont les URLs sont publiques).
// Le cookie de session stocke un jeton derive du mot de passe (jamais le mot de
// passe lui-meme), recalculable cote serveur pour verification.
import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

// Jeton deterministe derive du mot de passe. Le serveur le recalcule a chaque
// requete pour comparer au cookie, sans jamais exposer ADMIN_PASSWORD au client.
export function deriveToken(password: string): string {
  return createHash("sha256").update(`swiss-serenity-admin::${password}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// Le mot de passe soumis correspond-il a ADMIN_PASSWORD ?
export function isValidPassword(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(submitted, expected);
}

// Le cookie de session est-il valide (jeton derive du mot de passe courant) ?
export function isValidSession(token: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !token) return false;
  return safeEqual(token, deriveToken(expected));
}
