// API — découverte dynamique des pages Next.js de l'application.
// Scanne le répertoire app/ pour trouver tous les fichiers page.tsx et
// retourne un arbre de navigation (FileNode | FolderNode) utilisable
// directement par PageTreeNav. Protégée par la session admin.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, ADMIN_COOKIE } from "../../../lib/adminAuth";
import fs from "fs/promises";
import path from "path";

// Segments exclus du scan (jamais des pages publiques)
const EXCLUDE = new Set([
  "api", "admin", "_components", "_lib", "components",
  "data", "lib", "fonts", "hooks",
]);

// Labels connus pour les paths existants (évite la dérivation imparfaite)
const PATH_LABELS: Record<string, string> = {
  "/": "Accueil",
  "/a-propos": "À propos",
  "/mentions-legales": "Mentions légales",
  "/blog": "Blog",
  "/contact": "Contact",
  "/modalites": "Modalités",
  "/entreprises/experience-client": "Expérience client",
  "/entreprises/sourcing-partenaires": "Sourcing & Partenaires",
  "/entreprises/structuration-organisation": "Structuration & Organisation",
  "/entreprises/suivi-optimisation": "Suivi & Optimisation",
  "/particuliers/accompagnement-administratif": "Accompagnement administratif",
};

// Labels connus pour les segments de dossier
const SEGMENT_LABELS: Record<string, string> = {
  entreprises: "Entreprises",
  particuliers: "Particuliers",
};

// Ordre d'affichage des segments top-level
const SORT_ORDER = [
  "/", "entreprises", "particuliers", "blog",
  "modalites", "a-propos", "contact", "mentions-legales",
];

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function labelForPath(route: string): string {
  if (PATH_LABELS[route]) return PATH_LABELS[route];
  const last = route.split("/").pop() ?? route;
  return slugToTitle(last);
}

function labelForSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ?? slugToTitle(segment);
}

async function walkPages(dir: string, routePrefix: string, depth: number): Promise<string[]> {
  if (depth > 2) return [];
  const routes: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return routes;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    if (entry.name.startsWith("(") || entry.name.startsWith("[")) continue;
    if (EXCLUDE.has(entry.name)) continue;
    const route = `${routePrefix}/${entry.name}`;
    const segPath = path.join(dir, entry.name);
    try {
      await fs.access(path.join(segPath, "page.tsx"));
      routes.push(route);
    } catch { /* pas de page.tsx */ }
    const children = await walkPages(segPath, route, depth + 1);
    routes.push(...children);
  }
  return routes;
}

type FileNode = { type: "file"; label: string; href: string };
type FolderNode = { type: "folder"; label: string; children: FileNode[] };
type RouteNode = FileNode | FolderNode;

function buildTree(routes: string[]): RouteNode[] {
  const tree: RouteNode[] = [];

  if (routes.includes("/")) {
    tree.push({ type: "file", label: "Accueil", href: "/" });
  }

  // Regroupe les routes imbriquées par segment parent
  const nested = routes.filter((r) => r.slice(1).includes("/"));
  const groups = new Map<string, string[]>();
  for (const route of nested) {
    const segment = route.split("/")[1];
    if (!groups.has(segment)) groups.set(segment, []);
    groups.get(segment)!.push(route);
  }

  // Routes plates (profondeur 1, hors racine)
  const flat = routes.filter((r) => r !== "/" && !r.slice(1).includes("/"));

  // Tri des segments selon SORT_ORDER puis ordre alphabétique
  const allSegments = [
    ...Array.from(groups.keys()),
    ...flat.map((r) => r.slice(1)),
  ];
  const sorted = [...new Set(allSegments)].sort((a, b) => {
    const ia = SORT_ORDER.indexOf(a);
    const ib = SORT_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "fr");
  });

  for (const segment of sorted) {
    if (groups.has(segment)) {
      tree.push({
        type: "folder",
        label: labelForSegment(segment),
        children: groups.get(segment)!.map((route) => ({
          type: "file",
          label: labelForPath(route),
          href: route,
        })),
      });
    } else {
      tree.push({ type: "file", label: labelForPath(`/${segment}`), href: `/${segment}` });
    }
  }

  return tree;
}

export async function GET() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appDir = path.join(process.cwd(), "app");
  const routes: string[] = [];

  try {
    await fs.access(path.join(appDir, "page.tsx"));
    routes.push("/");
  } catch { /* pas de page racine */ }

  const children = await walkPages(appDir, "", 0);
  routes.push(...children);

  return NextResponse.json({ tree: buildTree(routes) });
}
