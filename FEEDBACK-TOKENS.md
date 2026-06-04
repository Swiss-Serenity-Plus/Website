# Tokenisation des composants — Outil de retours

Objectif : chaque ticket identifie l'élément cliqué par **QUOI + OÙ** afin de
donner un prompt précis à Claude Code.

## Comment le libellé est construit

`getElementLabel()` (`FeedbackWidget.tsx`) résout, pour l'élément cliqué :

1. **QUOI — le descripteur le plus proche** (`findDescriptor`), par ordre de priorité :
   | Priorité | Source | Exemple |
   |----------|--------|---------|
   | 0 | `data-fb-label` explicite | `Image avec le logo`, `Bouton « En savoir plus »` |
   | 1 | lien / bouton (texte ou `aria-label`) | `Le lien « Blog »` |
   | 2 | contenu déduit de la balise / classe | `Le titre "…"`, `Eyebrow avec le titre "…"`, `La description avec "…"`, `La citation "…"`, `L'image « … »` |
   | 3 | icône (`<svg>` ou image décorative) | `Icône` |

2. **OÙ — le conteneur le plus proche** (`findContainer`) : premier ancêtre
   portant `data-fb-container` (carte, section, footer…).

3. **Composition** : `QUOI dans <article> OÙ`
   - `Icône dans la Carte service « Coordination & Optimisation »`
   - `Bouton « En savoir plus » dans la Carte service « … »`
   - `Image avec le logo dans le Footer`

   Exception : un **contenu texte autoporteur** (titre, eyebrow, description,
   citation) reste **seul**, car son texte l'identifie déjà :
   - `Le titre "Un accompagnement sur mesure pour chaque besoin"`
   - `Eyebrow avec le titre "Nos services"`

L'article (`la` / `le` / `l'`) est déduit du premier mot du conteneur
(`FB_ARTICLES`).

## Les deux attributs

| Attribut | Posé sur | Rôle |
|----------|----------|------|
| `data-fb-container` | cartes, sections, footer, en-tête, encadrés | le **OÙ** (contexte) |
| `data-fb-label` | feuilles spécifiques (logo, icône d'une carte, CTA, étiquette, liens, items de liste) | un **QUOI** explicite qui prime sur la déduction automatique |
| `id="b-…"` | conteneurs | identifiant stable → propriété **URL** du ticket Notion |

La grande majorité des éléments (titres, paragraphes, eyebrows, images, icônes
génériques) n'ont **aucun attribut** : ils sont décrits automatiquement. On
n'annote explicitement que les cas particuliers (logo, CTA, étiquette…).

## Conteneurs (`data-fb-container`)

| Composant | Libellé |
|-----------|---------|
| Header | `En-tête` |
| Footer | `Footer` |
| Hero | `Section Hero` |
| ValueProp3Col | `Section Piliers de valeur` + chaque pilier `Encadré pilier « … »` |
| ServiceSection | `Section Services` |
| ServiceCard | `Carte service « <titre> »` |
| AboutTeaser | `Section À propos` |
| LocalTrust | `Section Localisation` |
| ContactCTA | `Section Contact` |
| PageHero | `En-tête de page` |
| Breadcrumb | `Fil d'ariane` |
| TargetAudience | `Section Clientèle cible` |
| DeliverablesList | `Section Livrables` |
| ColumnsBlock | `Section Valeurs` / `Section Méthode (étapes)` / `Section Résultats` + chaque colonne `Valeur/Étape/Résultat « … »` |
| OfferModalities | `Section Modalités` |
| RelatedServices | `Section Autres services` |
| Quote | `Section Citation` |
| `/a-propos` | `Section En-tête À propos`, `Encadré À propos « Professionnels/Particuliers »`, `Section Parcours`, `Section Notre engagement`, `Encadré valeur « … »` |
| `/contact` | `Section Formulaire de contact`, `Encadré Informations de contact` |

## Feuilles explicites (`data-fb-label`)

`Image avec le logo` (header + footer), `Icône` + `Bouton « … »` + `Étiquette « … »`
(ServiceCard), `Livrable « … »`, `Profil cible « … »`, `Modalité « … »`,
`Réassurance « … »`, `Lien …`, `Coordonnée — …`, portraits.

## Ajouter un nouveau bloc

- **Conteneur** (carte, section, encadré) → `data-fb-container="<Nom>"` + `id="b-…"`.
  Ajouter l'article du premier mot dans `FB_ARTICLES` si besoin.
- **Feuille particulière** (logo, étiquette…) → `data-fb-label="<QUOI>"`.
- **Contenu standard** (titre, texte, image, icône) → rien : c'est automatique.
- **Bouton** → passer `id` et `fbLabel` au composant `Button`.
