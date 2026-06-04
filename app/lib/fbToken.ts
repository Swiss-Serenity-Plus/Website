// Tokenisation des blocs pour l'outil de retours.
// Chaque bloc annotable porte deux attributs :
//   • id="b-…"        → identifiant stable (repris dans l'URL du ticket Notion)
//   • data-fb-label   → libellé précis et lisible par un humain / LLM
// fbSlug() normalise un titre en identifiant kebab-case stable.
export function fbSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
