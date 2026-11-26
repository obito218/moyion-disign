# Pilotage MURELLE

Tableau de bord interne du projet MURELLE. Aucune dépendance à installer : Node.js 18+ suffit.

## Ouvrir le dashboard

**En ligne (recommandé)** : https://claude.ai/artifact/BCJaKKFdNmVFmncwPNewzT — privé, rien à installer, modifications enregistrées.

**En local** :

```bash
node pilotage/server.js
```

Puis ouvrir <http://localhost:4300> (autre port : `PORT=4400 node pilotage/server.js`).
Alternative : `npm run pilotage`.

Sans lancer le serveur, `pilotage/ETAT.md` donne un résumé à jour (lisible sur GitHub ou dans l'application Claude).

## Organisation

```
pilotage/
├── server.js        serveur local (interface + API)
├── cli.js           commandes utilisées par Claude Code
├── lib/store.js     lecture et écriture des fichiers JSON
├── lib/report.js    génération de ETAT.md
├── lib/model.js     logique partagée (calculs, validation, historique)
├── public/          interface (HTML, CSS, JS)
├── build-hosted.js  construit hosted/index.html (version publiée)
├── data/tasks.json  copie locale des tâches (référence : dashboard publié)
├── data/journal.json journal des interventions
├── REGLES.md        règles permanentes de mise à jour
└── ETAT.md          résumé généré
```

## Commandes

```bash
node pilotage/cli.js help
```
