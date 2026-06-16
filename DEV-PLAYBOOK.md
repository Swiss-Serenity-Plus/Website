# DEV-PLAYBOOK : Swiss Serenity Plus (référence technique)

> Ce fichier n'est PAS chargé automatiquement. Il est destiné aux sessions techniques de Théo. Pour les sessions d'accompagnement de Mireille, la seule référence est `CLAUDE.md`, qui ne charge pas ce fichier. Ouvre celui-ci explicitement quand tu en as besoin.
>
> Workflow de mise en ligne canonique (vaut partout) : branche de production `home`, jamais de push direct, toute modification via Pull Request avec aperçu Vercel validé avant fusion. Les entrées ci-dessous qui mentionnent `claude/setup-swiss-serenity-plus-Fm7s6` ou un push direct en production datent de la phase de construction : conservées comme historique, elles ne reflètent plus le workflow courant.
>
> Règle d'écriture du projet : pas de tiret cadratin. Vouvoiement sur le site, tutoiement en conversation avec Mireille.

---

## Next.js 16 (avertissement)

Cette version de Next.js a des changements de rupture par rapport aux données d'entraînement habituelles : APIs, conventions et structure de fichiers peuvent différer. Lire le guide pertinent dans `node_modules/next/dist/docs/` avant d'écrire du code. Tenir compte des avis de dépréciation.

(Cet avertissement remplace l'ancien fichier `AGENTS.md`, qui n'est plus importé par `CLAUDE.md`.)

---

## 1. STACK TECHNIQUE

- Framework : Next.js 16 App Router (lire `node_modules/next/dist/docs/` avant tout code)
- Langage : TypeScript strict
- Styles : CSS Modules uniquement, zéro Tailwind
- Icônes : Lucide React (monochrome, strokeWidth 1.5)
- Images : Next.js `<Image>` + Cloudflare R2 pour les assets, `next.config.ts` autorise tout le domaine R2 (`pathname: "/**"`)
- Éditeur de blog : TipTap (`@tiptap/react`, `starter-kit`, `extension-link`, `extension-image`, `pm`), produit du JSON structuré
- Polices : Fraunces (display), Inter (corps), JetBrains Mono (`--font-mono`, Ticket ID), chargées via `@import` Google Fonts dans `globals.css`
- Déploiement : Vercel. Branche de production `home`. Jamais de push direct, toute modification via Pull Request avec aperçu validé. Dépôt `Swiss-Serenity-Plus/Website`.
- CMS retours et blog : Notion API

### Variables d'environnement (Vercel)

```
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=27665f55d9954a33aa2ac35feab7909f
NOTION_BLOG_DATABASE_ID=ca0b4df233c54095917cb3ea38bc59a0
ADMIN_PASSWORD=...                # accès console /admin (déjà configuré)
CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN / CLOUDFLARE_R2_BUCKET_NAME / CLOUDFLARE_R2_PUBLIC_URL
NOTION_WEBHOOK_SECRET=...          # = verification_token du webhook Notion (optionnel mais recommandé)
```

---

## 2. SYSTÈME DE FEEDBACK / TICKETS

L'outil de retours vit dans une console d'administration `/admin`, protégée par mot de passe, qui affiche le site dans une iframe et porte les contrôles autour. Le widget flottant a été retiré des pages publiques (`<FeedbackWidgetLoader />` supprimé de `app/layout.tsx`). Les fichiers `FeedbackWidget.tsx` / `FeedbackWidgetLoader.tsx` sont conservés (legacy, non importés). Les attributs `data-fb-*` restent (inertes) dans le markup. Docs : `README-admin.md` et `README-blog.md`.

La console `/admin` (`AdminConsole`) propose 4 actions :
1. Modifier un élément (sélection d'un bloc dans l'iframe, highlight rouge + shimmer LED, curseur custom, clic vers formulaire).
2. Modifier l'ensemble du site (feedback général sur la page courante).
3. Gérer mes articles de blog (`BlogManager`).
4. Gérer mes modifications (`TicketsManager`).

### Base Notion tickets
- ID `27665f55d9954a33aa2ac35feab7909f`, data source `328a9e4c-7cee-4d0a-b00f-f50b801f6fe7`.
- Propriétés : `Ticket` (titre = élément · retour), `Ticket ID` (auto-increment `MIR-…`, le vrai numéro), `Statut`, `Action`, `Élément ciblé`, `Page concernée`, `Retour` (texte, PAS « Retour client »), `Date soumission`, `Session ID`, `URL` (ancre de l'élément), `Format` (select desktop/mobile), `Files & media` (image externe), `JSON` (formule, payload copié vers Claude Code).
- Statuts : `À traiter`, `En cours`, `Traité`, `Refusé`, `À review`, `À clarifier`.
- API `/api/tickets` : `GET` (liste, sort created_time desc), `PATCH ?id=` (statut/action/retour/imageUrl), `DELETE ?id=` (archive). `GET /api/tickets/[id]/comments` interroge la page et ses blocs enfants (+ noms d'auteurs).

### Base Notion articles de blog
- ID `ca0b4df233c54095917cb3ea38bc59a0`, data source `daf2950a-1ac2-490e-911e-6a3b82625b2c`.
- Propriétés : Titre, Statut (Brouillon/À relire/Publié/Archivé), Slug, Extrait, Catégorie, Tags, Image cover, Auteur, Date de publication, Temps de lecture, Meta description, Corps (legacy), `Contenu JSON` (rich_text, stocke le JSON TipTap pour réédition).
- Le corps de l'article est stocké en blocs enfants de la page (jamais tronqué). Voir section 5.2 et `README-blog.md`.

### Process Notion technique (clôture d'un ticket)
Mécanique API utilisée par la clôture (déclenchée seulement après mise en ligne et feu vert, voir `CLAUDE.md` section 10) :
1. Statut à `Traité` : `PATCH https://api.notion.com/v1/pages/{id}`, body `{"properties": {"Statut": {"select": {"name": "Traité"}}}}`, headers `Authorization: Bearer $NOTION_TOKEN` + `Notion-Version: 2022-06-28`.
2. Un seul commentaire en français simple : `POST https://api.notion.com/v1/comments`, body `{"parent": {"page_id": "{id}"}, "rich_text": [{"type": "text", "text": {"content": "..."}}]}`, mêmes headers.
3. Suppression d'un commentaire en trop : `DELETE https://api.notion.com/v1/comments/{comment_id}`, header `Notion-Version: 2026-03-11`. On ne peut supprimer que ses propres commentaires.

---

## 3. ROADMAP

### Fait
Infrastructure Next.js 16 et design system complet. Page d'accueil complète. 5 pages services (template commun). Pages /a-propos, /contact, /modalites, /mentions-legales. Outil de retours migré du widget public vers la console `/admin` protégée par mot de passe (desktop-only). Logique de résolution de label extraite dans `app/lib/fbResolve.ts`. `TicketsManager` complet (indicateurs cliquables, recherche, grille, squelettes, affichage progressif, cache mémoire, détail pop-up, édition, suppression). API tickets (`Retour`, `Format`, `Ticket ID`, `URL`, `PATCH`, repli si propriété manquante, commentaires page + blocs enfants). Pipeline blog SEO (éditeur TipTap, corps en blocs enfants Notion, conversion déterministe, lecture serveur, `/blog` et `/blog/[slug]` en SSG/ISR, JSON-LD, revalidation on-demand). `BlogManager` et `CategorySelect`. Redirections `/entreprises` et `/particuliers` vers `/#services`. JSON-LD Schema.org dans le layout. Carte SVG interactive Suisse. Police JetBrains Mono.

### À faire
Vérifier la photo hero sur mobile. Enrichir /a-propos (bio, valeurs, parcours). Vérifier la complétude des pages services vs CSV. Brancher le formulaire de contact (décision Framer natif ou Supabase/API, toujours en TODO). SEO (meta descriptions par page, sitemap, robots). Performance et Core Web Vitals. Responsive complet mobile. Audit accessibilité WCAG 2.1 AA. Favicon et Open Graph par page. Analytics. Pointer le domaine swiss-serenity-plus.ch vers Vercel. Ajustements logo éventuels.

---

## 4. RÈGLES DE TRAVAIL (sessions techniques)

> Règle absolue : branche de production `home`, jamais de push direct. Toute modification via Pull Request, dont Vercel génère un aperçu, fusionnée seulement après validation explicite. Cette règle prime sur toute autre indication de branche dans ce fichier ou ailleurs. Les anciennes consignes pointant vers `claude/setup-swiss-serenity-plus-Fm7s6` correspondent à la phase de construction et sont caduques.

1. CSS Modules uniquement, jamais de style inline sauf valeurs dynamiques, jamais de Tailwind.
2. Icônes Lucide, jamais de caractères Unicode pour les flèches ou icônes (`→` `↗` s'affichent en emoji sur iOS).
3. Tickets Notion après implémentation : statut `Traité`, un seul commentaire en français simple, suppression des commentaires en trop si besoin (mécanique en section 2).
4. Commits : messages clairs en français, 1 commit par groupe cohérent.
5. Branche : production `home`, jamais de push direct, toute modification via Pull Request avec aperçu validé.
6. Questions : si un ticket est ambigu, poser la question avant d'implémenter.
7. Next.js 16 : lire les docs dans `node_modules/next/dist/docs/` si incertain d'une API.
8. Pas de Tailwind, pas de `any` TypeScript, pas de commentaires évidents.
9. Tester le build (`npm run build`) avant chaque push.
10. Tokenisation des retours obligatoire : à chaque création ou modification de composant ou de bloc, appliquer le process de `TOKENISATION-PROCESS.md` (conteneurs en `data-fb-container` + `id="b-…"`, feuilles particulières en `data-fb-label`, contenus texte laissés en auto). Les libellés doivent refléter la vraie valeur affichée. Mettre à jour `FEEDBACK-TOKENS.md`.

---

## 5. JOURNAL DE CONTEXTE (décisions, patterns, process)

> Consigne l'état réel et les décisions prises au fil des sessions. Mettre à jour à chaque session technique.

### 5.1 Infrastructure et workflow de session
- Workflow courant : branche de production `home`, jamais de push direct, Pull Request avec aperçu validé.
- Historique (phase de construction, caduc) : `claude/setup-swiss-serenity-plus-Fm7s6` était la branche par défaut du dépôt ET la branche de production Vercel, on poussait tout dessus, et `vercel.json` contenait un `ignoreCommand` annulant le build de toute autre branche (pas de preview en doublon). Ce mécanisme est incompatible avec le workflow PR/aperçu et a été retiré (voir section 5.12).
- Build : `npm run build` avant chaque push. Lint : `npm run lint` (eslint flat). Pas de tests.

### 5.2 R2 (assets images), réseau
- Le site charge R2 via `next.config.ts` (`remotePatterns` host R2, `pathname:"/**"`), OK sur Vercel.
- En session web, le domaine R2 est bloqué par la politique réseau du sandbox : impossible de valider visuellement ou de télécharger les images. Toujours prévenir « à vérifier sur Vercel ». Déblocage = politique réseau de l'environnement, pas un script.
- Encodage des URLs R2 (caractères spéciaux) : espace `%20`, `:` `%3A`, `&` `%26`, `"` `%22`, `é` `%C3%A9`. Exemple : `Icon%20%3A%20Sourcing%20%26%20Partenaires%20%3A%20Swiss%20Serenity%20Plus.png`.

### 5.3 Patterns techniques établis (réutiliser)
- Icônes custom R2 : champ `iconImage` (URL encodée) sur les data, à la place d'une icône Lucide. Rendu via `ServiceCard` (`<Image>` dans `.iconWrap` 40px, `object-fit: contain`), `ValueProp3Col` (44×44 `unoptimized`), `ColumnsBlock` variant `values` (`col.image` 48×48) et variant `results` (`col.image` 30×30).
- `iconScale` (par carte, `ServiceCard`) : facteur de `transform: scale()` pour compenser le padding interne variable des PNG et égaliser les tailles visuelles. À ajuster visuellement sur Vercel.
- `wideHeader` (`ColumnsBlock`, via `titleOneLine` dans la config `values`) : retire le `max-width:560px` du header et passe en `nowrap` >=768px pour un titre court sur une seule ligne. Ne pas l'activer pour les titres-phrases longs.
- Tokenisation feedback : `data-fb-container` + `id="b-…"`, `data-fb-label`, `fbLabel`/`fbSlug`. Voir `TOKENISATION-PROCESS.md` et `FEEDBACK-TOKENS.md`.

### 5.4 Hero (état final, ne pas réintroduire ce qui a été rejeté)
- État validé desktop : photo paysage R2 ancrée à droite (`width` 56% / 54% >=1280 / 52% >=1600), texte à gauche. Transition photo vers crème = dégradé crème en diagonale (`.imageWrap::before { background: linear-gradient(110deg, var(--c-bg) … transparent 40%) }`) + flou très léger (`.imageWrap::after { backdrop-filter: blur(2px) }`) masqué en bande étroite suivant la même diagonale.
- Rejeté : `backdrop-filter: blur(9px)` (effet brouillard, détesté par la cliente), fond blanc/crème de séparation marqué, coupe nette (`clip-path` diagonale), dégradé vertical. La cliente veut la diagonale.
- Mobile : bandeau photo en haut (`40vh`) qui se fond vers le bas dans le crème, texte dessous.
- Contenu : titre `Sérénité · Succès · Performance` (une seule ligne, `clamp()` + `white-space:nowrap`), eyebrow `Votre partenaire de confiance au quotidien` (« au quotidien » insécable), CTA principal en variante `dark` (bleu nuit + bordure dorée, identique au bouton header).

### 5.5 AboutTeaser (home) et page /a-propos (design encadré premium)
- Encadré unifié : texte + portrait dans une seule carte (bordure dorée, fond crème dégradé). Texture (grille de points dorés) et voile lumineux d'angle révélés au hover. Portrait dépassant en haut du cadre (`top:-56px`) + halo. Bords gauche ET bas incrustés par `mask-image` (intersection de 2 dégradés, `mask-composite: intersect`). Mobile : image en haut débordante + transition floutée vers le texte.
- Page /a-propos : Hero (nom + rôle `Fondatrice de Swiss Serenity Plus®` + promesse), 2 cartes audience (Professionnels / Particuliers, séparateur `Divider` à losange), section « Une expertise construite sur le terrain » (3 paragraphes), section « Notre engagement » (4 valeurs Engagement · Rigueur · Discrétion · Bienveillance + clôture). Toujours `Swiss Serenity Plus®`. Schéma `Person` JSON-LD présent, distinct du breadcrumb.

### 5.6 Autres composants notables
- MountainDecor : décor de montagnes alpines atmosphérique aux bords, révélé au scroll (client). Fondu par `mask-image`, flou `filter: blur(var(--mtn-blur))`, parallaxe vertical léger (rAF, transform only), `prefers-reduced-motion` coupe la parallaxe. Disparaît avant la section `#localisation`. Variables CSS de réglage en tête du module, z-index 1.
- Header : logo recadré agrandi et aligné à gauche sur le texte du Hero. Item de nav « Prestations ». Favicon = logo R2 (`metadata.icons` dans `layout.tsx`), `app/favicon.ico` supprimé. Voile givré (`backdrop-filter`) sur mobile, désactivé quand le menu est ouvert. Nav courante : Accueil / Prestations (`#services`) / Modalités / À propos + CTA « Prendre contact ».
- ContactCTA : bloc compacté (gaps `sp-2`, padding `sp-8`).
- Contact : la page `/contact` utilise `FilloutForm`. Le `ContactForm` statique (avec TODO backend) existe mais n'est plus monté.

### 5.7 Console d'administration /admin (architecture)
> Doc dédiée : `README-admin.md`.
- Pourquoi : le site est en production, l'outil de retours ne doit plus apparaître pour les visiteurs, mais Mireille doit continuer à annoter. La console affiche le site dans une iframe same-origin (URLs relatives) et porte les contrôles autour.
- Auth : `app/lib/adminAuth.ts` (cookie httpOnly `admin_session` = jeton SHA-256 dérivé de `ADMIN_PASSWORD`, 30 j) + `app/api/admin-login/route.ts`. `app/admin/page.tsx` est un Server Component qui lit le cookie et rend `AdminLogin` ou `AdminConsole`. Protégé sur prod ET previews. Desktop-only (< 1024 px = écran bloquant).
- Fichiers : `app/admin/_components/` (`AdminConsole`, `BrowserFrame`, `BlogManager`, `TicketsManager`, `CategorySelect`, `ArticleEditor`). Logique de label dans `app/lib/fbResolve.ts`.
- Sélection de bloc : écouteurs sur `iframe.contentDocument`, highlight = outline injecté dans le contentDocument (suit scroll/resize, pas un overlay à coordonnées). Curseur custom. Shimmer LED rouge (`mask-composite` + `@property --fb-shimmer-angle`). Couleur sélection rouge signature `#b42c2a`.
- Zone d'aperçu (`stageView` = `browser` | `blog` | `tickets`) : overlay `position:fixed; left:340px`, l'iframe reste montée dessous.
- TicketsManager : indicateurs cliquables (dont « Bloqués » = `À clarifier` + `Refusé` + `À review`), recherche (Ticket ID / titre / Retour), grille de cartes, squelettes, affichage progressif (15 + scroll via IntersectionObserver), cache mémoire module-level, détail en pop-up centré, édition (statut/action via `CustomSelect`, retour en textarea, image jointe éditable, `PATCH /api/tickets` réécrit `Files & media`).

### 5.8 Pipeline blog SEO (TipTap vers blocs Notion vers public + ISR)
> Doc dédiée : `README-blog.md`. Pipeline déterministe et SEO-propre.
- Éditeur : `app/admin/_components/ArticleEditor.tsx` (TipTap). Jeu de nœuds restreint (paragraphe, H2/H3, listes, gras, italique, lien, image upload R2). Produit du JSON TipTap (jamais du HTML `execCommand`).
- Stockage : corps en blocs enfants de la page Notion (jamais tronqué). JSON brut dans `Contenu JSON` (segments <= 2000) pour réédition.
- Conversion : `app/lib/notionBlocks.ts` (`tiptapToNotionBlocks`, listes imbriquées aplaties, rich_text découpé sans troncature). `app/lib/tiptapHtml.ts` = rendu HTML pour l'aperçu éditeur.
- API `app/api/blog-posts/route.ts` : `GET` (liste + `bodyJson`), `POST` (page + blocs par lots de 100), `PATCH ?id=` (propriétés + suppression/recréation des blocs enfants), `revalidatePath` à la publication.
- Lecture serveur : `app/lib/blog.ts` (`getPublishedPosts`, `getPostBySlug`, `getPostBlocks` vers HTML sémantique échappé).
- Pages : `app/blog/page.tsx` (liste les `Publié`, `revalidate=3600`), `app/blog/[slug]/page.tsx` (`generateStaticParams` + `generateMetadata` OG/canonical + JSON-LD BlogPosting + `notFound()`). Images du corps en `<img loading="lazy">`.
- Édition (BlogManager) : statut = tag éditable (`StatusTagSelect`), un seul bouton « Enregistrer ». Couverture : au survol, Remplacer / Supprimer (nettoyage R2 côté serveur au save via `app/lib/r2.ts`). Date de publication = dropdown. Reconstruction du corps depuis les blocs si `Contenu JSON` absent (`GET /api/blog-posts/[id]/content`, `notionBlocksToTiptap`). `Article ID` (BLOG-N) exposé par le `GET`.
- Webhook Notion vers revalidation : `app/api/notion-webhook/route.ts`. Notion appelle ce endpoint à chaque création/modif/suppression de page, on `revalidatePath("/blog")` + `/blog/[slug]`. Handshake de vérif (`{ verification_token }` vers 200, token journalisé pour Notion), signature `X-Notion-Signature` (HMAC-SHA256) vérifiée si `NOTION_WEBHOOK_SECRET` défini.

### 5.9 Pièges lint React Compiler (Next 16)
- `react-hooks/set-state-in-effect` (fetch au montage, dérivation dans un effet) : `// eslint-disable-next-line react-hooks/set-state-in-effect`.
- `react-hooks/refs` (assignation de ref pendant le render) : faire l'assignation dans un `useEffect`.
- Éviter les IIFE invoquées pendant le render. Le build ne lance pas eslint, mais garder les fichiers propres (`npx eslint app/...`).

### 5.10 Tickets MIR traités (historique récent)
196 (icône Rigueur), 350 (refonte bloc /a-propos), 354 (titre Hero 1 ligne), 356 (Expertise vers Prestations), 357 (CTA Hero variante dark), 358 (« au quotidien » insécable), 361 (® titre Piliers), 362/365/368/369 (icônes cartes services), 363/366/367 (icônes piliers ValueProp), 371 (Clarté vers Performance), 372 (icône Expérience sur page Structuration), 373 (icône résultat + support image au variant results), 374 (icône Performance), 375 (texte valeur Performance), 376 (titre valeurs 1 ligne, `wideHeader`), 378 (logo agrandi), 379 (eyebrow agrandi), 400 (sous-titre page blog).

### 5.11 Vision produit (rappel)
Premium classique suisse, épuré, « navigation fluide · aspect premium · qualité et confiance ». Mireille = bras droit de confiance (jamais « assistante low-cost »). Voix : 1re personne pour Mireille, ton confiant et chaleureux. Respecter le design system (tokens), CSS Modules, icônes Lucide ou images R2 custom, pas de Tailwind. Positionnement, copywriting et identité visuelle : voir `CLAUDE.md` section 9.

### 5.12 Déploiement Vercel (workflow PR/aperçu)
- Projet Vercel `website` (compte `mireilledayer`).
- Réglage requis côté tableau de bord Vercel : Production Branch = `home`. Les Pull Requests génèrent des Preview Deployments, la fusion dans `home` déclenche le Production Deployment.
- `vercel.json` : l'ancien `ignoreCommand` (qui ne laissait builder que `claude/setup-swiss-serenity-plus-Fm7s6` et donc bloquait tout aperçu de PR) a été retiré. Sans lui, Vercel build chaque branche poussée (preview) et la branche de production (prod), ce qui est exactement le comportement attendu par le workflow PR/aperçu.

---

## 6. CONTACTS ET ACCÈS

| Ressource | Info |
|-----------|------|
| Client | Mireille Dayer, mireille.dayer@swiss-serenity-plus.ch |
| Chef de projet | Théo Gouman, theo@gouman.fr |
| Repo GitHub | `Swiss-Serenity-Plus/Website` |
| Branche de production | `home` (jamais de push direct, toujours une Pull Request avec aperçu validé) |
| Vercel | Projet `website` (compte `mireilledayer`) |
| Notion tickets | Base `27665f55d9954a33aa2ac35feab7909f` |
| Notion blog | Base `ca0b4df233c54095917cb3ea38bc59a0` |
