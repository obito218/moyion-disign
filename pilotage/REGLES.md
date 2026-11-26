# Règles permanentes de mise à jour du pilotage MURELLE

Ces règles s'appliquent à **chaque** intervention de Claude Code sur MURELLE, quel que soit le sujet demandé.
Elles ne dépendent d'aucune conversation précédente : tout l'état du projet est dans `pilotage/data/`.

## Fichiers

| Fichier | Rôle | Modification |
|---|---|---|
| `pilotage/data/tasks.json` | Toutes les tâches (source de vérité) | Uniquement via `node pilotage/cli.js` ou le dashboard |
| `pilotage/data/journal.json` | Journal chronologique des interventions | Uniquement via `node pilotage/cli.js journal` |
| `pilotage/ETAT.md` | Résumé lisible, régénéré automatiquement | Jamais à la main |
| `pilotage/REGLES.md` | Ce fichier | Seulement si l'utilisateur change les règles |

Ne jamais éditer les JSON à la main : la CLI valide les données, écrit l'historique de chaque tâche, met les dates et régénère `ETAT.md`. Les pourcentages ne sont **jamais** stockés : ils sont recalculés à chaque lecture à partir des statuts, donc toujours à jour.

## Déroulé obligatoire d'une intervention

1. **Avant de commencer** : `node pilotage/cli.js status`, puis `node pilotage/cli.js list --search "<mot-clé>"` pour retrouver les tâches liées à la demande.
2. **Identifier** les tâches concernées. Ne jamais recréer une tâche qui existe déjà (chercher par plusieurs mots-clés avant tout `add`).
3. **Commencer** une tâche → `set <ID> --status en_cours`.
4. **Terminer** une tâche → `set <ID> --status termine --evidence "<comment c'est vérifié>"` **uniquement** si le travail a été réellement réalisé **et** vérifié (fichier créé et testé, donnée lue dans Shopify après modification, etc.). La CLI refuse « termine » sans preuve.
5. **Impossible de terminer** → `bloque --reason "<raison précise>"` (obstacle qui empêche d'avancer) ou `en_attente --waiting fournisseur|externe|toi` (un tiers doit agir).
6. **Décision ou validation de l'utilisateur nécessaire** → `--status a_verifier --needs-user true --waiting toi`, avec dans `--note` ce qu'il doit décider.
7. **Nouvelle tâche découverte** → `add …` avec catégorie, phase, priorité, description claire et dépendances.
8. **Ne jamais supprimer** une tâche terminée : elle reste dans « Terminé ». Une suppression n'est faite qu'à la demande explicite de l'utilisateur.
9. **En fin d'intervention**, toujours : `node pilotage/cli.js journal --summary "…" --result "…" --done … --started … --added … --blocked … --validation … --files …`
10. **Vérifier** : `node pilotage/cli.js check` doit répondre `OK`, et `status` doit refléter les changements. Si le serveur tourne, le dashboard s'actualise seul (15 s).

## Ce qui ne compte JAMAIS comme « Terminé »

- Avoir donné une recommandation, une explication, un plan ou un prompt.
- Avoir écrit du code non testé.
- Une action à faire par l'utilisateur sur Shopify, OVH, un fournisseur, une banque, un réseau social ou toute plateforme externe, tant qu'il ne l'a pas confirmée (ou que Claude ne l'a pas constatée lui-même, par exemple en relisant la donnée dans l'API Shopify).
- Une décision qui appartient à l'utilisateur.

Dans ces cas : laisser la tâche ouverte, et noter dans `--note` ce qui a été fait et ce qui reste.

## Statuts

| id | Libellé | Quand l'utiliser |
|---|---|---|
| `a_faire` | À faire | Rien n'a commencé |
| `en_cours` | En cours | Travail commencé, pas fini |
| `a_verifier` | À vérifier | Résultat à confirmer, état incertain, ou décision de l'utilisateur attendue |
| `en_attente` | En attente | Un tiers (fournisseur, plateforme, client) doit agir |
| `bloque` | Bloqué | Obstacle qui empêche d'avancer — raison obligatoire |
| `termine` | Terminé | Réalisé **et** vérifié — preuve obligatoire |

## Identifiants

- Statuts, priorités, catégories, phases : `node pilotage/cli.js meta`.
- Priorités : `urgente`, `elevee`, `moyenne`, `basse`.
- `--waiting` : `aucun`, `toi`, `fournisseur`, `externe`.
- Phases `p01` (Fondations) à `p11` (Lancement).

## Exemples

```bash
node pilotage/cli.js set M-044 --status en_cours --note "Rédaction des meta descriptions commencée (12/24)"
node pilotage/cli.js set M-044 --status termine --evidence "24 fiches : seo.title et seo.description relus via l'API Shopify le 2026-12-02"
node pilotage/cli.js set M-009 --status bloque --reason "Le fournisseur ne répond pas depuis 7 jours"
node pilotage/cli.js add --title "Créer la collection Salon" --category catalogue --phase p03 --priority moyenne --depends M-021
node pilotage/cli.js journal --summary "Meta SEO des fiches" --result "24 fiches renseignées et vérifiées" --done M-044 --files "Shopify: produits"
```
