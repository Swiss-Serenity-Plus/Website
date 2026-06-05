# Console d'administration `/admin` — Outil de retours

Depuis la mise en production, l'outil de retours n'est plus un widget flottant
injecté dans les pages publiques. Il vit dans une console dédiée, protégée par
mot de passe, accessible sur `/admin`.

## Fonctionnement

La console affiche le site courant dans une fenêtre-navigateur (iframe
same-origin) et porte les contrôles autour :

- **Sélecteur de page** : charge n'importe quelle page du site dans l'aperçu.
- **Naviguer / Annoter** : en mode Naviguer, les liens du site fonctionnent
  normalement. En mode Annoter, un clic dans l'aperçu sélectionne le bloc visé.
- **Sélectionner un bloc** : survol puis clic d'un élément dans l'aperçu, le
  formulaire de retour s'ouvre pré-rempli avec le libellé « QUOI dans OÙ ».
- **Feedback général** : remarque globale rattachée à la page courante, sans
  cibler un bloc précis.
- **Switcher Ordinateur / Mobile** : change la largeur rendue de l'aperçu. Le
  format choisi au moment de l'annotation est enregistré sur le ticket.
- **Voir les retours envoyés** : grille des tickets Notion (rafraîchir,
  supprimer, filtrer par statut).

Les retours sont mis en file (brouillons) puis envoyés en lot vers la base
Notion, comme avant.

> Le flow « Création d'article de blog » n'est pas encore porté dans la console.
> Il reste accessible via `/admin/blog` et sera intégré dans un second temps.

## Mise en route

### 1. Mot de passe d'accès (`ADMIN_PASSWORD`)

Ajouter la variable d'environnement `ADMIN_PASSWORD` sur Vercel, cochée pour les
trois environnements : **Production**, **Preview** et **Development**.

| Variable | Valeur |
|---|---|
| `ADMIN_PASSWORD` | Le mot de passe unique d'accès à la console |

La console est protégée sur **tous les déploiements**, y compris les URLs de
preview Vercel (qui sont publiques). Sans cookie de session valide, `/admin`
affiche la page de login. Le mot de passe n'est jamais exposé côté client : la
vérification se fait côté serveur (`app/api/admin-login`), et le cookie de
session (`admin_session`, httpOnly, ~30 jours) ne contient qu'un jeton dérivé.

La console est réservée au **desktop** : sous 1024 px de large, un écran
bloquant invite à se connecter depuis un ordinateur.

### 2. Propriété Notion `Format`

Dans la base Notion des retours (ID configuré via `NOTION_DATABASE_ID`), créer
manuellement une propriété de type **Select** nommée `Format`, avec deux
options :

- `desktop`
- `mobile`

Chaque ticket envoyé depuis la console renseigne ce champ selon l'état du
switcher au moment de l'annotation.

## Rappel des variables d'environnement

| Variable | Rôle |
|---|---|
| `ADMIN_PASSWORD` | Mot de passe d'accès à `/admin` (Prod + Preview + Dev) |
| `NOTION_TOKEN` | Token de l'intégration Notion |
| `NOTION_DATABASE_ID` | Base des tickets de retours |
