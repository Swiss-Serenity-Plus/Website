// Route de connexion a la console /admin.
// Verifie le mot de passe cote serveur et pose un cookie de session httpOnly.
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, deriveToken, isValidPassword,
} from "../../lib/adminAuth";

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const password = body.password ?? "";

  if (!process.env.ADMIN_PASSWORD) {
    console.error("[admin-login] ADMIN_PASSWORD non configure");
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, deriveToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}

// Deconnexion : supprime le cookie de session.
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
