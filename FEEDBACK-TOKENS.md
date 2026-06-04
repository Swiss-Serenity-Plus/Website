# Tokenisation des composants — Outil de retours

Référence des « tokens » attribués à chaque bloc annotable du site, afin que les
tickets de l'outil de retours soient **précis et non ambigus** (un encadré
sélectionné ne renvoie plus le titre de sa section).

## Principe

Chaque bloc cliquable porte deux attributs :

| Attribut | Rôle | Exemple |
|----------|------|---------|
| `id="b-…"` | **Identifiant** stable. Repris automatiquement dans la propriété **URL** du ticket Notion (ancre cliquable). | `b-service-structuration-organisation` |
| `data-fb-label` | **Texte** précis, lisible par un humain ou un LLM. | `Carte service « Coordination & Optimisation »` |

`getElementLabel()` (dans `FeedbackWidget.tsx`) remonte le DOM et combine **les
deux libellés les plus proches** : le bloc précis, puis sa section de contexte.

> Exemple de libellé final d'un ticket :
> **`Carte service « Coordination & Optimisation » · Section Services`**

Les sections portent un `data-fb-label` court et sémantique (`Section Services`)
plutôt que leur long titre marketing. Les identifiants sont générés via
`fbSlug()` (`app/lib/fbToken.ts`).

## Vocabulaire des libellés

| Type de bloc | Format `data-fb-label` |
|--------------|------------------------|
| Section | `Section <Nom court>` |
| Carte de service | `Carte service « <titre> »` |
| Encadré / pilier / valeur | `Encadré pilier « <titre> »`, `Encadré valeur « <titre> »` |
| Colonne (valeurs / étapes / résultats) | `Valeur « … »`, `Étape « … »`, `Résultat « … »` |
| Élément de liste | `Livrable « … »`, `Profil cible « … »`, `Modalité « … »` |
| Bouton / CTA | `Bouton « <texte> »` |
| Lien | `Lien de navigation « … »`, `Lien pied de page « … »` |
| Image | `Photo portrait de Mireille Dayer` |

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
