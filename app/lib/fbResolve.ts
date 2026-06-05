// Logique pure de resolution de libelle pour l'outil de retours.
// Extraite de FeedbackWidget pour etre partagee entre le widget legacy et la
// console /admin. Toutes les fonctions de parcours du DOM sont parametrables par
// un Document cible (celui de l'iframe dans la console, ou document dans le widget)
// afin de fonctionner a travers les realms (l'iframe a ses propres globals, donc
// pas d'instanceof sur les constructeurs du parent).

export const PAGE_MAP: Record<string, string> = {
  "/": "Home",
  "/entreprises/structuration-organisation": "Structuration & Organisation",
  "/entreprises/suivi-optimisation": "Suivi & Optimisation",
  "/entreprises/sourcing-partenaires": "Sourcing & Partenaires",
  "/entreprises/experience-client": "Expérience client",
  "/particuliers/accompagnement-administratif": "Accompagnement administratif",
  "/a-propos": "À propos",
  "/contact": "Contact",
  "/mentions-legales": "Mentions légales",
};

// Liste ordonnee pour les selecteurs de page (libelle + chemin).
export const PAGE_OPTIONS: { value: string; label: string }[] = Object.entries(PAGE_MAP).map(
  ([value, label]) => ({ value, label })
);

export function pageNameForPath(pathname: string): string {
  return PAGE_MAP[pathname] ?? "Home";
}

export const ACTION_OPTIONS = [
  "Modifier du texte",
  "Ajouter du texte",
  "Ajouter une image",
  "Changer une couleur",
  "Modifier la mise en page",
  "Supprimer un élément",
  "Ajouter un lien",
  "Corriger une faute",
  "Autre",
] as const;

export type ActionOption = (typeof ACTION_OPTIONS)[number];

export const PLACEHOLDERS: Record<ActionOption | "default", string> = {
  "Modifier du texte": "Quel texte souhaitez-vous modifier ? Quelle formulation préférez-vous à la place ?",
  "Ajouter du texte": "Quel contenu souhaitez-vous ajouter et à quel emplacement précis sur la page ?",
  "Ajouter une image": "Quelle image souhaitez-vous intégrer ? Avez-vous un fichier ou une référence à proposer ?",
  "Changer une couleur": "Quelle couleur ou quel style souhaitez-vous appliquer ? Une référence visuelle aide beaucoup.",
  "Modifier la mise en page": "Comment souhaitez-vous réorganiser cet élément ? Un croquis ou une description suffit.",
  "Supprimer un élément": "Confirmez-vous la suppression ? Y a-t-il quelque chose à mettre à la place ?",
  "Ajouter un lien": "Vers quelle page ou adresse ce lien doit-il pointer ?",
  "Corriger une faute": "Quelle est la formulation correcte que vous souhaitez voir apparaître ?",
  "Autre": "Décrivez précisément votre retour : contexte, attente, exemple si possible.",
  default: "Décrivez précisément votre retour : contexte, attente, exemple si possible.",
};

const SVG_NS = "http://www.w3.org/2000/svg";

// URL d'ancre de l'element cible. On remonte jusqu'au premier id stable (hors
// ids techniques du widget) pour produire un lien profond vers le bloc.
export function getElementUrl(el: HTMLElement, loc: Location): string {
  const body = el.ownerDocument?.body ?? null;
  let current: HTMLElement | null = el;
  while (current && current !== body) {
    if (current.id && !current.id.startsWith("fb-") && !current.getAttribute("data-feedback-widget")) {
      return `${loc.origin}${loc.pathname}#${current.id}`;
    }
    current = current.parentElement;
  }
  return loc.origin + loc.pathname;
}

// Texte visible et nettoye d'un element (innerText respecte les <br> et le masquage).
export function fbText(el: HTMLElement): string {
  const raw = (el.innerText ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
  return raw.length > 160 ? `${raw.slice(0, 160)}…` : raw;
}

// Article defini selon le premier mot du conteneur, pour une lecture naturelle
// (« … dans la Carte service », « … dans le Footer », « … dans l'En-tête »).
export const FB_ARTICLES: Record<string, string> = {
  carte: "la", section: "la", footer: "le", "en-tête": "l'", encadré: "l'",
  fil: "le", photo: "la", valeur: "la", étape: "l'", résultat: "le",
  citation: "la", formulaire: "le", bandeau: "le", colonne: "la", modalité: "la",
};

export function fbWithArticle(container: string): string {
  const first = container.split(/[\s«]/)[0].toLowerCase();
  const art = FB_ARTICLES[first];
  if (!art) return container;
  return art.endsWith("'") ? `${art}${container}` : `${art} ${container}`;
}

// QUOI : nature d'un contenu autoporteur (titre, eyebrow, description, image…).
// Renvoie un rang de priorite : plus il est bas, plus l'info est specifique.
//   1 = lien/bouton · 2 = contenu texte ou image · 3 = icone (generique).
export function describeContent(el: HTMLElement): { rank: number; label: string; standalone: boolean } | null {
  if (el.namespaceURI === SVG_NS) return { rank: 3, label: "Icône", standalone: false };
  const tag = el.tagName;
  if (tag === "IMG") {
    const alt = (el as HTMLImageElement).alt?.trim();
    return alt
      ? { rank: 2, label: `L'image « ${alt} »`, standalone: false }
      : { rank: 3, label: "Icône", standalone: false };
  }
  const text = fbText(el);
  if (!text) return null;
  if (el.classList?.contains("eyebrow")) return { rank: 2, label: `Eyebrow avec le titre "${text}"`, standalone: true };
  if (/^H[1-6]$/.test(tag)) return { rank: 2, label: `Le titre "${text}"`, standalone: true };
  if (tag === "BLOCKQUOTE") return { rank: 2, label: `La citation "${text}"`, standalone: true };
  if (tag === "P") return { rank: 2, label: `La description avec "${text}"`, standalone: true };
  if (tag === "ADDRESS") return { rank: 2, label: `L'adresse "${text}"`, standalone: true };
  if (tag === "LI") return { rank: 2, label: `L'élément de liste "${text}"`, standalone: false };
  return null;
}

// Cherche le meilleur QUOI sans franchir le conteneur. On retient la priorite
// la plus forte ; a priorite egale, l'element le plus proche gagne. Ainsi une
// icone dans un lien renvoie le lien, mais une icone dans une carte reste « Icone ».
export function findDescriptor(el: HTMLElement, root: Document): { label: string; standalone: boolean } | null {
  const body = root.body;
  let current: HTMLElement | null = el;
  let depth = 0;
  let bestRank = Number.POSITIVE_INFINITY;
  let bestLabel: string | null = null;
  let bestStandalone = false;
  const consider = (rank: number, label: string, standalone: boolean) => {
    if (label && rank < bestRank) {
      bestRank = rank;
      bestLabel = label;
      bestStandalone = standalone;
    }
  };
  while (current && current !== body && depth < 6) {
    const explicit = current.getAttribute("data-fb-label");
    if (explicit) consider(0, explicit, false);
    if (current.tagName === "BUTTON" || current.tagName === "A") {
      const text = fbText(current);
      const aria = current.getAttribute("aria-label") ?? "";
      const t = text && text.length < 80 ? text : aria.length < 80 ? aria : "";
      if (t) consider(1, current.tagName === "BUTTON" ? `Le bouton "${t}"` : `Le lien "${t}"`, false);
    }
    const content = describeContent(current);
    if (content) consider(content.rank, content.label, content.standalone);
    if (current.hasAttribute("data-fb-container")) break; // on ne depasse pas le conteneur
    current = current.parentElement;
    depth++;
  }
  return bestLabel === null ? null : { label: bestLabel, standalone: bestStandalone };
}

// OU : conteneur le plus proche (carte, section, footer…).
export function findContainer(el: HTMLElement, root: Document): string | null {
  const body = root.body;
  let current: HTMLElement | null = el;
  while (current && current !== body) {
    const container = current.getAttribute("data-fb-container");
    if (container) return container;
    current = current.parentElement;
  }
  return null;
}

export function getElementLabel(el: HTMLElement, root: Document): string {
  // Identite complete = QUOI (element precis) + OU (conteneur englobant) :
  //   « Icone dans la Carte service « … » », « Bouton dans la Carte service « … » »,
  //   « Image avec le logo dans le Footer », « Le titre « … » dans la Section Services ».
  const descriptor = findDescriptor(el, root);
  const container = findContainer(el, root);
  if (descriptor) {
    if (!descriptor.standalone && container && descriptor.label !== container) {
      return `${descriptor.label} dans ${fbWithArticle(container)}`;
    }
    return descriptor.label;
  }
  if (container) return container;
  // Repli : section englobante.
  const block = el.closest("section, article, header, footer, nav, main, aside, form");
  if (block) {
    const ariaLabel = block.getAttribute("aria-label");
    if (ariaLabel && ariaLabel.length < 60) return ariaLabel;
    const heading = block.querySelector("h1, h2, h3, h4");
    if (heading) return `Le titre "${fbText(heading as HTMLElement)}"`;
    const tagLabels: Record<string, string> = {
      HEADER: "En-tête", FOOTER: "Footer",
      NAV: "Navigation", MAIN: "Contenu principal",
      FORM: "Formulaire", ASIDE: "Barre latérale",
    };
    return tagLabels[block.tagName] || "Section";
  }
  return fbText(el) || el.tagName.toLowerCase();
}
