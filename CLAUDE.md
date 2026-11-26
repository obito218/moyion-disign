# MURELLE — instructions permanentes pour Claude Code

MURELLE est une marque française de papier peint panoramique sur mesure, vendue sur Shopify
(boutique « Murelle », thème Horizon avec sections `murelle-*`).

## Tableau de pilotage — obligatoire à chaque intervention

Le projet est piloté par le tableau de bord interne `pilotage/`. Il doit refléter en permanence l'état réel du projet.
Les règles complètes sont dans **`pilotage/REGLES.md`** : les lire et les appliquer à chaque intervention.

Résumé :

1. Au début : `node pilotage/cli.js status` et `node pilotage/cli.js list --search "<sujet>"`.
2. Rattacher le travail aux tâches existantes ; ne pas créer de doublon.
3. Mettre à jour les statuts au fil du travail (`set <ID> --status …`).
4. « Terminé » uniquement pour un travail réellement réalisé **et vérifié**, avec `--evidence`.
   Une recommandation, un plan ou une action que l'utilisateur doit faire sur une plateforme externe ne sont jamais « Terminé » sans confirmation.
5. Ajouter les nouvelles tâches découvertes (`add`).
6. À la fin : une entrée de journal (`journal --summary … --result …`), puis `node pilotage/cli.js check`.

Ne jamais modifier `pilotage/data/*.json` ni `pilotage/ETAT.md` à la main : passer par la CLI.

## Séparation

`pilotage/` est un outil interne local. Il ne doit jamais être installé dans le thème Shopify public ni exposé aux clients.
