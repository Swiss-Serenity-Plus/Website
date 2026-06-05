#!/bin/bash
# Hook SessionStart — Claude Code on the web (Swiss Serenity Plus).
#
# But : préparer l'environnement à chaque session web pour que `npm run build`
# et `npm run lint` fonctionnent immédiatement (les dépendances ne sont pas
# présentes dans un conteneur fraîchement cloné).
#
# NOTE RÉSEAU / R2 : l'autorisation du domaine R2
# (pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev) relève de la POLITIQUE RÉSEAU de
# l'environnement, choisie dans l'app web Claude Code — un script ne peut pas
# ouvrir le sandbox réseau. Côté application, le chargement des fichiers R2 est
# déjà autorisé via next.config.ts (remotePatterns) ; côté site déployé (Vercel)
# les images R2 se chargent donc normalement.
set -euo pipefail

# Ne rien faire en local : ce hook cible les sessions distantes (web).
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Installe les dépendances (idempotent ; `install` profite du cache du conteneur).
npm install --no-audit --no-fund
