# Pub garage — vidéo de 40 s (Remotion)

Vidéo verticale de 40 secondes (1080×1920, 30 i/s, H.264) pour présenter le système aux patrons de garages
indépendants, sur téléphone, pendant une visite. Les sous-titres sont incrustés et calés sur la voix :
la vidéo se comprend sans le son.

Rendu par défaut : [`out/pub-garage.mp4`](out/pub-garage.mp4).

## Déroulé

| Temps     | Voix (= sous-titre)                                       | Image                                                      |
| --------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| 0–4 s     | Vous êtes sous une voiture. Le téléphone sonne.           | Jambes du mécanicien sous la voiture, téléphone qui sonne  |
| 4–6,5 s   | Vous ne pouvez pas décrocher.                             | Écran verrouillé : « Appel manqué »                        |
| 6,5–10 s  | Le client, lui, appelle le garage d'en face.              | Rue : la voiture du client s'arrête chez « EN FACE »       |
| 10–15 s   | Avec ce système, le client reçoit tout de suite un SMS.   | **1 · LE SMS** — SMS de `nomGarage` envoyé depuis `numero` |
| 15–22 s   | Il clique sur le lien WhatsApp… / Une assistante…         | **2 · WHATSAPP** — la demande, puis la réponse avec `creneau` |
| 22–29 s   | Et vous, vous recevez une fiche. Le nom, la panne, le créneau. | **3 · LA FICHE** — une ligne apparaît à chaque mot dit |
| 29–32 s   | Les appels manqués redeviennent des rendez-vous.          | 3 cartes « Appel manqué » se retournent en « Rendez-vous » |
| 32–40 s   | 30 jours pour essayer, gratuitement. Sans engagement.     | Écran final « POUR `nomGarage` », signature Obito, Montsoult (95) |

## Rendre la vidéo

```bash
cd pub-garage
npm install                       # une seule fois
npx remotion render PubGarage out/pub-garage.mp4
```

Version personnalisée pour un garage (les props non précisées gardent leur valeur par défaut) :

```bash
npx remotion render PubGarage out/pub-tpa.mp4 --props='{"nomGarage":"TPA"}'
npx remotion render PubGarage out/pub-tpa.mp4 --props='{"nomGarage":"TPA","numero":"01 34 00 00 00","creneau":"Jeudi 9h30"}'
```

Sous Windows PowerShell, les guillemets du JSON posent problème. Mettez les props dans un fichier
(`tpa.json`), puis lancez `npx remotion render PubGarage out/pub-tpa.mp4 --props=tpa.json`.

Pour un aperçu dans le navigateur, avec les props modifiables à droite : `npm run studio`.

| Prop        | Défaut           | Où elle apparaît                                                          |
| ----------- | ---------------- | ------------------------------------------------------------------------- |
| `nomGarage` | `Garage Dupont`  | Expéditeur et texte du SMS, en-tête WhatsApp, fiche, « POUR … » à la fin  |
| `numero`    | `06 00 00 00 00` | Ligne « SMS · numéro » et lien `wa.me/33…`                                |
| `creneau`   | `Mardi 14h`      | Réponse de l'assistante, fiche, carte « Rendez-vous »                     |

La voix reste générique (« le client », « ce système ») : elle reste juste quelle que soit la personnalisation.

## Remplacer la voix de synthèse par la vôtre (recommandé)

Tout le minutage est calculé à partir des fichiers audio. Changer la voix ne demande aucune retouche du code.

1. Enregistrez les 12 phrases de [`src/voix/segments.json`](src/voix/segments.json), une par fichier.
2. Convertissez-les dans `public/voix/` sous les noms `01.wav` à `12.wav`, en normalisant le volume :
   ```bash
   npx remotion ffmpeg -i phrase01.m4a -ac 1 -ar 44100 -af loudnorm=I=-16:TP=-1.5 public/voix/01.wav
   ```
3. `npm run voix` : le script remesure chaque fichier (début et fin de parole, pauses) et met à jour
   `src/voix/mesures.json`. Il s'arrête en erreur si la voix finit trop tard pour tenir dans les 40 s.
4. Relancez le rendu. Les sous-titres et les animations suivent automatiquement.

Dans `segments.json` :
- `texte` : le sous-titre affiché ; les mots entre `*` sont en orange ;
- `pause` : le silence (en secondes) avant la phrase ;
- `prononciation` : le texte lu par la synthèse s'il diffère du sous-titre. Un `|` force une vraie pause.

Si vous enregistrez votre voix, supprimez la ligne de crédit de la voix de synthèse (`CREDIT_VOIX` dans
`src/scenes/Acte6Offre.tsx`).

## Régénérer la voix de synthèse

Cette étape est facultative : les fichiers sont déjà dans `public/voix/`.

```bash
python3 -m venv .venv && .venv/bin/pip install sherpa-onnx soundfile numpy
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2
tar -xjf kokoro-multi-lang-v1_0.tar.bz2
.venv/bin/python scripts/generer-voix.py --modele kokoro-multi-lang-v1_0   # --ids 05,06 pour ne refaire que certaines phrases
npm run voix
```

Les bruitages (sonnerie, SMS, bulles, cartes, tampon) sont synthétisés en code : `npm run sons`.

## Organisation du code

- `src/timeline.ts` : place les phrases à partir de `segments.json` et `mesures.json`. La voix pilote tout.
- `src/moments.ts` : les instants clés (sonnerie, SMS, clic…), partagés par les scènes et les bruitages.
- `src/scenes/Acte1Atelier.tsx` à `Acte6Offre.tsx` : les 6 tableaux.
- `src/composants/` : téléphone, bulles, voiture, pictogrammes, sous-titres, étiquette du haut, bruitages.
- `src/theme.ts` : la palette (graphite, orange sécurité, blanc cassé) et la police Barlow, chargée en local.
- `remotion.config.ts` : H.264, yuv420p, BT.709, CRF 18. Le fichier se lit partout, WhatsApp compris.

Mixage : la voix est à environ −15,5 LUFS, crête à −1,7 dBFS, pour un haut-parleur de téléphone. Les bruitages restent en dessous.

## Crédits et licences

- Illustrations, pictogrammes et bruitages : dessinés ou synthétisés dans ce code, sans banque d'images ni logo de marque.
- Police Barlow : SIL Open Font License 1.1 (`public/fonts/OFL-Barlow.txt`).
- Voix : Kokoro-82M (Apache 2.0), voix `ff_siwis` tirée du corpus SIWIS (CC BY 4.0). Le crédit apparaît en petit à la fin.
- Le numéro du client est volontairement masqué (`06 •• •• •• 34`) : la vidéo n'affiche le numéro de personne.
