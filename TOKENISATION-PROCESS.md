# Process de tokenisation des composants (outil de retours)

> **Règle d'or — à appliquer SYSTÉMATIQUEMENT.**
> Tout composant ou bloc visible à l'écran doit produire, lorsqu'on le
> sélectionne dans l'outil de retours, un libellé **précis, complet et à jour**
> qui dit **QUOI** (la nature de l'élément) et **OÙ** (le conteneur qui le porte).
> Sans cela, les tickets remontés par la cliente sont ambigus et ne peuvent pas
> être traités correctement.
>
> Référence technique détaillée : [`FEEDBACK-TOKENS.md`](./FEEDBACK-TOKENS.md).

Ce document décrit **le process à suivre à chaque fois** qu'on crée ou modifie
un composant. Il est volontairement court et opérationnel.

---

## 1. Le modèle en deux attributs

| Attribut | À poser sur | Rôle | Exemple |
|----------|-------------|------|---------|
| `data-fb-container` | **conteneurs** : carte, encadré, section, footer, en-tête | le **OÙ** (contexte) | `data-fb-container="Carte service « Coordination & Optimisation »"` |
| `data-fb-label` | **feuilles particulières** : logo, icône isolée, étiquette, CTA, item de liste, lien spécifique | un **QUOI** explicite, prioritaire sur la déduction auto | `data-fb-label="Image avec le logo"` |
| `id="b-…"` | conteneurs (ancre stable) | identifiant repris dans l'**URL** du ticket Notion | `id="b-service-experience-client"` |

➡️ **La majorité des éléments n'ont AUCUN attribut.** Les titres, paragraphes,
eyebrows, images et icônes génériques sont décrits automatiquement par
`getElementLabel()` (dans `FeedbackWidget.tsx`). On n'annote **que** les
conteneurs et les quelques feuilles particulières.

---

## 2. Arbre de décision (à dérouler pour chaque nouvel élément)

```
L'élément est-il un CONTENEUR qui regroupe plusieurs sous-éléments
(carte, encadré, section, bandeau, aside, footer, en-tête) ?
│
├─ OUI → data-fb-container="<Nom court et parlant>"   + id="b-<slug>"
│        ex. "Section Tarifs", "Carte témoignage « Jean D. »"
│        → vérifier l'article dans FB_ARTICLES (la / le / l').
│
└─ NON → Est-ce un contenu texte autoporteur
         (titre, sous-titre, paragraphe, eyebrow, citation) ?
         │
         ├─ OUI → NE RIEN AJOUTER. C'est auto-déduit avec son texte réel.
         │        ("Le titre « … »", "La description avec « … »", …)
         │
         └─ NON → Est-ce une feuille « particulière » dont la nature ne se
                  devine pas seule (logo, icône isolée, étiquette/tag,
                  bouton, item de liste métier, lien spécifique) ?
                  │
                  ├─ OUI → data-fb-label="<QUOI explicite>"
                  │        ex. "Image avec le logo", "Étiquette « Nouveau »",
                  │            "Livrable « … »". Pour un <Button>, passer
                  │            les props `id` et `fbLabel`.
                  │
                  └─ NON (icône décorative, image avec alt) → RIEN, auto.
```

---

## 3. Conventions de nommage (vocabulaire QUOI)

Rester cohérent avec l'existant :

| Type | Format |
|------|--------|
| Section | `Section <Nom court>` |
| Carte | `Carte <type> « <titre réel> »` |
| Encadré | `Encadré <type> « <titre réel> »` |
| Bouton / CTA | `Bouton « <texte réel> »` |
| Lien | `Lien « <texte réel> »` |
| Image signifiante | `Image avec <description>` |
| Étiquette / tag | `Étiquette « <texte réel> »` |
| Item de liste métier | `Livrable « … »`, `Profil cible « … »`, `Modalité « … »` |

- **Identifiants** : `id="b-<contexte>-<slug>"`, slug généré avec `fbSlug()`
  (`app/lib/fbToken.ts`) pour rester stable et lisible.
- **Texte réel** : toujours injecter la **vraie valeur affichée** (props,
  données), jamais une valeur figée approximative. Tronquer uniquement
  au-delà de ~140 caractères.

---

## 4. Checklist à chaque MODIFICATION ou AJOUT de composant

- [ ] Tout nouveau **conteneur** porte `data-fb-container` + `id="b-…"`.
- [ ] Les **feuilles particulières** (logo, icône isolée, tag, CTA, item de
      liste, lien) portent un `data-fb-label` explicite.
- [ ] Les **contenus texte** (titres, paragraphes, eyebrows) restent **sans
      attribut** (déduction automatique).
- [ ] Les libellés utilisent la **vraie valeur** (titre/texte issu des props ou
      des données), pas une chaîne codée en dur obsolète.
- [ ] Si on **renomme un titre, change un texte ou une donnée**, vérifier que le
      libellé reflète bien la nouvelle valeur (souvent automatique, mais
      contrôler les `data-fb-*` codés en dur).
- [ ] Si le premier mot d'un nouveau conteneur n'est pas connu, ajouter son
      article dans `FB_ARTICLES` (`FeedbackWidget.tsx`).
- [ ] Mettre à jour l'inventaire dans [`FEEDBACK-TOKENS.md`](./FEEDBACK-TOKENS.md).
- [ ] **Tester** (voir §5).

---

## 5. Test rapide (obligatoire avant push)

1. `npm run build` doit passer.
2. Ouvrir l'outil de retours → « Retour sur un élément » → survoler/cliquer les
   nouveaux éléments.
3. Vérifier que le libellé affiché est **précis et complet** :
   - un titre → `Le titre « <texte exact> »`
   - une icône/un bouton/une image dans une carte → `… dans la <Carte/ Section …>`
   - aucune valeur tronquée de manière gênante, aucun « Section … » générique
     là où on attend un élément précis.

---

## 6. Pourquoi c'est non négociable

Chaque ticket Notion reçu par Mireille (et traité ensuite par Claude Code) doit
contenir **toutes les informations** pour localiser et corriger l'élément sans
aller-retour : la nature exacte, le contenu affiché, le conteneur et l'URL
d'ancre. Une tokenisation incomplète = un ticket inexploitable.
