# Pilotage MURELLE

Tableau de bord interne du projet MURELLE. Aucune dépendance à installer : Node.js 18+ suffit.

## Ouvrir le dashboard

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
├── lib/store.js     modèle de données, validation, calculs
├── lib/report.js    génération de ETAT.md
├── public/          interface (HTML, CSS, JS)
├── data/tasks.json  tâches (source de vérité)
├── data/journal.json journal des interventions
├── REGLES.md        règles permanentes de mise à jour
└── ETAT.md          résumé généré
```

## Commandes

```bash
node pilotage/cli.js help
```
