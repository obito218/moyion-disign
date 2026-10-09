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

## Voix off

La voix actuelle est **« Sylvestre – calme et chaleureux »**, tirée de la bibliothèque ElevenLabs (modèle `eleven_v4`).
Elle est lue en une seule prise pour garder un ton continu, puis découpée automatiquement en 12 phrases.
Les prises d'origine sont dans `voix-source/` : `variante1` est utilisée, `variante2` est la même voix avec une
interprétation un peu différente.

Tout le minutage part des fichiers audio : changer de voix ne demande aucune retouche du code. Les pauses entre phrases
s'allongent ou se resserrent selon le débit, pour que la voix finisse environ 3,5 s avant la fin. Si la voix est trop
lente pour tenir dans 40 s, `npm run voix` s'arrête en erreur.

### Changer de prise, ou installer une nouvelle prise ElevenLabs

```bash
.venv/bin/python scripts/decouper-prise.py voix-source/elevenlabs-sylvestre-variante2.mp3 \
  --whisper sherpa-onnx-whisper-small --sans-debruitage --credit "Voix de synthèse : ElevenLabs"
npm run voix
npx remotion render PubGarage out/pub-garage.mp4
```

`decouper-prise.py` reconnaît chaque phrase par transcription automatique et ignore les ratés et les phrases redites
(la dernière bonne prise gagne). Il met toutes les phrases au même niveau et signale celles qui sont mal reconnues.

Installation de l'outil, une seule fois (il faut aussi ffmpeg, sinon ajoutez `--ffmpeg "npx remotion ffmpeg"`) :

```bash
python3 -m venv .venv && .venv/bin/pip install sherpa-onnx soundfile numpy
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
tar -xjf sherpa-onnx-whisper-small.tar.bz2
```

Texte donné à ElevenLabs, en une seule génération. Gardez les `[long pause]` : ce sont eux qui permettent le découpage.

```
[warmly] Vous êtes sous une voiture. [long pause] Le téléphone sonne. [long pause] Vous ne pouvez pas décrocher. [long pause] Le client, lui, appelle le garage d'en face. [long pause] Avec ce système, le client reçoit tout de suite un SMS. [long pause] Il clique sur le lien WhatsApp et écrit sa demande. [long pause] Une assistante lui répond et propose un créneau. [long pause] Et vous, vous recevez une fiche. [long pause] Le nom du client… la panne… le créneau. [long pause] Les appels manqués redeviennent des rendez-vous. [long pause] 30 jours pour essayer, gratuitement. [long pause] Sans engagement.
```

### Enregistrer votre propre voix

Lisez les 12 phrases d'une traite au dictaphone du téléphone, avec environ 2 s de silence entre chaque, dans un endroit
calme (une voiture garée fait un très bon studio). Si vous vous trompez, redites simplement la phrase. Ensuite, lancez la même
commande sans `--sans-debruitage` ni `--credit` :

```bash
.venv/bin/python scripts/decouper-prise.py ma-prise.m4a --whisper sherpa-onnx-whisper-small
npm run voix
```

### Modifier le texte

Dans [`src/voix/segments.json`](src/voix/segments.json) :
- `texte` : le sous-titre affiché ; les mots entre `*` sont en orange ;
- `pause` : le silence (en secondes) avant la phrase, ajusté ensuite selon le débit ;
- `prononciation` : le texte lu par la synthèse locale s'il diffère du sous-titre. Un `|` force une vraie pause.

Après un changement de texte, refaites la prise (ElevenLabs ou votre voix), puis le découpage.

### Voix de synthèse locale (Kokoro)

C'est l'ancienne voix : gratuite et hors ligne, mais plus robotique. Elle sert de solution de secours.

```bash
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

Mixage : environ −15,8 LUFS, crête à −2,2 dBFS, pour un haut-parleur de téléphone. Les bruitages restent sous la voix.

## Crédits et licences

- Illustrations, pictogrammes et bruitages : dessinés ou synthétisés dans ce code, sans banque d'images ni logo de marque.
- Police Barlow : SIL Open Font License 1.1 (`public/fonts/OFL-Barlow.txt`).
- Voix : ElevenLabs, voix « Sylvestre – calme et chaleureux ». Sur l'offre gratuite, ElevenLabs interdit l'usage commercial
  et impose une mention. Pour diffuser cette pub, il faut un abonnement payant : vérifiez leurs conditions.
  La mention « Voix de synthèse : ElevenLabs » s'affiche en petit à la fin (`src/voix/source.json`, vide = rien d'affiché).
- Le numéro du client est volontairement masqué (`06 •• •• •• 34`) : la vidéo n'affiche le numéro de personne.
