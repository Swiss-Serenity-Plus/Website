import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Garde-fou d'indexation : seul le domaine de production canonique
// (swiss-serenity-plus.ch et son sous-domaine www) est indexable par les
// moteurs. Tout autre hote (staging preview.swiss-serenity-plus.com, les
// deploiements *.vercel.app et tout domaine residuel present ou futur) recoit
// l'en-tete X-Robots-Tag noindex, nofollow afin d'eviter le contenu duplique.
// Le contenu reste servi normalement (pas de redirection).

const PRODUCTION_HOSTS = new Set([
  "swiss-serenity-plus.ch",
  "www.swiss-serenity-plus.ch",
]);

export function middleware(request: NextRequest) {
  const rawHost = request.headers.get("host") ?? "";
  const host = rawHost.split(":")[0].toLowerCase();

  if (PRODUCTION_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
