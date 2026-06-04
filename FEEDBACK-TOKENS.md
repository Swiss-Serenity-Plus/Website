# Tokenisation des composants — Outil de retours

Référence des « tokens » attribués à chaque bloc annotable du site, afin que les
tickets de l'outil de retours soient **précis et non ambigus** (un encadré
sélectionné ne renvoie plus le titre de sa section).

## Principe

Chaque ticket identifie l'élément par **QUOI + contenu affiché** :
`Le titre "Un accompagnement sur mesure pour chaque besoin"`.

Le libellé est résolu par `getElementLabel()` (`FeedbackWidget.tsx`) qui remonte
le DOM depuis l'élément cliqué et retient la **première information précise**,
dans cet ordre à chaque niveau :

1. **`data-fb-label` explicite** posé sur un conteneur (encadré, carte, section).
2. **Nature du contenu auto-déduite** depuis la balise / la classe — aucune
   annotation manuelle requise :
   | Élément cliqué | Libellé produit |
   |----------------|-----------------|
   | `<p class="eyebrow">` | `Eyebrow avec le titre "<texte>"` |
   | `<h1>`…`<h6>` | `Le titre "<texte>"` |
   | `<p>` | `La description avec "<texte>"` |
   | `<blockquote>` | `La citation "<texte>"` |
   | `<li>` | `L'élément de liste "<texte>"` |
   | `<img>` | `L'image « <alt> »` |
3. **Lien / bouton** → `Le lien "<texte>"` / `Le bouton "<texte>"`.

L'élément le **plus proche** gagne : cliquer le titre renvoie donc
`Le titre "…"`, **plus jamais** la section qui le contient. Les sections et
encadrés ne servent de libellé que lorsqu'on clique leur zone vide.

### Identifiant stable (`id="b-…"`)

Les conteneurs porteurs d'un `id="b-…"` alimentent la propriété **URL** du ticket
Notion (ancre cliquable vers le bloc). Le contenu texte précis (QUOI + contenu)
suffit par ailleurs à `grep` l'élément dans le code. Slugs générés par `fbSlug()`
(`app/lib/fbToken.ts`).

## Libellés explicites des conteneurs

| Type de bloc | Format `data-fb-label` |
|--------------|------------------------|
| Section | `Section <Nom court>` |
| Carte de service | `Carte service « <titre> »` |
| Encadré / pilier / valeur | `Encadré pilier « <titre> »`, `Encadré valeur « <titre> »` |
| Colonne (valeurs / étapes / résultats) | `Valeur « … »`, `Étape « … »`, `Résultat « … »` |
| Élément de liste curé | `Livrable « … »`, `Profil cible « … »`, `Modalité « … »` |
| Bouton / CTA | `Bouton « <texte> » (<contexte>)` |
| Lien | `Lien de navigation « … »`, `Lien pied de page « … »` |

## Inventaire par composant

| Composant | Section (`data-fb-label`) | Blocs tokenisés (`id` → label) |
|-----------|---------------------------|--------------------------------|
| `Header` | `En-tête / Navigation` | `b-header-logo`, `b-nav-<slug>` (liens), `b-nav-cta-contact` |
| `Hero` | `Section Hero (accueil)` | `b-hero-cta-contact`, `b-hero-cta-services` |
| `ValueProp3Col` | `Section Piliers de valeur` | `b-pilier-<slug>` (3 piliers) |
| `ServiceSection` | `Section Services` | cartes via `ServiceCard` |
| `ServiceCard` | — | `b-service-<slug>` → `Carte service « <titre> »` |
| `AboutTeaser` | `Section À propos (aperçu)` | `b-about-teaser-cta`, `b-about-teaser-portrait` |
| `LocalTrust` | `Section Localisation` | — |
| `ContactCTA` | `Section Appel à l'action (Contact)` | `b-contact-cta-button` |
| `Footer` | `Pied de page` | `b-footer-phone`, `b-footer-email`, `b-footer-social-<rés>`, `b-footer-service-<slug>`, `b-footer-util-<slug>` |
| `PageHero` | `En-tête de page (titre)` | — |
| `Breadcrumb` | `Fil d'ariane` | items → `Fil d'ariane — « <label> »` |
| `TargetAudience` | `Section Clientèle cible` | `b-profil-<n>` → `Profil cible « … »` |
| `DeliverablesList` | `Section Livrables` | `b-livrable-<n>` → `Livrable « … »` |
| `ColumnsBlock` (values) | `Section Valeurs` | `b-valeur-<slug>` → `Valeur « … »` |
| `ColumnsBlock` (numbered) | `Section Méthode (étapes)` | `b-etape-<slug>` → `Étape « … »` |
| `ColumnsBlock` (results) | `Section Résultats` | `b-resultat-<slug>` → `Résultat « … »` |
| `OfferModalities` | `Section Modalités & réassurance` | `Modalité « … »`, `Réassurance « … »` |
| `RelatedServices` | `Section Autres services` | cartes via `ServiceCard` |
| `Quote` | `Section Citation` | — |
| Page `/a-propos` | `Section En-tête À propos` / `Section Parcours` / `Section Notre engagement` | `b-about-portrait`, `b-about-card-professionnels`, `b-about-card-particuliers`, `b-engagement-<slug>` |
| Page `/contact` | `Section Formulaire de contact` | `b-contact-form`, `b-contact-info`, coordonnées (téléphone / e-mail / adresse) |

## Ajouter un nouveau bloc

1. Ajouter `data-fb-label="<libellé précis>"` sur l'élément.
2. Ajouter `id="b-<contexte>-<slug>"` (utiliser `fbSlug()` pour les slugs dynamiques).
3. Mettre la section parente à jour avec un `data-fb-label` court si elle n'en a pas.

Pour un bouton, passer `id` et `fbLabel` au composant `Button`.
