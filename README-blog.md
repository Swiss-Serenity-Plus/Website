# Pipeline blog SEO — TipTap, blocs Notion, rendu public, ISR

Ce document décrit le pipeline de contenu des articles de blog, conçu pour être
déterministe et propre pour le référencement.

## Vue d'ensemble

```
Éditeur TipTap (JSON)  ->  blocs enfants Notion  ->  lecture serveur  ->  HTML sémantique (SSG + ISR)
```

- **Éditeur** : `app/admin/_components/ArticleEditor.tsx` (TipTap). Jeu de nœuds
  restreint : paragraphe, titres H2/H3, listes à puces et numérotées, gras,
  italique, lien, image. Produit du JSON TipTap (jamais du HTML).
- **Stockage** : le corps est écrit en **blocs enfants** de la page Notion (jamais
  tronqué dans une propriété). Le JSON TipTap brut est conservé dans la propriété
  `Contenu JSON` (découpée en segments de 2000 caractères) pour une réédition
  fidèle.
- **Conversion** : `app/lib/notionBlocks.ts` (`tiptapToNotionBlocks`).
- **Lecture serveur** : `app/lib/blog.ts` (`getPublishedPosts`, `getPostBySlug`,
  `getPostBlocks`). Le HTML est généré côté serveur et échappé.
- **Pages publiques** : `app/blog/page.tsx` (liste) et `app/blog/[slug]/page.tsx`
  (article). Aucun fetch client pour le contenu : Google reçoit du HTML complet.
- **ISR** : `export const revalidate = 3600` sur les pages blog, plus
  `revalidatePath("/blog")` et `revalidatePath("/blog/<slug>")` à la publication.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NOTION_TOKEN` | Accès à l'API Notion |
| `NOTION_BLOG_DATABASE_ID` | Base « Articles de blog » (défaut : `ca0b4df233c54095917cb3ea38bc59a0`) |
| `CLOUDFLARE_ACCOUNT_ID` | Upload images R2 |
| `CLOUDFLARE_API_TOKEN` | Upload images R2 |
| `CLOUDFLARE_R2_BUCKET_NAME` | Upload images R2 |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL publique des images R2 |

## Base Notion « Articles de blog »

La propriété **`Contenu JSON`** (type Rich Text) a été ajoutée à la base : elle
stocke le JSON TipTap brut de chaque article pour permettre une réédition sans
perte. Si vous recréez la base, ajoutez cette propriété.

Les statuts existants sont conservés : `Brouillon`, `À relire`, `Publié`,
`Archivé`. **Seuls les articles `Publié` apparaissent sur le site public.**

## Comportement attendu

- Un article créé via l'éditeur est stocké **intégralement** en blocs enfants
  (aucune troncature, même au-delà de 2000 caractères).
- La réédition recharge fidèlement le contenu (JSON TipTap restitué).
- Publier un article le fait apparaître sur `/blog` et `/blog/<slug>` sans
  redéploiement (revalidation à la demande), avec un filet de 1 heure.
- Un slug inexistant sur `/blog/<slug>` renvoie une 404.

## Notes techniques

- Les listes imbriquées sont **aplaties** au premier niveau (jeu de blocs simple).
- À l'édition (`PATCH`), les blocs enfants sont remplacés (suppression puis
  recréation). En cas d'échec réseau en cours d'opération, relancer
  l'enregistrement.
- Les images du corps et la couverture sont rendues en `<img loading="lazy">`
  avec `alt` (SEO + accessibilité). Si vous passez à `next/image`, ajoutez le
  domaine public R2 dans `next.config.ts` (`images.remotePatterns`).
