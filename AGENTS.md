<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:git-workflow-rules -->
# Règle absolue : branche de travail avant toute modification de fichier

Avant de toucher au moindre fichier, vérifier et basculer sur la branche de travail désignée par la session (ex. `claude/cool-albattani-i0a2md`). Ne jamais modifier un fichier en étant sur `home` ou `preview`.

Ordre impératif à chaque ticket :
1. `git branch --show-current` pour vérifier la branche active
2. Si ce n'est pas la branche de travail : `git checkout <branche-de-travail>` (ou `git checkout -b` si elle n'existe pas encore)
3. Modifier les fichiers
4. `git add + git commit`
5. Fusionner dans `preview` pour l'aperçu, puis dans `home` après le feu vert de Mireille

Ne jamais sauter l'étape 1-2. Un checkout refusé par Git en milieu de traitement bloque le déploiement et dégrade l'expérience de Mireille.
<!-- END:git-workflow-rules -->
