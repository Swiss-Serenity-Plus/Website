# Swiss Serenity Plus — Site web

Site vitrine premium pour **Swiss Serenity Plus**, la société de Mireille Dayer à Sion (Valais, Suisse). Le site propose ses services de « bras droit externalisé » aux entreprises et aux particuliers en Suisse romande.

> **Après une migration GitHub → organisation et un changement de compte Vercel**, pensez à vérifier en premier lieu la section [Variables d'environnement](#variables-denvironnement-critique) — c'est la cause la plus fréquente de panne d'API après une migration.

---

## Table des matières

1. [Stack technique](#stack-technique)
2. [Structure du projet](#structure-du-projet)
3. [Variables d'environnement (CRITIQUE)](#variables-denvironnement-critique)
4. [Déploiement Vercel](#déploiement-vercel)
5. [Développement local](#développement-local)
6. [Pages & URLs](#pages--urls)
7. [Routes API](#routes-api)
8. [Base de données Notion](#base-de-données-notion)
9. [Stockage images (Cloudflare R2)](#stockage-images-cloudflare-r2)
10. [Console d'administration `/admin`](#console-dadministration-admin)
11. [Pipeline blog](#pipeline-blog)
12. [Composants principaux](#composants-principaux)
13. [Décisions architecturales](#décisions-architecturales)

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.6 | Framework full-stack (App Router) |
| React | 19.2.4 | Interface utilisateur |
| TypeScript | strict | Langage (zéro `any`) |
| CSS Modules | — | Styles (zéro Tailwind, zéro style inline) |
| [TipTap](https://tiptap.dev) | 2.27.2 | Éditeur de texte riche (blog) |
| [Lucide React](https://lucide.dev) | 1.16.0 | Icônes (strokeWidth 1.5, monochrome) |
| [Notion API](https://developers.notion.com) | 2022-06-28 | CMS : articles de blog + tickets de retours |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | — | Stockage des images (photos, icônes) |
| [Vercel](https://vercel.com) | — | Hébergement + ISR (revalidation blog) |

**Polices** (chargées via `@import` Google Fonts dans `globals.css`) :
- **Fraunces** — titres display (serif expressif)
- **Inter** — corps de texte (sans-serif neutre)
- **JetBrains Mono** — identifiants de tickets (MIR-XXX)

---

## Structure du projet

```
Swiss-Serenity-Plus/Website
│
├── app/                        # Code Next.js (App Router)
│   ├── page.tsx                # Page d'accueil /
│   ├── layout.tsx              # Layout racine (métadonnées, Schema.org)
│   ├── globals.css             # Styles globaux + import des polices
│   ├── styles/
│   │   └── tokens.css          # Design tokens (couleurs, typographie, spacing)
│   │
│   ├── a-propos/               # Page /a-propos
│   ├── contact/                # Page /contact
│   ├── mentions-legales/       # Page /mentions-legales
│   ├── blog/                   # Pages blog (SSG + ISR)
│   │   └── [slug]/             # Article individuel
│   │
│   ├── entreprises/            # 4 pages services B2B
│   │   ├── structuration-organisation/
│   │   ├── suivi-optimisation/
│   │   ├── sourcing-partenaires/
│   │   └── experience-client/
│   ├── particuliers/           # 1 page service B2C
│   │   └── accompagnement-administratif/
│   │
│   ├── admin/                  # Console d'administration (protégée)
│   │   ├── page.tsx            # Point d'entrée (login ou console)
│   │   ├── blog/               # Sous-page éditeur blog
│   │   └── _components/        # Composants admin (non exposés publiquement)
│   │       ├── AdminConsole.tsx
│   │       ├── AdminLogin.tsx
│   │       ├── BrowserFrame.tsx    # Fenêtre navigateur + iframe du site
│   │       ├── TicketsManager.tsx  # Gestion des retours Notion
│   │       ├── BlogManager.tsx     # Gestion des articles
│   │       ├── ArticleEditor.tsx   # Éditeur TipTap
│   │       └── CategorySelect.tsx
│   │
│   ├── api/                    # Routes API Next.js (server-side)
│   │   ├── admin-login/        # POST login / DELETE logout
│   │   ├── feedback/           # POST retours → Notion tickets
│   │   ├── tickets/            # GET/PATCH/DELETE tickets Notion
│   │   │   └── [id]/comments/ # GET commentaires d'un ticket
│   │   ├── blog-posts/         # GET/POST/PATCH articles Notion
│   │   │   └── [id]/content/  # GET reconstruction TipTap depuis Notion
│   │   ├── notion-webhook/     # POST webhook Notion → revalidation ISR
│   │   └── upload-image/       # POST/DELETE upload image → R2
│   │
│   ├── components/             # 33 composants réutilisables
│   ├── data/
│   │   └── services.ts         # Catalogue des 5 services (source unique)
│   └── lib/                    # Utilitaires serveur
│       ├── adminAuth.ts        # Authentification /admin
│       ├── blog.ts             # Lecture blog depuis Notion
│       ├── notionBlocks.ts     # Conversion TipTap ↔ blocs Notion
│       ├── r2.ts               # Suppression d'objets R2
│       ├── seo.ts              # Constantes SEO (SITE_URL, OG_IMAGE)
│       ├── tiptapHtml.ts       # TipTap JSON → HTML (aperçu éditeur)
│       ├── fbResolve.ts        # Résolution des labels du widget de retours
│       └── fbToken.ts          # Utilitaires de tokenisation feedback
│
├── public/                     # Assets statiques (SVG, logo)
│
├── .claude/                    # Configuration Claude Code
│   ├── settings.json           # Hook SessionStart
│   └── hooks/
│       └── session-start.sh    # npm install + config signature Git
│
├── CLAUDE.md                   # Référence absolue du projet (lire en premier)
├── AGENTS.md                   # Règles pour les agents IA
├── TOKENISATION-PROCESS.md     # Guide de tokenisation feedback
├── FEEDBACK-TOKENS.md          # Inventaire des tokens feedback
├── README-admin.md             # Doc détaillée console /admin
├── README-blog.md              # Doc détaillée pipeline blog
├── README-feedback.md          # Doc widget feedback (legacy)
│
├── next.config.ts              # Config Next.js (domaine R2, redirections)
├── vercel.json                 # Config Vercel (stratégie de déploiement)
├── tsconfig.json               # Config TypeScript strict
└── eslint.config.mjs           # Config ESLint (React Compiler rules)
```

### Design tokens (`app/styles/tokens.css`)

Tous les composants utilisent des variables CSS — jamais de valeurs codées en dur.

| Token | Valeur | Usage |
|---|---|---|
| `--c-text` | `#062445` | Texte principal (bleu nuit) |
| `--c-text-muted` | `#4a5a6f` | Texte atténué |
| `--c-bg` | `#f7f5f1` | Fond (blanc chaud) |
| `--c-surface` | `#ffffff` | Surfaces de carte |
| `--c-accent` | `#b42c2a` | Accent bordeaux |
| `--c-gold` | `#977b57` | Accent taupe doré |
| `--c-border` | `#e8e3d8` | Bordures |
| `--font-display` | Fraunces | Titres |
| `--font-body` | Inter | Corps |
| `--font-mono` | JetBrains Mono | IDs tickets |

---

## Variables d'environnement (CRITIQUE)

> **Si les API ne répondent plus après une migration**, c'est presque toujours parce que les variables d'environnement n'ont pas été reconfigurées dans le nouveau projet Vercel. Vercel ne les migre pas automatiquement d'un projet à l'autre.

### Configurer dans Vercel → Settings → Environment Variables

| Variable | Obligatoire | Description |
|---|---|---|
| `ADMIN_PASSWORD` | ✅ | Mot de passe d'accès à la console `/admin`. Choisir une chaîne forte. S'applique à tous les environnements (prod + preview). |
| `NOTION_TOKEN` | ✅ | Token d'intégration Notion (`secret_...`). Créer sur [notion.so/my-integrations](https://www.notion.so/my-integrations). L'intégration doit être invitée sur les deux bases de données. |
| `NOTION_DATABASE_ID` | ✅ | ID de la base Notion des **tickets de retours**. Valeur fixe : `27665f55d9954a33aa2ac35feab7909f` |
| `NOTION_BLOG_DATABASE_ID` | ✅ | ID de la base Notion des **articles de blog**. Valeur fixe : `ca0b4df233c54095917cb3ea38bc59a0` |
| `NOTION_WEBHOOK_SECRET` | ⚠️ optionnel | Token de vérification du webhook Notion (signature HMAC). Recommandé en production. |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | ID du compte Cloudflare (visible dans le dashboard R2). |
| `CLOUDFLARE_API_TOKEN` | ✅ | Token API Cloudflare avec permissions R2 (lecture + écriture + suppression). |
| `CLOUDFLARE_R2_BUCKET_NAME` | ✅ | Nom du bucket R2 (`photos-site` ou selon votre configuration). |
| `CLOUDFLARE_R2_PUBLIC_URL` | ✅ | URL publique du bucket R2. Ex : `https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev` |

### Vérification rapide après migration

Ouvrir dans un navigateur après déploiement :

```
https://votre-domaine.vercel.app/api/tickets        → doit retourner du JSON (liste vide = OK)
https://votre-domaine.vercel.app/api/blog-posts     → doit retourner du JSON
https://votre-domaine.vercel.app/admin              → doit afficher la page de login
```

Si vous obtenez `{"error":"Configuration serveur manquante"}` → variables d'env absentes dans Vercel.  
Si vous obtenez une erreur 401 de Notion → `NOTION_TOKEN` invalide ou intégration non invitée sur la base.

---

## Déploiement Vercel

### Comment ça marche

Le projet utilise **deux branches Git** avec des rôles distincts :

| Branche | Rôle | Déploiement Vercel |
|---|---|---|
| `claude/setup-swiss-serenity-plus-Fm7s6` | **Branche de production** | ✅ Build → `target: production` |
| `claude/kind-lovelace-uqfqnn` (ou autre `claude/*`) | Branche de session Claude Code | ❌ Ignorée (pas de déploiement) |

### `vercel.json` — Le filtre de déploiement

```json
{
  "ignoreCommand": "if [ \"$VERCEL_GIT_COMMIT_REF\" = \"claude/setup-swiss-serenity-plus-Fm7s6\" ]; then exit 1; else exit 0; fi"
}
```

Vercel exécute `ignoreCommand` avant chaque build :
- **exit 1** → Vercel **construit** le projet (ne pas ignorer)
- **exit 0** → Vercel **annule** le build (ignorer)

Résultat : seule la branche de prod `claude/setup-swiss-serenity-plus-Fm7s6` déclenche un déploiement. Les branches de session Claude Code peuvent être poussées librement sans créer de preview inutile.

### Workflow de push

```bash
# 1. Toujours récupérer les derniers changements avant de pousser
git fetch origin claude/setup-swiss-serenity-plus-Fm7s6

# 2. Vérifier que le build passe
npm run build

# 3. Pousser vers la branche de production
git push origin HEAD:claude/setup-swiss-serenity-plus-Fm7s6
```

> **⚠️ Jamais** de `git push --force` sur la branche de prod. En cas de divergence, utiliser `git rebase origin/claude/setup-swiss-serenity-plus-Fm7s6`.

### ISR (blog)

Les pages blog utilisent la **revalidation incrémentale** :
- Revalidation automatique toutes les **3600 secondes** (1 heure)
- Revalidation **à la demande** via le webhook Notion (`/api/notion-webhook`) → déclenché à chaque modification d'article dans Notion

---

## Développement local

### Prérequis

- Node.js ≥ 18
- Un fichier `.env.local` à la racine (voir ci-dessous)

### Installation

```bash
git clone https://github.com/Swiss-Serenity-Plus/Website.git
cd Website
npm install
```

### Fichier `.env.local`

Créer `.env.local` à la racine (jamais committé) :

```env
ADMIN_PASSWORD=votre_mot_de_passe_admin

NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=27665f55d9954a33aa2ac35feab7909f
NOTION_BLOG_DATABASE_ID=ca0b4df233c54095917cb3ea38bc59a0
NOTION_WEBHOOK_SECRET=                  # optionnel en local

CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxx
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxx
CLOUDFLARE_R2_BUCKET_NAME=photos-site
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev
```

### Démarrage

```bash
npm run dev        # http://localhost:3000
npm run build      # Build de production (obligatoire avant chaque push)
npm run lint       # Vérification ESLint
```

> **Note** : en développement local, les images R2 sont chargées depuis le domaine public Cloudflare — elles s'affichent normalement si votre connexion n'est pas filtrée. Dans certains environnements sandbox (ex. Claude Code web), le domaine R2 peut être bloqué par la politique réseau.

---

## Pages & URLs

| URL | Composant | Type | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | SSG | Accueil : Hero, piliers, services, À propos, carte, CTA |
| `/a-propos` | `app/a-propos/page.tsx` | SSG | Présentation de Mireille Dayer |
| `/contact` | `app/contact/page.tsx` | SSG | Formulaire de contact |
| `/mentions-legales` | `app/mentions-legales/page.tsx` | SSG | Mentions légales |
| `/blog` | `app/blog/page.tsx` | ISR 1h | Liste des articles publiés |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | ISR 1h | Article individuel |
| `/entreprises/structuration-organisation` | Service page | SSG | Service B2B |
| `/entreprises/suivi-optimisation` | Service page | SSG | Service B2B |
| `/entreprises/sourcing-partenaires` | Service page | SSG | Service B2B |
| `/entreprises/experience-client` | Service page | SSG | Service B2B |
| `/particuliers/accompagnement-administratif` | Service page | SSG | Service B2C |
| `/admin` | `app/admin/page.tsx` | Dynamic | Console d'administration (protégée) |
| `/admin/blog` | `app/admin/blog/page.tsx` | Dynamic | Éditeur d'articles |

**Redirections permanentes** (configurées dans `next.config.ts`) :
- `/entreprises` → `/#services`
- `/particuliers` → `/#services`

**Pages générées automatiquement par Next.js** :
- `/sitemap.xml` — `app/sitemap.ts`
- `/robots.txt` — `app/robots.ts`

---

## Routes API

Toutes les routes sont dans `app/api/`. Elles s'exécutent **côté serveur** et n'exposent jamais les tokens aux clients.

### `/api/admin-login`

| Méthode | Corps | Réponse | Description |
|---|---|---|---|
| `POST` | `{ password: string }` | `{ ok: true }` + cookie | Authentification admin |
| `DELETE` | — | `{ ok: true }` | Déconnexion (efface le cookie) |

Le cookie `admin_session` contient un hash SHA-256 du mot de passe (jamais le mot de passe lui-même). Durée : 30 jours.

### `/api/feedback`

| Méthode | Corps | Réponse | Description |
|---|---|---|---|
| `POST` | `{ sessionId, feedbacks: FeedbackItem[] }` | `{ success, created }` | Crée des tickets Notion |
| `OPTIONS` | — | 204 | Préflight CORS |

Crée une **page Notion par retour** dans la base tickets. Si le retour dépasse 2 000 caractères (limite Notion), le texte complet est écrit dans le corps de la page, la propriété affiche un aperçu tronqué. Si la propriété `Format` n'existe pas encore dans la base, l'API retente sans elle (fallback gracieux).

### `/api/tickets`

| Méthode | Params | Description |
|---|---|---|
| `GET` | — | Liste tous les tickets (tri : plus récents en premier) |
| `PATCH` | `?id=page_id` | Met à jour statut / action / retour / image d'un ticket |
| `DELETE` | `?id=page_id` | Archive un ticket (Notion : `archived: true`) |

### `/api/tickets/[id]/comments`

| Méthode | Description |
|---|---|
| `GET` | Récupère les commentaires Notion + blocs enfants d'un ticket. Résout les noms d'auteurs via l'API Notion Users. |

### `/api/blog-posts`

| Méthode | Params | Description |
|---|---|---|
| `GET` | — | Liste tous les articles (toutes statuts, pour l'éditeur admin) |
| `POST` | — | Crée un article : propriétés Notion + blocs enfants TipTap |
| `PATCH` | `?id=page_id` | Met à jour un article. Si le corps change : suppression + recréation des blocs enfants |

Le corps de l'article est stocké **en blocs enfants** de la page Notion (jamais tronqué). Le JSON TipTap brut est également stocké dans la propriété `Contenu JSON` (découpé en segments de 2 000 caractères) pour permettre la réédition fidèle.

### `/api/blog-posts/[id]/content`

| Méthode | Description |
|---|---|
| `GET` | Lit les blocs enfants Notion d'un article et les reconstruit en JSON TipTap. Utilisé quand un article a été créé ou modifié directement dans Notion (sans `Contenu JSON`). |

### `/api/notion-webhook`

| Méthode | Description |
|---|---|
| `POST` | Reçoit les événements Notion → `revalidatePath("/blog")` + `/blog/[slug]` |
| `GET` | Health check |

Lors de la première connexion du webhook Notion, l'API reçoit `{ verification_token }` et répond 200 — Notion valide ainsi l'endpoint. Les appels suivants sont optionnellement vérifiés via signature HMAC-SHA256 (`X-Notion-Signature` header) si `NOTION_WEBHOOK_SECRET` est défini.

**URL à configurer dans Notion** : `https://mireille-xi.vercel.app/api/notion-webhook`

### `/api/upload-image`

| Méthode | Description |
|---|---|
| `POST` | Reçoit un fichier multipart → upload vers Cloudflare R2 (prefix `blog-covers/`) → retourne l'URL publique |
| `DELETE` | Supprime une image R2 (par URL dans query `?url=` ou corps JSON `{ url }`) |

---

## Base de données Notion

Le projet utilise **deux bases Notion** distinctes.

### Base tickets (retours Mireille)

**ID** : `27665f55d9954a33aa2ac35feab7909f`

| Propriété Notion | Type | Description |
|---|---|---|
| `Ticket` | title | Titre auto-généré : `Élément · début du retour` |
| `Ticket ID` | unique_id | Identifiant auto-incrémenté `MIR-XXX` |
| `Statut` | select | `À traiter` / `En cours` / `Traité` / `Refusé` / `À review` / `À clarifier` |
| `Action` | select | Type d'action demandée |
| `Élément ciblé` | rich_text | Label de l'élément annoté |
| `Page concernée` | select | Page du site concernée |
| `Retour` | rich_text | Texte du retour (tronqué à 2 000 car. si dépassement) |
| `Date soumission` | date | Horodatage ISO |
| `Session ID` | rich_text | Identifiant de session Claude Code |
| `URL` | url | Ancre de l'élément sur le site |
| `Format` | select | `desktop` ou `mobile` |
| `Files & media` | files | Capture d'écran jointe |

### Base articles de blog

**ID** : `ca0b4df233c54095917cb3ea38bc59a0`

| Propriété Notion | Type | Description |
|---|---|---|
| `Titre` | title | Titre de l'article |
| `Statut` | select | `Brouillon` / `À relire` / `Publié` / `Archivé` |
| `Slug` | rich_text | URL de l'article (`/blog/mon-article`) |
| `Extrait` | rich_text | Résumé pour les cartes de liste |
| `Catégorie` | select | Catégorie éditable |
| `Tags` | multi_select | Mots-clés |
| `Image cover` | url | URL de l'image de couverture (R2) |
| `Auteur` | rich_text | Nom de l'auteur |
| `Date de publication` | date | Date affichée sur le site |
| `Temps de lecture` | number | En minutes |
| `Meta description` | rich_text | Description pour les moteurs de recherche |
| `Contenu JSON` | rich_text | JSON TipTap brut (pour réédition, découpé en segments) |

Le **corps de l'article** (le vrai contenu publié) est stocké en **blocs enfants** de la page Notion.

---

## Stockage images (Cloudflare R2)

Toutes les images du site (photos, icônes, captures) sont hébergées sur **Cloudflare R2**.

**Bucket public** : `https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev`

### Images clés

| Image | URL R2 |
|---|---|
| Photo hero (montagne) | `.../photos-site/Paysage%20-%20Swiss%20Serenity%20Plus%20-%20Mireille%20Dayer.png` |
| Portrait Mireille | `.../image.png` |
| Icônes services | `.../icons/Icon%20%3A%20Sourcing%20...` |

### Encodage des URLs

Les noms de fichiers avec caractères spéciaux doivent être encodés : espace → `%20`, `:` → `%3A`, `&` → `%26`.

### `next.config.ts` — Domaine autorisé

```ts
remotePatterns: [{
  protocol: "https",
  hostname: "pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev",
  pathname: "/**",
}]
```

`next/image` ne peut optimiser que les images des domaines listés ici. Si vous changez de bucket R2, mettez à jour ce fichier.

---

## Console d'administration `/admin`

La console `/admin` est l'outil de travail de Mireille pour annoter le site et gérer les articles. Elle est **invisible des visiteurs publics** (le widget flottant a été supprimé du bundle public).

### Architecture

```
Navigateur Mireille
└── /admin (Server Component)
    ├── AdminLogin        → si pas de cookie valide
    └── AdminConsole      → si authentifiée
        ├── BrowserFrame  → fenêtre macOS simulée + <iframe src="/">
        │   ├── Switcher Desktop / Mobile
        │   └── Barre d'URL (navigation dans l'iframe)
        ├── TicketsManager → liste, filtre, édition des retours Notion
        └── BlogManager   → liste + éditeur TipTap des articles
```

### Authentification

1. Mireille soumet son mot de passe via `AdminLogin`
2. `POST /api/admin-login` vérifie contre `ADMIN_PASSWORD`
3. Si correct → cookie httpOnly `admin_session` = `SHA256("swiss-serenity-admin::" + password)` (30 jours)
4. Les pages admin et toutes les API admin vérifient ce cookie à chaque requête

Le cookie est httpOnly (inaccessible au JavaScript) et stocke uniquement un hash dérivé, jamais le mot de passe.

### Mode annotation

Dans la console, Mireille peut cliquer sur **"Modifier un élément"** pour activer le mode sélection :
- L'iframe reçoit des écouteurs d'événements
- Au survol : outline rouge sur l'élément
- Au clic : formulaire de retour pré-rempli avec le label de l'élément (`data-fb-label`) et le conteneur (`data-fb-container`)
- Un shimmer LED rouge anime le cadre de la fenêtre

### Tokenisation des éléments

Chaque bloc du site porte des attributs pour identifier les retours précisément :
- `data-fb-container="b-hero"` — identifie le conteneur (section, carte…)
- `data-fb-label="Titre principal"` — identifie un élément spécifique

La logique de résolution des labels est dans `app/lib/fbResolve.ts`.

---

## Pipeline blog

```
Éditeur TipTap (AdminConsole)
  → JSON structuré
  → POST /api/blog-posts
  → Conversion en blocs Notion (notionBlocks.ts)
  → Stockage : blocs enfants de la page + propriété "Contenu JSON"
  → Webhook Notion → POST /api/notion-webhook
  → revalidatePath("/blog") + revalidatePath("/blog/[slug]")
  → Page publique mise à jour immédiatement
```

### Lecture côté serveur

```
/blog/[slug] (Server Component, ISR 1h)
  → getPostBySlug() — app/lib/blog.ts
  → Notion API : propriétés + blocs enfants
  → getPostBlocks() → HTML sémantique échappé
  → Rendu dans la page avec generateMetadata (OG, canonical, JSON-LD)
```

### Réédition d'un article

Si l'article a été créé directement dans Notion (sans passer par l'éditeur) :
1. `GET /api/blog-posts/[id]/content`
2. Récupère les blocs enfants Notion
3. `notionBlocksToTiptap()` reconstruit le JSON TipTap
4. L'éditeur s'ouvre avec le contenu fidèle

---

## Composants principaux

Tous les composants sont dans `app/components/`. Chacun a son propre fichier CSS Module.

| Composant | Description |
|---|---|
| `Header` | Navigation principale avec menu mobile et lien d'ancre vers `#services` |
| `Hero` | Section hero : photo paysage ancrée à droite (56% viewport), texte à gauche, dégradé diagonal crème, SVG montagnes décoratives |
| `ValueProp3Col` | 3 piliers de valeur (Stratégique / Discrétion / Flexibilité) avec icônes R2 |
| `ServiceSection` | Grille 3+2 des 5 services avec tags audience Entreprises/Particuliers |
| `ServiceCard` | Carte individuelle de service avec icône, description, lien, tag audience |
| `AboutTeaser` | Bloc encadré premium : texte gauche + portrait Mireille droite avec effet halo |
| `LocalTrust` | Ancrage géographique : texte + carte SVG Suisse interactive (4 cantons au hover) |
| `SwitzerlandMap` | Carte SVG des cantons VS/VD/FR/GE avec hover illuminé |
| `MountainDecor` | Décor alpin atmosphérique aux bords, révélé au scroll avec parallaxe |
| `ContactCTA` | Bloc d'appel à l'action final |
| `ContactForm` | Formulaire de contact |
| `Footer` | Pied de page avec drapeaux de langue (FR/DE/EN) avec effet avatar-group |
| `PageHero` | Hero pour les pages internes (services, à propos) |
| `ServicePageTemplate` | Template commun à toutes les pages services |
| `Button` | Bouton pill (border-radius 9999px), variants : `primary` / `secondary` / `ghost` / `dark` |
| `ColumnsBlock` | Bloc multi-colonnes, variants : `values` / `steps` / `results` — supporte icônes Lucide et images R2 |
| `PageTreeNav` | Navigation en arbre pour la console admin (accordion dépliable) |

---

## Décisions architecturales

### Pourquoi CSS Modules et non Tailwind ?

Le design system est fortement tokenisé (variables CSS custom). CSS Modules permettent d'utiliser ces tokens directement dans le CSS, avec scoping automatique. Tailwind aurait nécessité de reconfigurer toute la palette et aurait rendu le CSS moins lisible face aux règles premium complexes (gradients, masks, backdrop-filter).

### Pourquoi Notion comme CMS ?

Mireille travaille déjà dans Notion. Cela évite d'introduire un CMS supplémentaire et permet à l'équipe de gérer le contenu dans un outil familier. L'API Notion v2022-06-28 est stable et bien documentée.

### Pourquoi les blocs enfants pour le blog (et non une propriété texte) ?

La propriété `rich_text` de Notion est limitée à 2 000 caractères par segment. Pour un article de blog, c'est insuffisant. Les **blocs enfants** d'une page Notion n'ont pas de limite de longueur — c'est la même structure que le corps d'une page Notion normale.

### Pourquoi TipTap et non l'API Notion directement pour l'édition ?

L'éditeur natif Notion n'est pas intégrable dans une application web tierce. TipTap produit du JSON structuré (pas de HTML brut) qui est converti de façon déterministe en blocs Notion (`notionBlocks.ts`). Ce pipeline est prévisible, testable, et produit du HTML sémantique pour le SEO.

### Pourquoi une console `/admin` plutôt qu'un widget flottant public ?

Le site est passé en production avec des visiteurs réels. Un widget flottant visible de tous les visiteurs était incohérent avec le positionnement premium. La console `/admin` isole l'outil dans un environnement protégé par mot de passe, sans aucun JS supplémentaire dans le bundle public.

### Pourquoi une seule branche de production et non `main` ?

L'historique du projet a démarré sur une branche Claude Code (`claude/setup-swiss-serenity-plus-Fm7s6`). Cette branche est devenue la branche par défaut du dépôt et est directement connectée à Vercel en `target: production`. Migrer vers `main` nécessiterait de reconfigurer Vercel et de mettre à jour `vercel.json` — c'est faisable mais pas prioritaire tant que le workflow fonctionne.

### Pourquoi `vercel.json` ignore les autres branches ?

Plusieurs branches Claude Code coexistent dans le dépôt (une par session de travail). Sans le filtre `ignoreCommand`, chaque push de session créerait un déploiement preview sur Vercel — inutile et confus. Le filtre garantit que seule la branche de prod crée un déploiement.

### Pourquoi Cloudflare R2 pour les images ?

Next.js `<Image>` optimise les images à la volée mais requiert que les domaines sources soient whitelistés dans `next.config.ts`. R2 offre un stockage d'objets compatible S3, avec un CDN global, sans frais d'egress (contrairement à AWS S3). Le bucket public permet un accès direct aux assets sans passer par les API Routes.

---

## Ressources

| Ressource | URL / Info |
|---|---|
| Repo GitHub | `Swiss-Serenity-Plus/Website` |
| Projet Vercel | `mireille` (team `swiss-serenity-plus`) |
| URL de production | `https://mireille-xi.vercel.app` (ou domaine custom) |
| Notion tickets | [Base `27665f55...`](https://www.notion.so/gouman/27665f55d9954a33aa2ac35feab7909f) |
| Notion blog | Base `ca0b4df2...` |
| Bucket R2 | `pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev` |
| Webhook blog | `https://mireille-xi.vercel.app/api/notion-webhook` |
| Client | Mireille Dayer — mireille.dayer@swiss-serenity-plus.ch |
| Chef de projet | Théo Gouman — theo@gouman.fr |

---

*Ce README est la porte d'entrée du projet. Pour les décisions de design et le contexte client complet, lire `CLAUDE.md`. Pour la console admin, voir `README-admin.md`. Pour le blog, voir `README-blog.md`.*
